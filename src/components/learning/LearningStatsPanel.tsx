import { Layers, Clock, CheckCircle2, Flame, type LucideIcon } from 'lucide-react';
import { RingStat } from '../dashboard/RingStat';
import { LearningStatItem } from './LearningStatItem';
import { useCountUp } from '../../lib/useCountUp';
import type { LearningStats } from '../../lib/learningState';

interface LearningStatsPanelProps {
  stats: LearningStats;
  learnedLabel: string;
  unitLabelPlural: string;
  ringIcon: LucideIcon;
  mascotSrc: string;
  mascotWidth: number;
  mascotHeight: number;
  /** Both default to true; Vocabulary turns them off to keep its panel to the 3 stats that matter for a
   * word bank (streak is already shown on the Dashboard, and the raw count reads fine without a percent
   * restating it) — Kanji keeps the full 4-stat/percent version. */
  showLongestStreak?: boolean;
  showLearnedPercent?: boolean;
}

/** Shared "hero stats" panel used by both the Vocabulary and Kanji pages — same night-sky background,
 * progress ring, mascot, and 4-stat row, differing only in the ring's icon/label and which mascot pose sits
 * beside it, so both screens read as the same product rather than two one-off designs. */
export function LearningStatsPanel({
  stats,
  learnedLabel,
  unitLabelPlural,
  ringIcon: RingIcon,
  mascotSrc,
  mascotWidth,
  mascotHeight,
  showLongestStreak = true,
  showLearnedPercent = true,
}: LearningStatsPanelProps) {
  const displayLearnedCount = useCountUp(stats.learnedCount);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 min-h-[150px] flex items-center">
      <img
        src="/assets/kotobox-dashboard/generated/hero-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-10 w-full p-5 sm:p-6 flex flex-wrap items-center gap-x-8 gap-y-5">
        <div className="flex items-center gap-4 shrink-0">
          <RingStat progress={stats.learnedPercent / 100} color="#8b7cf6" trackColor="#ffffff" size={72} strokeWidth={7}>
            <RingIcon size={22} className="text-white/80" aria-hidden="true" />
          </RingStat>
          <div>
            <p className="text-2xl sm:text-[1.75rem] font-bold text-white leading-tight">
              {displayLearnedCount} <span className="text-base font-medium text-slate-400">/ {stats.totalCount}</span>
            </p>
            <p className="text-sm font-semibold text-slate-200 leading-tight">{learnedLabel}</p>
            {showLearnedPercent && (
              <p className="text-xs text-slate-400 leading-tight">{stats.learnedPercent}% of all {unitLabelPlural}</p>
            )}
          </div>
        </div>

        <img
          src={mascotSrc}
          alt=""
          aria-hidden="true"
          width={mascotWidth}
          height={mascotHeight}
          className="shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] hidden sm:block"
        />

        <div className="grid grid-cols-2 gap-x-4 gap-y-5 basis-full sm:basis-auto sm:flex sm:flex-1 sm:flex-wrap sm:gap-x-8 sm:pl-6 sm:border-l sm:border-white/10">
          <LearningStatItem icon={Layers} iconBg="bg-blue-500/20" iconColor="text-blue-300" value={stats.newCount} label="New to Learn" helper="Ready to start" />
          <LearningStatItem icon={Clock} iconBg="bg-amber-500/20" iconColor="text-amber-300" value={stats.reviewDueCount} label="Review Due" helper="Keep your streak" />
          <LearningStatItem icon={CheckCircle2} iconBg="bg-emerald-500/20" iconColor="text-emerald-300" value={stats.masteredCount} label="Mastered" helper="Solid knowledge" />
          {showLongestStreak && (
            <LearningStatItem icon={Flame} iconBg="bg-sky-500/20" iconColor="text-sky-300" value={stats.longestStreak} label="Longest Streak" helper="Keep it going!" />
          )}
        </div>
      </div>
    </div>
  );
}
