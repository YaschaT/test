import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ListChecks, X } from 'lucide-react';
import { playCorrect, playWrong } from '../../lib/sound';
import { ProgressBar } from '../ui/ProgressBar';
import type { QuizQuestion } from '../../types';

interface GrammarPracticeProps {
  questions: QuizQuestion[];
  onExit: () => void;
  onFinish: (correct: number, total: number) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** One-question-at-a-time practice matching the reference: lettered options, inline correct/incorrect
 * feedback, a progress bar, and the mascot cheering alongside. Answering marks progress; finishing
 * reports the score up so the lesson can be marked complete. */
export function GrammarPractice({ questions, onExit, onFinish }: GrammarPracticeProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const answered = selected !== null;
  const isCorrect = answered && selected === question.correctIndex;
  const progressPct = ((index + (answered ? 1 : 0)) / total) * 100;

  function select(i: number) {
    if (answered) return;
    setSelected(i);
    if (i === question.correctIndex) {
      setCorrectCount((c) => c + 1);
      playCorrect();
    } else {
      playWrong();
    }
  }

  function next() {
    if (isLast) {
      onFinish(correctCount, total);
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
  }

  // Number keys pick an option; Enter advances once answered.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return;
      if (e.key === 'Enter' && answered) {
        e.preventDefault();
        next();
        return;
      }
      const n = Number(e.key);
      if (!answered && n >= 1 && n <= question.options.length) {
        e.preventDefault();
        select(n - 1);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141d36] via-[#0f1830] to-[#0b1222] p-6 lg:p-8 min-h-[560px]">
      {/* Header: back, progress, exit */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to lesson
        </button>
        <div className="flex flex-1 items-center gap-3">
          <ProgressBar value={progressPct} onDark className="flex-1" label="Practice progress" />
          <span className="text-sm font-semibold text-white/70 tabular-nums shrink-0">
            {index + 1} / {total}
          </span>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-colors shrink-0"
        >
          <X size={14} aria-hidden="true" /> Exit practice
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-300">
            <ListChecks size={13} aria-hidden="true" /> Practice
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">Choose the correct answer.</h2>
          {question.japanesePrompt && (
            <p className="jp-text mt-2 text-lg text-slate-200">{question.japanesePrompt}</p>
          )}
          <p className="mt-1.5 text-slate-400">{question.prompt.en}</p>

          {/* Options */}
          <div className="mt-6 space-y-3" role="radiogroup" aria-label="Answer options">
            {question.options.map((option, i) => (
              <OptionRow
                key={i}
                letter={LETTERS[i]}
                text={option}
                answered={answered}
                isSelected={selected === i}
                isCorrect={i === question.correctIndex}
                onSelect={() => select(i)}
              />
            ))}
          </div>
        </div>

        {/* Mascot */}
        <div className="relative hidden lg:flex w-[240px] shrink-0 items-center justify-center self-stretch">
          {answered && isCorrect && <Sparkles />}
          <img
            src="/assets/grammar/mascotte-grammar.png"
            alt=""
            aria-hidden="true"
            className={`relative w-[210px] transition-transform duration-300 ${
              answered && isCorrect ? 'scale-105 -rotate-2' : answered ? 'opacity-90' : ''
            }`}
          />
        </div>
      </div>

      {/* Feedback bar */}
      {answered && (
        <div
          className={`mt-2 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between animate-review-reveal-in ${
            isCorrect
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-rose-500/40 bg-rose-500/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            >
              {isCorrect ? (
                <Check size={20} strokeWidth={3} className="text-white" aria-hidden="true" />
              ) : (
                <X size={20} strokeWidth={3} className="text-white" aria-hidden="true" />
              )}
            </span>
            <div>
              <p className="text-lg font-bold text-white">{isCorrect ? 'Correct!' : 'Not quite'}</p>
              <p className="text-sm text-slate-300">
                {isCorrect
                  ? 'Good job!'
                  : `Correct answer: ${LETTERS[question.correctIndex]}. ${question.options[question.correctIndex]}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={next}
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(58,84,214,0.8)] transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            {isLast ? 'Finish' : 'Continue'}
            <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function OptionRow({
  letter,
  text,
  answered,
  isSelected,
  isCorrect,
  onSelect,
}: {
  letter: string;
  text: string;
  answered: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  onSelect: () => void;
}) {
  const showCorrect = answered && isCorrect;
  const showWrong = answered && isSelected && !isCorrect;

  const shell = showCorrect
    ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-500/15 to-transparent'
    : showWrong
      ? 'border-rose-500/60 bg-rose-500/10 animate-shake'
      : answered
        ? 'border-white/10 opacity-55'
        : 'border-white/12 bg-white/[0.03] hover:border-brand-400/60 hover:bg-white/[0.06]';

  const badge = showCorrect
    ? 'bg-emerald-500 text-white'
    : showWrong
      ? 'bg-rose-500 text-white'
      : 'bg-white/10 text-slate-300';

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      disabled={answered}
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${shell} ${
        answered ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${badge}`}>
        {letter}
      </span>
      <span className="jp-text min-w-0 flex-1 text-lg text-white">{text}</span>
      <StatusDot show={showCorrect ? 'correct' : showWrong ? 'wrong' : 'none'} />
    </button>
  );
}

function StatusDot({ show }: { show: 'correct' | 'wrong' | 'none' }) {
  if (show === 'correct') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500">
        <Check size={14} strokeWidth={3} className="text-white" aria-hidden="true" />
      </span>
    );
  }
  if (show === 'wrong') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500">
        <X size={14} strokeWidth={3} className="text-white" aria-hidden="true" />
      </span>
    );
  }
  return <span className="h-6 w-6 shrink-0 rounded-full border-2 border-white/20" aria-hidden="true" />;
}

/** Small celebratory sparkle field behind the mascot when the answer is correct. */
function Sparkles() {
  const dots = [
    { top: '8%', left: '18%', size: 10, delay: '0ms' },
    { top: '22%', left: '72%', size: 14, delay: '80ms' },
    { top: '46%', left: '6%', size: 8, delay: '160ms' },
    { top: '62%', left: '80%', size: 12, delay: '120ms' },
    { top: '80%', left: '30%', size: 9, delay: '200ms' },
    { top: '14%', left: '48%', size: 7, delay: '60ms' },
  ];
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute animate-pop text-amber-300"
          style={{ top: d.top, left: d.left, animationDelay: d.delay }}
        >
          <svg width={d.size} height={d.size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l2.6 8.4L23 11l-8.4 2.6L12 22l-2.6-8.4L1 11l8.4-2.6z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
