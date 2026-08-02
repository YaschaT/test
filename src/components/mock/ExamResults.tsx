import { useEffect, useRef, useState } from 'react';
import { Sparkles, RotateCcw, ChevronDown, Check, X as XIcon, Minus } from 'lucide-react';
import type { JlptLevel } from '../../types';
import type { MockQuestion } from '../../lib/mockExam';
import { SECTION_LABEL, scoreByContent, scoreExamOfficial } from '../../lib/mockExam';
import { SECTION_THEME } from './examTheme';
import { ScoreRing } from './ScoreRing';
import { Mascot } from '../Mascot';
import { PrimaryButton } from '../PrimaryButton';
import { XP_RULES } from '../../lib/xp';
import { playComplete, playMilestone } from '../../lib/sound';

interface ExamResultsProps {
  level: JlptLevel;
  questions: MockQuestion[];
  answers: (number | null)[];
  isNewBest: boolean;
  onRetake: () => void;
  onExit: () => void;
}

const CONFETTI_COLORS = ['#4c6ef0', '#8b5cf6', '#10b981', '#f59e0b', '#e8735c'];

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ExamResults({ level, questions, answers, isNewBest, onRetake, onExit }: ExamResultsProps) {
  const result = scoreExamOfficial(level, questions, answers);
  const content = scoreByContent(questions, answers);
  const { scaled, total, overallPass, passed, failedOnSection, correct } = result;
  const xpEarned = correct * XP_RULES.quizCorrectAnswer;
  const confettiRef = useRef<HTMLDivElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (passed) playMilestone();
    else playComplete();
    if (!passed || prefersReducedMotion()) return;
    const container = confettiRef.current;
    if (!container) return;
    const pieces: HTMLSpanElement[] = [];
    for (let i = 0; i < 70; i++) {
      const span = document.createElement('span');
      span.className = 'absolute top-0 rounded-sm animate-confetti-fall';
      span.style.left = `${Math.random() * 100}%`;
      span.style.width = `${6 + Math.random() * 6}px`;
      span.style.height = `${4 + Math.random() * 5}px`;
      span.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      span.style.animationDelay = `${Math.random() * 0.5}s`;
      span.style.animationDuration = `${1.6 + Math.random() * 1.1}s`;
      container.appendChild(span);
      pieces.push(span);
    }
    return () => pieces.forEach((p) => p.remove());
  }, [passed]);

  const ringColor = passed ? '#10b981' : '#f59e0b';
  const shortfall = overallPass - scaled;

  const subtitle = passed
    ? { en: 'You cleared the overall mark and every section — strong work.', nl: 'Je haalde de totaalgrens én elke sectie — knap werk.' }
    : failedOnSection
      ? { en: 'Your total was high enough, but one section fell below its minimum.', nl: 'Je totaal was hoog genoeg, maar één sectie bleef onder het minimum.' }
      : { en: `${shortfall} point${shortfall === 1 ? '' : 's'} short of the ${overallPass}/${total} pass mark. Keep at it.`, nl: `${shortfall} punt${shortfall === 1 ? '' : 'en'} onder de slaaggrens van ${overallPass}/${total}. Blijf oefenen.` };

  return (
    <div className="mx-auto max-w-2xl">
      <div ref={confettiRef} className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true" />

      {/* Verdict */}
      <div className="text-center">
        <Mascot size={44} mood={passed ? 'happy' : 'neutral'} className="mx-auto" />
        <p className={`mt-3 text-sm font-bold uppercase tracking-wide ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {level} Mock Exam
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {passed ? 'You passed!' : failedOnSection ? 'So close' : 'Not quite yet'}
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-slate-500 dark:text-slate-400">
          {subtitle.en}
          <span className="mt-0.5 block text-sm text-slate-400 dark:text-slate-500">{subtitle.nl}</span>
        </p>
      </div>

      {/* Scaled score ring (0–180, official scale) */}
      <div className="mt-6 flex flex-col items-center">
        <ScoreRing percent={scaled / total} color={ringColor} threshold={overallPass / total} size={208}>
          <span className="text-5xl font-bold tabular-nums text-slate-900 dark:text-white">{scaled}</span>
          <span className="mt-1 text-sm font-medium text-slate-400 dark:text-slate-500">of {total}</span>
          <span className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">pass mark {overallPass}</span>
        </ScoreRing>
        <div className="mt-4 flex items-center gap-2">
          {isNewBest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              <Sparkles size={13} /> New personal best
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
            +{xpEarned} XP
          </span>
        </div>
      </div>

      {/* Official scoring sections — scaled score + sectional pass/fail */}
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Scoring sections</h2>
        <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">You must reach each section’s minimum, not just the overall mark.</p>
        <div className="space-y-4">
          {result.sections.map((s) => {
            const pct = s.scaled / s.max;
            const minPct = s.min / s.max;
            return (
              <div key={s.key}>
                <div className="mb-1.5 flex items-center gap-2 text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{s.label.en}</span>
                  <span className="ml-auto font-semibold tabular-nums text-slate-500 dark:text-slate-400">{s.scaled}/{s.max}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                      s.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                    }`}
                  >
                    {s.passed ? <><Check size={11} strokeWidth={3} /> pass</> : `needs ${s.min}`}
                  </span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{ width: `${pct * 100}%`, backgroundColor: s.passed ? '#10b981' : '#f59e0b' }}
                  />
                  {/* sectional minimum marker */}
                  <span className="absolute top-0 h-full w-0.5 bg-slate-400 dark:bg-slate-500" style={{ left: `${minPct * 100}%` }} aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Content detail (raw correct per content section) */}
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          {content.map((c) => {
            const theme = SECTION_THEME[c.section];
            const Icon = theme.icon;
            return (
              <span key={c.section} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Icon size={13} className={theme.text} strokeWidth={2.2} />
                {SECTION_LABEL[c.section].en} <span className="tabular-nums text-slate-400 dark:text-slate-500">{c.correct}/{c.total}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Review answers */}
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <button onClick={() => setReviewOpen((v) => !v)} aria-expanded={reviewOpen} className="flex w-full items-center justify-between rounded-3xl px-6 py-4 text-left">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Review all {questions.length} answers</span>
          <ChevronDown size={18} className={`text-slate-400 transition-transform ${reviewOpen ? 'rotate-180' : ''}`} />
        </button>
        {reviewOpen && (
          <ul className="space-y-3 px-6 pb-6">
            {questions.map((q, i) => {
              const chosen = answers[i];
              const isCorrect = chosen === q.correctIndex;
              const unanswered = chosen === null;
              return (
                <li key={q.id} className="animate-review-reveal-in rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${isCorrect ? 'bg-emerald-500' : unanswered ? 'bg-slate-400' : 'bg-red-500'}`}>
                      {isCorrect ? <Check size={12} strokeWidth={3} /> : unanswered ? <Minus size={12} strokeWidth={3} /> : <XIcon size={12} strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{i + 1}. {SECTION_LABEL[q.section].en}</p>
                      {(q.japanese || q.audioText) && <p className="jp-text mt-0.5 text-base font-semibold text-slate-900 dark:text-white">{q.japanese ?? q.audioText}</p>}
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{q.prompt.en}</p>
                      <p className="mt-2 text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">✓ {q.options[q.correctIndex]}</span>
                        {!isCorrect && !unanswered && <span className="mt-0.5 block text-red-500 dark:text-red-400">✗ You chose: {q.options[chosen]}</span>}
                        {unanswered && <span className="mt-0.5 block text-slate-400">— Not answered</span>}
                      </p>
                      {q.explanation && <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{q.explanation.en}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <PrimaryButton onClick={onRetake} className="flex-1 !py-3">
          <RotateCcw size={16} /> Retake exam
        </PrimaryButton>
        <button onClick={onExit} className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          Back to overview
        </button>
      </div>
    </div>
  );
}
