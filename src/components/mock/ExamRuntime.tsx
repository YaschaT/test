import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Flag, LayoutGrid, Volume2, Loader2 } from 'lucide-react';
import type { MockExamConfig, MockQuestion } from '../../lib/mockExam';
import { SECTION_LABEL } from '../../lib/mockExam';
import { SECTION_THEME } from './examTheme';
import { playCardTap } from '../../lib/sound';
import { getSavedVoiceMode, useTtsPlayer } from '../../lib/tts/ttsService';

interface ExamRuntimeProps {
  questions: MockQuestion[];
  config: MockExamConfig;
  /** `secondsUsed` is wall-clock time on the paper — the results screen reports it back. */
  onFinish: (answers: (number | null)[], secondsUsed: number) => void;
  onExit: () => void;
}

function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * The exam room. Dark in both themes on purpose: for the twenty-odd minutes the clock is running this
 * is the only thing on screen, and the surrounding app — sidebar, light page, everything else you
 * could be doing — should stop competing with the paper.
 *
 * The clock does not stop. It auto-submits at zero, leaving discards the attempt, and blanks score
 * zero; all three are stated up front on the lobby and again in the confirm dialogs, because a timed
 * assessment is the one place in the app where a surprise is a real cost to the learner.
 */
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
  const total = questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const blanks = total - answeredCount;

  // Position of this question within its own section (e.g. "Kanji 3 / 8").
  const sectionInfo = useMemo(() => {
    const sameSection = questions.filter((q) => q.section === question.section);
    const within = questions.slice(0, index + 1).filter((q) => q.section === question.section).length;
    return { within, count: sameSection.length };
  }, [questions, index, question.section]);

  const finish = useCallback(
    () => onFinish(answers, config.minutes * 60 - secondsLeft),
    [onFinish, answers, config.minutes, secondsLeft],
  );

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

  // Keyboard: 1–4 select, ← → navigate, F flag, Escape asks to leave.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (confirming) {
        if (e.key === 'Escape') setConfirming(null);
        return;
      }
      const k = e.key.toLowerCase();
      const numeric = Number(k);
      if (numeric >= 1 && numeric <= question.options.length) {
        select(numeric - 1);
      } else if (e.key === 'ArrowRight') {
        goNext();
      } else if (e.key === 'ArrowLeft') {
        goPrev();
      } else if (k === 'f') {
        toggleFlag();
      } else if (e.key === 'Escape') {
        setConfirming('exit');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirming, question.options.length, select, goNext, goPrev, toggleFlag]);

  const theme = SECTION_THEME[question.section];
  const timeLow = secondsLeft <= config.minutes * 60 * 0.2;
  const timeCritical = secondsLeft <= 30;

  const answerSheet = (columns: string) => (
    <div className={`grid gap-1.5 ${columns}`}>
      {questions.map((_, i) => {
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
            aria-label={`Go to question ${i + 1}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged' : ''}`}
            aria-current={isCurrent ? 'true' : undefined}
            className={`grid aspect-square place-items-center rounded-lg border text-xs font-extrabold tabular-nums transition-colors ${
              isCurrent ? 'border-brand-300' : 'border-transparent'
            } ${
              isFlagged
                ? 'bg-amber-500 text-amber-950'
                : isAnswered
                  ? 'bg-iris-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="-mx-4 -my-4 flex min-h-[calc(100dvh-3.5rem)] flex-col bg-[#0a0f1d] text-slate-200 md:-mx-8 md:-my-8 md:min-h-dvh 2xl:-mx-10">
      {/* The clock as a line across the whole screen — readable from the corner of your eye without
          looking away from the question. */}
      <div className="h-[3px] w-full bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-iris-500 to-brand-300 transition-[width] duration-1000 ease-linear"
          style={{ width: `${(secondsLeft / (config.minutes * 60)) * 100}%` }}
        />
      </div>

      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5 sm:px-7 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-5">
        <div className="flex min-w-0 items-center gap-3.5">
          <button
            onClick={() => setConfirming('exit')}
            className="flex items-center gap-2 rounded-xl border border-white/10 py-2 pr-4 pl-3 text-sm font-bold text-slate-400 transition-colors hover:border-white/25 hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Leave exam</span>
            <span className="sm:hidden">Leave</span>
          </button>
          <span className="hidden text-[13px] font-extrabold tracking-[0.12em] whitespace-nowrap text-slate-400 sm:inline">
            JLPT {config.level}
          </span>
        </div>

        <div
          role="timer"
          aria-label="Time remaining"
          className={`flex items-center gap-2.5 rounded-2xl border border-white/[0.08] px-5 py-2 transition-colors md:justify-self-center ${
            timeCritical || timeLow ? 'bg-rose-500/15 text-rose-300' : 'bg-white/[0.04] text-brand-300'
          }`}
        >
          <span aria-hidden="true" className="exam-pulse h-[7px] w-[7px] rounded-full bg-current" />
          <span className="text-[22px] font-black tabular-nums">{mmss(secondsLeft)}</span>
        </div>

        <div className="flex items-center justify-end gap-3.5">
          <span className="text-sm whitespace-nowrap text-slate-400 tabular-nums">
            {index + 1} / {total}
          </span>
          <button
            onClick={() => setShowPalette((v) => !v)}
            aria-pressed={showPalette}
            aria-label="Answer sheet"
            className="rounded-xl border border-white/10 p-2 text-slate-400 transition-colors hover:border-white/25 hover:text-white lg:hidden"
          >
            <LayoutGrid size={16} aria-hidden="true" />
          </button>
          <button
            onClick={() => setConfirming('finish')}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold whitespace-nowrap text-slate-400 transition-colors hover:border-white/25 hover:text-white"
          >
            Hand in
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_248px]">
        <div key={index} className="animate-review-reveal-in mx-auto flex w-full max-w-[820px] flex-1 flex-col px-5 py-8 sm:px-8 sm:py-12">
          <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
            <span className="text-[13px] font-extrabold tracking-[0.16em] text-slate-400">
              QUESTION {index + 1}
            </span>
            <span className="text-[13px] text-slate-500">
              <span style={{ color: theme.hex }}>{SECTION_LABEL[question.section].en}</span> ·{' '}
              {SECTION_LABEL[question.section].nl} · {sectionInfo.within}/{sectionInfo.count}
            </span>
            {flagged.has(index) && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Flag size={12} className="fill-current" aria-hidden="true" /> Flagged
              </span>
            )}
          </div>

          {question.context && <p className="mt-4 text-sm text-slate-500 italic">{question.context.en}</p>}

          {question.section === 'listening' && (
            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => question.audioText && tts.play(question.audioText, 1)}
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#6b78ff] to-iris-600 text-white shadow-[0_10px_24px_-10px_var(--color-iris-500)] transition hover:brightness-110 active:scale-95"
                  aria-label="Play audio again"
                >
                  {tts.state.status === 'loading' ? (
                    <Loader2 size={22} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Volume2 size={22} aria-hidden="true" />
                  )}
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100">Listen, then choose the meaning</p>
                  <button
                    onClick={() => setTranscriptIdx((v) => (v === index ? null : index))}
                    className="mt-0.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
                  >
                    {transcriptIdx === index ? 'Hide transcript' : 'Can’t hear it? Show transcript'}
                  </button>
                  {transcriptIdx === index && (
                    <p className="jp-text mt-1.5 text-base text-slate-200">{question.audioText}</p>
                  )}
                </div>
              </div>
              {tts.state.status === 'error' && (
                <p className="mt-2 text-xs text-rose-300">Audio isn’t available here — use the transcript to answer.</p>
              )}
            </div>
          )}

          {question.japanese && (
            <p className="jp-text mt-5 text-[28px] leading-relaxed font-medium text-white sm:text-[34px]">
              {question.japanese}
            </p>
          )}

          <p className="mt-2.5 text-[15px] text-slate-400">
            {question.prompt.en} · <span className="text-slate-500">{question.prompt.nl}</span>
          </p>

          <div className="mt-8 flex flex-col gap-2.5" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, i) => {
              const selected = answers[index] === i;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => select(i)}
                  className={`flex w-full items-center gap-4 rounded-[18px] border px-5 py-4 text-left transition-[transform,background,border-color] duration-150 hover:translate-x-[3px] ${
                    selected ? 'border-brand-300/60 bg-iris-500/15' : 'border-white/[0.07] bg-white/[0.025]'
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-[15px] font-black transition-colors ${
                      selected ? 'bg-iris-500 text-white' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="jp-text text-lg text-slate-100 sm:text-[22px]">{option}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-9 flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="rounded-2xl border border-white/[0.12] px-6 py-3.5 text-[15px] font-bold text-slate-400 transition-colors hover:border-white/25 hover:text-white disabled:opacity-50 disabled:hover:border-white/[0.12] disabled:hover:text-slate-400"
            >
              Back
            </button>
            <button
              onClick={toggleFlag}
              aria-pressed={flagged.has(index)}
              className={`rounded-2xl border px-6 py-3.5 text-[15px] font-bold transition-colors ${
                flagged.has(index)
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                  : 'border-white/[0.12] text-slate-400 hover:border-white/25 hover:text-white'
              }`}
            >
              {flagged.has(index) ? 'Flagged ✓' : 'Flag · Markeer'}
            </button>
            <div className="flex-1" />
            <button
              onClick={() => (isLast ? setConfirming('finish') : goNext())}
              className="rounded-2xl bg-gradient-to-b from-[#5b6bff] to-iris-600 px-7 py-3.5 text-base font-extrabold text-white shadow-[0_12px_28px_-14px_var(--color-iris-500)] transition-transform hover:-translate-y-px active:translate-y-0"
            >
              {isLast ? 'Hand in' : 'Next question'}
            </button>
          </div>

          <p className="mt-4 text-[12.5px] text-slate-500">Keys: 1–4 to answer · ← → to move · F to flag</p>

          {showPalette && (
            <div className="animate-review-reveal-in mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 lg:hidden">
              <p className="mb-3 text-xs font-bold text-slate-400">
                {answeredCount} of {total} answered · {flagged.size} flagged
              </p>
              {answerSheet('grid-cols-8 sm:grid-cols-10')}
            </div>
          )}
        </div>

        <aside className="hidden border-l border-white/[0.06] bg-white/[0.012] px-5 py-6 lg:block">
          <h2 className="text-[11.5px] font-extrabold tracking-[0.16em] text-slate-400">ANSWER SHEET</h2>
          <p className="mb-3.5 text-[11.5px] text-slate-500">ANTWOORDBLAD</p>
          {answerSheet('grid-cols-6')}
          <ul className="mt-4.5 flex flex-col gap-1.5 text-[12.5px] text-slate-400">
            <Legend className="bg-iris-600">Answered · Beantwoord</Legend>
            <Legend className="bg-amber-500">Flagged · Gemarkeerd</Legend>
            <Legend className="bg-white/[0.08]">Blank · Leeg</Legend>
          </ul>
          <p className="mt-4.5 border-t border-white/[0.06] pt-4 text-[13px] text-slate-400">
            {blanks === 0 ? 'All questions answered.' : `${blanks} still blank · ${blanks} nog leeg`}
          </p>
        </aside>
      </div>

      {confirming && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#060912]/75 p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="animate-review-reveal-in w-full max-w-[460px] rounded-[26px] border border-white/10 bg-gradient-to-b from-[#171e3c] to-[#101528] p-7">
            <h2 className="text-[22px] font-black text-white">
              {confirming === 'exit' ? 'Leave the exam?' : 'Hand in your paper?'}
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-400">
              {confirming === 'exit'
                ? 'The timer stops and your answers are discarded. Nothing is scored.'
                : blanks === 0
                  ? `All ${total} answered${flagged.size ? `, ${flagged.size} still flagged` : ''}. This is scored immediately.`
                  : `${blanks} question${blanks === 1 ? '' : 's'} still blank${
                      flagged.size ? ` and ${flagged.size} flagged` : ''
                    }. Blanks score zero.`}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
              {confirming === 'exit'
                ? 'De timer stopt en je antwoorden vervallen.'
                : blanks === 0
                  ? 'Alles ingevuld. Wordt direct beoordeeld.'
                  : `${blanks} vragen nog leeg. Lege antwoorden tellen als nul.`}
            </p>
            <div className="mt-6 flex gap-2.5">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 rounded-[15px] border border-white/15 px-4 py-3.5 text-[15px] font-extrabold text-slate-300 transition-colors hover:border-white/30"
              >
                {confirming === 'exit' ? 'Keep going' : 'Keep working'}
              </button>
              <button
                onClick={() => (confirming === 'exit' ? onExit() : finish())}
                className={`flex-1 rounded-[15px] px-4 py-3.5 text-[15px] font-extrabold text-white transition hover:brightness-110 ${
                  confirming === 'exit'
                    ? 'bg-gradient-to-b from-rose-500 to-rose-700'
                    : 'bg-gradient-to-b from-[#5b6bff] to-iris-600'
                }`}
              >
                {confirming === 'exit' ? 'Leave exam' : 'Hand in'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span aria-hidden="true" className={`inline-block h-[11px] w-[11px] rounded ${className}`} />
      {children}
    </li>
  );
}
