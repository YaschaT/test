import { useState } from 'react';
import { Lock, Trophy } from 'lucide-react';
import { CardAction, DashboardCard } from './DashboardCard';
import { computeBadges, pickFeaturedBadge } from '../../lib/badges';
import type { ProgressState } from '../../lib/progressStore';

const ILLUSTRATION_BASE = '/assets/dashboard/redesign/achievements/';

/**
 * The featured achievement: whichever real badge the learner is closest to earning, with its supplied
 * illustration, live progress and the XP that work is worth. "View all" expands the full badge set in
 * place — there's no separate achievements page, and a link that went nowhere would be worse than none.
 */
export function AchievementCard({ progress, className = '' }: { progress: ProgressState; className?: string }) {
  const [showAll, setShowAll] = useState(false);
  const badges = computeBadges(progress);
  const featured = pickFeaturedBadge(badges);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <DashboardCard
      id="achievements-section"
      title="Latest Achievement"
      icon={<Trophy size={20} className="text-amber-500" aria-hidden="true" />}
      action={<CardAction onClick={() => setShowAll((v) => !v)}>{showAll ? 'Show less' : 'View all'}</CardAction>}
      className={`flex flex-col ${className}`}
    >
      {/* `flex-1` on the featured panel: when the card is stretched by the dashboard's flexible row the
          extra height lands inside this surface (content stays centred) instead of below it. */}
      <div className="mt-4 flex flex-1 items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-ink-line dark:bg-ink-800">
        <img
          src={`${ILLUSTRATION_BASE}${featured.asset}`}
          alt={`${featured.label} achievement`}
          width={72}
          height={72}
          className="h-18 w-18 shrink-0 object-contain"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-slate-900 dark:text-white">{featured.label}</p>
          <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{featured.description}</p>
          <div
            role="progressbar"
            aria-valuenow={featured.current}
            aria-valuemin={0}
            aria-valuemax={featured.target}
            aria-label={`${featured.label} progress`}
            className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700"
          >
            <div
              className="h-full rounded-full bg-iris-500 transition-[width] duration-500"
              style={{ width: `${Math.min(100, (featured.current / featured.target) * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            {featured.current} / {featured.target}
          </p>
        </div>

        <XpBadge xp={featured.xp} earned={featured.earned} />
      </div>

      {showAll && (
        <>
          <ul className="mt-4 grid grid-cols-4 gap-3">
            {badges.map((badge) => (
              <li
                key={badge.id}
                className="relative flex aspect-square items-center justify-center rounded-2xl border border-slate-200 p-2 dark:border-ink-line"
              >
                <img
                  src={`${ILLUSTRATION_BASE}${badge.asset}`}
                  alt={`${badge.label} — ${badge.description} (${badge.current} of ${badge.target}${badge.earned ? ', earned' : ''})`}
                  className={`h-full w-full object-contain ${badge.earned ? '' : 'opacity-30 grayscale'}`}
                />
                {!badge.earned && (
                  <Lock
                    size={12}
                    className="absolute bottom-1.5 right-1.5 text-slate-400 dark:text-slate-500"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            {earnedCount} of {badges.length} earned
          </p>
        </>
      )}
    </DashboardCard>
  );
}

/**
 * The supplied blank hexagon badge with the XP value rendered as real HTML on top — the number stays
 * dynamic and readable by a screen reader instead of being baked into the artwork.
 */
function XpBadge({ xp, earned }: { xp: number; earned: boolean }) {
  return (
    <div className="relative hidden h-[82px] w-[70px] shrink-0 sm:block">
      <img
        src={`${ILLUSTRATION_BASE}xp-badge.webp`}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain"
      />
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-xl font-extrabold text-white">+{xp}</span>
        <span className="mt-1 text-[13px] font-bold tracking-wide text-white/80">XP</span>
        <span className="sr-only">{earned ? 'earned' : 'reward for earning this achievement'}</span>
      </span>
    </div>
  );
}
