import { useCallback, useEffect, useMemo, useState } from 'react';
import { X, Flag, ChevronLeft, ChevronRight, LayoutGrid, Check, Volume2, Loader2 } from 'lucide-react';
import type { MockExamConfig, MockQuestion } from '../../lib/mockExam';
import { SECTION_LABEL } from '../../lib/mockExam';
import { SECTION_THEME } from './examTheme';
import { playCardTap } from '../../lib/sound';
import { getSavedVoiceMode, useTtsPlayer } from '../../lib/tts/ttsService';

interface ExamRuntimeProps {
  questions: MockQuestion[];
  config: MockExamConfig;
  onFinish: (answers: (number | null)[]) => void;
  onExit: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ExamRuntime({ questions, config, onFinish, onExit }: ExamRuntimeProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set());
  const [secondsLeft, setSecondsLeft] = useState(config.minutes * 60);
  const [showPalette, setShowPalette] = useState(false);
  const [confirming, setConfirming] = useState<null | 'exit' | 'finish'>(null);
  // Transcript reveal is keyed to the question index, so it resets automatically on navigation.
  const [transcriptIdx, setTranscriptIdx] = useState<number | null>(null);
  const tts = useTtsPlayer(getSavedVoiceMode());

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const answeredCount = answers.filter((a) => a !== null).length;
  const total = questions.length;

  // Position of this question within its own section (e.g. "Kanji 3 / 8").
  const sectionInfo = useMemo(() => {
    const sameSection = questions.filter((q) => q.section === question.section);
    const within = questions.slice(0, index + 1).filter((q) => q.section === question.section).length;
    return { within, count: sameSection.length };
  }, [questions, index, question.section]);

  const finish = useCallback(() => onFinish(answers), [onFinish, answers]);

  // Countdown — auto-submits at zero.
  useEffect(() => {
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, finish]);

  // On opening a listening question, play the clip once (like the real test). tts.play reads fresh
  // state internally, so depending only on `index` is correct here.
  useEffect(() => {
    const q = questions[index];
    if (q.section === 'listening' && q.audioText) void tts.play(q.audioText, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const select = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[index] = optionIndex;
        return next;
      });
      playCardTap();
    },
    [index],
  );

  const goNext = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total]);
  const goPrev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const toggleFlag = useCallback(() => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, [index]);

  // Keyboard: 1-4 / A-D select, ← → navigate, F flag.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (confirming) return;
      const k = e.key.toLowerCase();
      const numeric = Number(k);
      if (numeric >= 1 && numeric <= question.options.length) {
        select(numeric - 1);
      } else if (['a', 'b', 'c', 'd'].includes(k) && LETTERS.indexOf(k.toUpperCase()) < question.options.length) {
        select(LETTERS.indexOf(k.toUpperCase()));
      } else if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (k === 'f') {
        toggleFlag();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirming, question.options.length, select, goNext, goPrev, toggleFlag]);

  const theme = SECTION_THEME[question.section];
  const SectionIcon = theme.icon;
  const timeLow = secondsLeft <= config.minutes * 60 * 0.2;
  const timeCritical = secondsLeft <= 30;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl flex-col">
      {/* Sticky exam header — sits below the mobile app header (h-14), flush to the top on desktop
          where the app uses a sidebar instead of a top bar. */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-slate-200 bg-canvas-light/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:top-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setConfirming('exit')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X size={16} /> Exit
          </button>
          <div
            role="timer"
            aria-label="Time remaining"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tabular-nums transition-colors ${
              timeCritical
                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                : timeLow
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            } ${timeCritical ? 'animate-pop' : ''}`}
          >
            {mmss(secondsLeft)}
          </div>
          <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">
            {index + 1}<span className="text-slate-300 dark:text-slate-600"> / {total}</span>
          </span>
        </div>
        {/* Segmented progress: one tick per question, colored by section, filled when answered */}
        <div className="mt-2.5 flex gap-0.5" aria-hidden="true">
          {questions.map((q, i) => {
            const t = SECTION_THEME[q.section];
            const isAnswered = answers[i] !== null;
            const isCurrent = i === index;
            return (
              <span
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor: isCurrent
                    ? t.hex
                    : isAnswered
                      ? `${t.hex}99`
                      : undefined,
                }}
                data-empty={!isAnswered && !isCurrent}
              />
            );
          })}
        </div>
      </div>

      {/* Question body */}
      <div key={index} className="animate-review-reveal-in flex flex-1 flex-col pt-6">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${theme.chip}`}>
            <SectionIcon size={13} strokeWidth={2.4} />
            {SECTION_LABEL[question.section].en}
          </span>
          <span className="text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
            {sectionInfo.within} / {sectionInfo.count}
          </span>
          {flagged.has(index) && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Flag size={12} className="fill-current" /> Flagged
            </span>
          )}
        </div>

        {question.context && (
          <p className="mt-4 text-sm italic text-slate-400 dark:text-slate-500">{question.context.en}</p>
        )}

        {question.section === 'listening' && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-4">
              <button
                onClick={() => question.audioText && tts.play(question.audioText, 1)}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] text-white shadow-[0_8px_20px_-8px_rgba(58,84,214,0.8)] transition hover:brightness-110 active:scale-95"
                aria-label="Play audio again"
              >
                {tts.state.status === 'loading' ? <Loader2 size={22} className="animate-spin" /> : <Volume2 size={22} />}
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Listen, then choose the meaning</p>
                <button
                  onClick={() => setTranscriptIdx((v) => (v === index ? null : index))}
                  className="mt-0.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {transcriptIdx === index ? 'Hide transcript' : 'Can’t hear it? Show transcript'}
                </button>
                {transcriptIdx === index && <p className="jp-text mt-1.5 text-base text-slate-700 dark:text-slate-200">{question.audioText}</p>}
              </div>
            </div>
            {tts.state.status === 'error' && (
              <p className="mt-2 text-xs text-rose-500 dark:text-rose-400">Audio isn’t available here — use the transcript to answer.</p>
            )}
          </div>
        )}

        {question.japanese && (
          <p className="jp-text mt-3 text-3xl font-bold leading-snug text-slate-900 dark:text-white sm:text-4xl">
            {question.japanese}
          </p>
        )}

        <p className="mt-3 text-[15px] font-medium text-slate-700 dark:text-slate-200">
          {question.prompt.en}
          <span className="mt-0.5 block text-sm font-normal text-slate-400 dark:text-slate-500">{question.prompt.nl}</span>
        </p>

        <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, i) => {
            const selected = answers[index] === i;
            return (
              <button
                key={i}
                role="radio"
                aria-checked={selected}
                onClick={() => select(i)}
                className={`group flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-all ${
                  selected
                    ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/15'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold transition-colors ${
                    selected
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {selected ? <Check size={15} strokeWidth={3} /> : LETTERS[i]}
                </span>
                <span className={`jp-text text-[15px] ${selected ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer nav */}
        <div className="mt-auto flex items-center gap-2 pt-6">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            onClick={toggleFlag}
            aria-pressed={flagged.has(index)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
              flagged.has(index)
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-300'
                : 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Flag size={15} className={flagged.has(index) ? 'fill-current' : ''} />
          </button>
          <button
            onClick={() => setShowPalette((v) => !v)}
            aria-pressed={showPalette}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <LayoutGrid size={15} />
          </button>
          {isLast ? (
            <button
              onClick={() => setConfirming('finish')}
              className="ml-auto flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(58,84,214,0.8)] transition hover:brightness-110 active:scale-[0.98]"
            >
              Finish exam <Check size={16} />
            </button>
          ) : (
            <button
              onClick={goNext}
              className="ml-auto flex items-center gap-1 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Question palette */}
        {showPalette && (
          <div className="animate-review-reveal-in mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{answeredCount} of {total} answered</span>
              <span className="flex items-center gap-1"><Flag size={11} className="fill-amber-500 text-amber-500" /> {flagged.size} flagged</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
              {questions.map((q, i) => {
                const isAnswered = answers[i] !== null;
                const isCurrent = i === index;
                const isFlagged = flagged.has(i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setIndex(i);
                      setShowPalette(false);
                    }}
                    className={`relative grid aspect-square place-items-center rounded-lg text-xs font-bold tabular-nums transition-all ${
                      isCurrent
                        ? 'bg-brand-600 text-white ring-2 ring-brand-300 ring-offset-1 dark:ring-offset-slate-900'
                        : isAnswered
                          ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/25 dark:text-brand-200'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                    style={{ borderBottomColor: SECTION_THEME[q.section].hex }}
                  >
                    {i + 1}
                    {isFlagged && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirm overlays */}
      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="animate-pop w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {confirming === 'exit' ? 'Leave the exam?' : 'Finish and submit?'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {confirming === 'exit'
                ? 'Your progress on this attempt will be discarded.'
                : answeredCount < total
                  ? `You have ${total - answeredCount} unanswered ${total - answeredCount === 1 ? 'question' : 'questions'}. They’ll be marked wrong.`
                  : 'All questions answered. Ready to see your score?'}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Keep going
              </button>
              <button
                onClick={() => (confirming === 'exit' ? onExit() : finish())}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white ${
                  confirming === 'exit' ? 'bg-red-600 hover:bg-red-500' : 'bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] hover:brightness-110'
                }`}
              >
                {confirming === 'exit' ? 'Leave' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
