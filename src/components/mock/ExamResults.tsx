import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Minus, X as XIcon } from 'lucide-react';
import type { JlptLevel } from '../../types';
import type { MockQuestion } from '../../lib/mockExam';
import { SECTION_LABEL, scoreByContent, scoreExamOfficial } from '../../lib/mockExam';
import { SECTION_THEME } from './examTheme';
import { MASCOTS } from '../../lib/mascots';
import { XP_RULES } from '../../lib/xp';
import { playComplete, playMilestone } from '../../lib/sound';
import { useCountUp } from '../../lib/useCountUp';

interface ExamResultsProps {
  level: JlptLevel;
  questions: MockQuestion[];
  answers: (number | null)[];
  isNewBest: boolean;
  secondsUsed: number;
  onRetake: () => void;
  onExit: () => void;
}

const CONFETTI_COLORS = ['#4c6ef0', '#8b5cf6', '#10b981', '#f59e0b', '#e8735c'];

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function mmss(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/**
 * The score report.
 *
 * Two breakdowns sit here on purpose. The official scoring sections are what decide pass or fail —
 * you can clear the overall mark and still fail on one section's minimum, and that has to be said
 * plainly. The content bars underneath are what to *do* about it: they name the weakest part of the
 * paper, which is where the next twenty points actually are.
 */
export function ExamResults({
  level,
  questions,
  answers,
  isNewBest,
  secondsUsed,
  onRetake,
  onExit,
}: ExamResultsProps) {
  const result = scoreExamOfficial(level, questions, answers);
  const content = scoreByContent(questions, answers);
  const { scaled, total, overallPass, passed, failedOnSection, correct } = result;

  const xpEarned = correct * XP_RULES.quizCorrectAnswer;
  const shownScore = useCountUp(scaled, 1100);
  const confettiRef = useRef<HTMLDivElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [copied, setCopied] = useState<'no' | 'yes' | 'manual'>('no');
  const [barsIn, setBarsIn] = useState(false);

  // The bars fill after the score has begun counting, so the eye reads the headline first.
  useEffect(() => {
    const id = setTimeout(() => setBarsIn(true), 260);
    return () => clearTimeout(id);
  }, []);

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

  const shortfall = overallPass - scaled;
  const weakest = [...content].sort((a, b) => a.correct / a.total - b.correct / b.total)[0];

  const verdictSub = passed
    ? { en: `Above the ${overallPass}/${total} line, and every section clear.`, nl: `Boven de ${overallPass}/${total}-grens, en elke sectie gehaald.` }
    : failedOnSection
      ? { en: 'Your total was enough, but a section fell below its minimum.', nl: 'Je totaal was genoeg, maar één sectie bleef onder het minimum.' }
      : { en: `You need ${overallPass}/${total} to pass — ${shortfall} short.`, nl: `Je hebt ${overallPass}/${total} nodig — ${shortfall} tekort.` };

  const rankTitle = passed ? (scaled >= total * 0.78 ? 'Sharp' : 'Steady') : 'Climbing';

  const summary = `JLPT ${level} mock exam · ${scaled}/${total} (${passed ? 'pass' : 'not yet'}) · ${correct}/${questions.length} correct in ${mmss(secondsUsed)} — Kotobox`;

  /**
   * Copy, and when the browser refuses (blocked permission, insecure context, embedded webview) fall
   * back to putting the line on screen to copy by hand. Never claim a copy that didn't happen, and
   * never leave the click doing nothing at all.
   */
  async function share() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied('yes');
    } catch {
      setCopied('manual');
    }
  }

  return (
    <div className="space-y-6">
      <div ref={confettiRef} className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true" />

      <div className="text-center">
        <p className="text-xs font-extrabold tracking-[0.2em] text-slate-400 uppercase dark:text-slate-500">
          Score report · Scoreoverzicht
        </p>
        <div
          className={`mt-5 inline-flex flex-col items-center rounded-[32px] border px-10 py-9 sm:px-16 ${
            passed
              ? 'border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-transparent'
              : 'border-rose-500/20 bg-gradient-to-b from-rose-500/12 to-transparent'
          }`}
        >
          <p
            className={`text-[15px] font-extrabold tracking-[0.14em] ${
              passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-300'
            }`}
          >
            {passed ? 'PASS · GESLAAGD' : 'NOT YET · NOG NIET'}
          </p>
          <p className="mt-2.5 font-display text-[76px] leading-none font-semibold tracking-tight text-slate-900 tabular-nums sm:text-[98px] dark:text-white">
            {shownScore}
            <span className="font-sans text-[32px] font-extrabold text-slate-400 dark:text-slate-500"> / {total}</span>
          </p>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">{verdictSub.en}</p>
          <p className="text-sm text-slate-400 dark:text-slate-500">{verdictSub.nl}</p>
          {(isNewBest || xpEarned > 0) && (
            <p className="mt-3.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
              {isNewBest && <span className="font-bold text-amber-600 dark:text-amber-400">New best ✓</span>}
              {xpEarned > 0 && <span className="font-semibold text-brand-600 dark:text-brand-300">+{xpEarned} XP</span>}
            </p>
          )}
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7 dark:border-hairline dark:bg-ink-900">
          <h2 className="text-xs font-extrabold tracking-[0.16em] text-slate-400 uppercase dark:text-slate-500">
            By section · Per onderdeel
          </h2>

          <div className="mt-5 flex flex-col gap-4.5">
            {content.map((c, i) => {
              const theme = SECTION_THEME[c.section];
              const pct = c.total ? Math.round((c.correct / c.total) * 100) : 0;
              return (
                <div key={c.section}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {SECTION_LABEL[c.section].en}{' '}
                      <span className="text-[13px] font-semibold text-slate-400 dark:text-slate-500">
                        {SECTION_LABEL[c.section].nl}
                      </span>
                    </p>
                    <p
                      className={`text-[15px] font-extrabold tabular-nums ${
                        pct >= 60 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-300'
                      }`}
                    >
                      {c.correct} / {c.total}
                    </p>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${barsIn ? pct : 0}%`,
                        background: theme.hex,
                        transitionDelay: `${i * 110}ms`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* The official picture: this, not the bars above, is what passes or fails you. */}
          <div className="mt-6 border-t border-slate-200 pt-5 dark:border-white/[0.06]">
            <h3 className="text-xs font-extrabold tracking-[0.16em] text-slate-400 uppercase dark:text-slate-500">
              Official scoring · Officiële beoordeling
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
              {result.sections.map((s) => (
                <li
                  key={s.key}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-white/[0.03]"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.label.en}</span>
                  <span className="flex items-center gap-2.5 text-sm">
                    <span className="font-bold text-slate-900 tabular-nums dark:text-white">
                      {s.scaled}
                      <span className="font-medium text-slate-400 dark:text-slate-500">/{s.max}</span>
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        s.passed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                      }`}
                    >
                      {s.passed ? 'min met' : `needs ${s.min}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 border-t border-slate-200 pt-4 text-sm leading-relaxed text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
            {weakest && weakest.correct / weakest.total < 1 ? (
              <>
                Your weakest part is <strong className="text-slate-800 dark:text-slate-100">{SECTION_LABEL[weakest.section].en}</strong>{' '}
                at {weakest.correct}/{weakest.total} — that is where the next points are, so drill it before the
                real paper.
                <span className="mt-1 block text-slate-400 dark:text-slate-500">
                  Je zwakste onderdeel is {SECTION_LABEL[weakest.section].nl}. Daar zit de meeste winst.
                </span>
              </>
            ) : (
              <>
                Every section full marks. Move up a level and see where the ceiling is.
                <span className="mt-1 block text-slate-400 dark:text-slate-500">
                  Alles goed. Probeer een niveau hoger.
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#232c58] to-[#141a33] p-6">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-brand-300">RANK CARD</p>
            <div className="mt-4 flex items-center gap-4">
              <img
                src={MASCOTS['mock-exam']}
                alt=""
                aria-hidden="true"
                width={62}
                height={62}
                className="h-[62px] w-[62px] shrink-0 object-contain"
              />
              <div className="min-w-0">
                <p className="text-[26px] leading-tight font-black text-white">{rankTitle}</p>
                <p className="text-sm text-slate-400">
                  JLPT {level} mock · {scaled}/{total}
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <RankStat value={`${correct}/${questions.length}`} label="correct" />
              <RankStat value={mmss(secondsUsed)} label="time" />
              <RankStat value={level} label="level" />
            </div>
            <button
              onClick={share}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 px-4 py-3.5 text-[15px] font-extrabold text-slate-900 transition-transform hover:-translate-y-px active:translate-y-0"
            >
              {copied === 'yes' ? 'Copied ✓' : 'Share rank card'}
            </button>
            {copied === 'manual' && (
              <p className="mt-2.5 rounded-xl bg-white/5 px-3 py-2 text-[12.5px] leading-relaxed text-slate-300 select-all">
                {summary}
              </p>
            )}
          </div>

          <div className="flex gap-3.5 rounded-3xl border border-slate-200 bg-white px-5 py-4 dark:border-hairline dark:bg-ink-900">
            <img
              src={MASCOTS['mock-exam']}
              alt=""
              aria-hidden="true"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <p>
              <span className="block text-[15px] leading-snug font-bold text-slate-800 dark:text-slate-100">
                {passed ? 'You cleared it. Set the next target higher.' : 'That is your mark to beat now. One more sitting?'}
              </span>
              <span className="mt-0.5 block text-[13px] leading-snug text-slate-500 dark:text-slate-400">
                {passed ? 'Gehaald. Zet de lat hoger.' : 'Dat is nu je norm. Nog een poging?'}
              </span>
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={onRetake}
              className="flex-1 rounded-2xl bg-gradient-to-b from-[#5b6bff] to-iris-600 px-4 py-4 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-px active:translate-y-0"
            >
              Retake · Opnieuw
            </button>
            <button
              onClick={onExit}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-4 text-[15px] font-extrabold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-white/[0.12] dark:text-slate-400 dark:hover:border-white/25 dark:hover:text-white"
            >
              Back to start
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-hairline dark:bg-ink-900">
        <button
          onClick={() => setReviewOpen((v) => !v)}
          aria-expanded={reviewOpen}
          className="flex w-full items-center justify-between rounded-3xl px-6 py-4 text-left"
        >
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Review all {questions.length} answers · Bekijk je antwoorden
          </span>
          <ChevronDown size={18} aria-hidden="true" className={`text-slate-400 transition-transform ${reviewOpen ? 'rotate-180' : ''}`} />
        </button>
        {reviewOpen && (
          <ul className="grid gap-3 px-6 pb-6 lg:grid-cols-2 2xl:grid-cols-3">
            {questions.map((q, i) => {
              const chosen = answers[i];
              const isCorrect = chosen === q.correctIndex;
              const unanswered = chosen === null;
              return (
                <li key={q.id} className="animate-review-reveal-in rounded-2xl border border-slate-200 p-4 dark:border-hairline">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white ${
                        isCorrect ? 'bg-emerald-500' : unanswered ? 'bg-slate-400' : 'bg-rose-500'
                      }`}
                    >
                      {isCorrect ? (
                        <Check size={12} strokeWidth={3} aria-hidden="true" />
                      ) : unanswered ? (
                        <Minus size={12} strokeWidth={3} aria-hidden="true" />
                      ) : (
                        <XIcon size={12} strokeWidth={3} aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {i + 1}. {SECTION_LABEL[q.section].en}
                      </p>
                      {(q.japanese || q.audioText) && (
                        <p className="jp-text mt-0.5 text-base font-semibold text-slate-900 dark:text-white">
                          {q.japanese ?? q.audioText}
                        </p>
                      )}
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{q.prompt.en}</p>
                      <p className="mt-2 text-sm">
                        <span className="text-emerald-600 dark:text-emerald-400">✓ {q.options[q.correctIndex]}</span>
                        {!isCorrect && !unanswered && (
                          <span className="mt-0.5 block text-rose-500 dark:text-rose-400">✗ You chose: {q.options[chosen]}</span>
                        )}
                        {unanswered && <span className="mt-0.5 block text-slate-400">— Not answered</span>}
                      </p>
                      {q.explanation && (
                        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{q.explanation.en}</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function RankStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="text-[19px] font-black text-white tabular-nums">{value}</p>
      <p className="text-[11px] text-slate-400">{label}</p>
    </div>
  );
}
