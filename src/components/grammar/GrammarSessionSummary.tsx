import { useEffect } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { GrammarBilingual, Eyebrow } from './GrammarBilingual';
import { TIER_NAME } from '../../lib/grammarDrills';
import { MASCOTS } from '../../lib/mascots';
import { markStudyMoment } from '../../lib/releaseNotes';
import type { GrammarDrillTier, GrammarPoint, Translatable } from '../../types';

/** One drill that needed a second look, with the answer it wanted and why. */
export interface WeakDrill {
  id: string;
  answer: string;
  why: Translatable;
}

export interface TierStat {
  tier: GrammarDrillTier;
  firstTryCorrect: number;
  total: number;
}

interface GrammarSessionSummaryProps {
  point: GrammarPoint;
  tierStats: TierStat[];
  firstTryCorrect: number;
  total: number;
  /** Measured against a snapshot taken before the session — the real delta, milestones included. */
  xpEarned: number;
  masteryBefore: number;
  masteryAfter: number;
  /** When this point is genuinely next scheduled, straight off its SRS card. */
  dueLabel: string;
  weak: WeakDrill[];
  nextPoint: GrammarPoint | null;
  onRestart: () => void;
  onNext: () => void;
  onBackToList: () => void;
}

/**
 * The end of a practice run — what the session actually bought.
 *
 * Every number here is measured, not estimated: XP is the difference between two real reads of the
 * derived score, mastery is the point's own SRS interval before and after, and the schedule line is
 * the date the scheduler really set.
 */
export function GrammarSessionSummary({
  point,
  tierStats,
  firstTryCorrect,
  total,
  xpEarned,
  masteryBefore,
  masteryAfter,
  dueLabel,
  weak,
  nextPoint,
  onRestart,
  onNext,
  onBackToList,
}: GrammarSessionSummaryProps) {
  // Finishing a session is the one moment a release note is welcome: the intention the learner arrived
  // with is spent, and they are already looking at a "what now" screen. See lib/releaseNotes.ts.
  useEffect(markStudyMoment, []);

  const accuracy = total > 0 ? Math.round((firstTryCorrect / total) * 100) : 0;
  const clean = weak.length === 0;

  const title = clean
    ? 'Clean run.'
    : accuracy >= 60
      ? `Solid — ${point.title} is sticking.`
      : 'Good work. A few to revisit.';
  const subtitle = clean
    ? `First attempt correct on all ${total} steps.`
    : `${weak.length} step${weak.length > 1 ? 's' : ''} needed a second look. They come back with this pattern's next review.`;

  return (
    <div className="animate-review-reveal-in">
      <div className="text-center">
        <img
          src={MASCOTS.grammar}
          alt=""
          aria-hidden="true"
          className="mx-auto h-24 w-24 object-contain"
        />
        <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-2.5 max-w-[52ch] text-[15px] text-slate-300 text-pretty">{subtitle}</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard value={`+${xpEarned}`} label="XP earned" tone="emerald" />
        <StatCard value={`${accuracy}%`} label="First try" />
        <StatCard
          value={`${masteryAfter}%`}
          label="Mastery"
          tone="brand"
          foot={
            masteryAfter > masteryBefore
              ? `up from ${masteryBefore}%`
              : masteryBefore === masteryAfter
                ? 'unchanged'
                : `down from ${masteryBefore}%`
          }
        />
      </div>

      <div className="mt-3 rounded-2xl border border-white/[0.06] bg-[#0c1222] px-5 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <Eyebrow tone="muted">First try, by tier</Eyebrow>
          <span className="text-[12.5px] text-slate-400">{weakestLine(tierStats, clean)}</span>
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {tierStats.map((stat) => {
            const pct = stat.total > 0 ? Math.round((stat.firstTryCorrect / stat.total) * 100) : 0;
            const fill = pct === 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-brand-500' : 'bg-amber-500';
            return (
              <li key={stat.tier} className="flex items-center gap-4">
                <span className="w-[104px] shrink-0 text-[13px] font-semibold text-slate-200">
                  {TIER_NAME[stat.tier].en}
                </span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <span className={`block h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
                </span>
                <span className="w-12 shrink-0 text-right text-[12.5px] font-bold tabular-nums text-slate-300">
                  {stat.firstTryCorrect} / {stat.total}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3 rounded-2xl border border-white/[0.06] bg-[#0c1222] px-5 py-5">
        <Eyebrow tone="muted">Coming back for review</Eyebrow>
        <p className="mt-2.5 text-[15px] text-white">
          <span className="jp-text font-semibold">{point.title}</span>{' '}
          <span className="font-semibold text-amber-300">· {dueLabel}</span>
        </p>
        {weak.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
            {weak.map((item) => (
              <li key={item.id}>
                <p className="jp-text text-[15px] text-white">{item.answer}</p>
                <GrammarBilingual text={item.why} size="sm" className="mt-1" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 border-t border-white/[0.06] pt-4 text-sm text-slate-400">
            Nothing to redo — every step was right first time.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        {nextPoint ? (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#6460e5] to-[#5050d5] px-6 py-4 text-[15px] font-semibold text-white shadow-[0_4px_0_0_#3d3aa8] transition-[filter,transform] duration-150 hover:brightness-110 active:translate-y-1 active:shadow-none"
          >
            <span className="min-w-0 truncate">
              Next lesson: <span className="jp-text">{nextPoint.title}</span>
            </span>
            <ArrowRight size={17} aria-hidden="true" className="shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onBackToList}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#6460e5] to-[#5050d5] px-6 py-4 text-[15px] font-semibold text-white shadow-[0_4px_0_0_#3d3aa8] transition-[filter,transform] duration-150 hover:brightness-110 active:translate-y-1 active:shadow-none"
          >
            Back to Grammar
          </button>
        )}
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-6 py-4 text-[15px] font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={16} aria-hidden="true" /> Again
        </button>
      </div>
    </div>
  );
}

function weakestLine(tierStats: TierStat[], clean: boolean): string {
  if (clean) return 'Nothing to shore up — every tier clean.';
  const worst = tierStats
    .filter((t) => t.total > 0)
    .slice()
    .sort((a, b) => a.firstTryCorrect / a.total - b.firstTryCorrect / b.total)[0];
  return worst ? `Weakest tier: ${TIER_NAME[worst.tier].en}.` : '';
}

function StatCard({
  value,
  label,
  tone,
  foot,
}: {
  value: string;
  label: string;
  tone?: 'emerald' | 'brand';
  foot?: string;
}) {
  const color = tone === 'emerald' ? 'text-emerald-400' : tone === 'brand' ? 'text-brand-300' : 'text-white';
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0c1222] px-4 py-5 text-center">
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
      <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</p>
      {foot && <p className="mt-1 text-[11.5px] text-slate-500">{foot}</p>}
    </div>
  );
}
