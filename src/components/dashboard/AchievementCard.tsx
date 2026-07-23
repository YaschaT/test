import { useNavigate } from 'react-router-dom';
import { Trophy, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { PrimaryButton } from '../PrimaryButton';
import { ProgressBar } from '../ui/ProgressBar';
import { computeBadges, pickFeaturedBadge } from '../../lib/badges';
import type { ProgressState } from '../../lib/progressStore';

const BADGE_ASSET_BASE = '/assets/dashboard/badges/';

/** Achievements section — uses the exact 8 medal-style SVG badges from the new asset pack
 * (kotobox_dashboard_claude_ready_assets/02_svg_icons/badges), one per real badge already computed from
 * progress data. No fake "Claim" reward economy: the featured slot's CTA is a real "Continue Learning"
 * link to whichever page actually earns progress toward it; once earned, the CTA is replaced by a plain
 * "Earned!" state since there's nothing left to claim. "View All"/"View All Achievements" are real (if
 * modest) actions — the grid below already shows every badge, so they focus/scroll this card into view
 * rather than linking to a separate page that doesn't exist yet. */
export function AchievementCard({ progress }: { progress: ProgressState }) {
  const navigate = useNavigate();
  const badges = computeBadges(progress);
  const earnedCount = badges.filter((b) => b.earned).length;
  const featured = pickFeaturedBadge(badges);

  function focusCard() {
    document.getElementById('achievements-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <DashboardCard
      title="Achievements"
      icon={<Trophy size={20} className="text-amber-500" />}
      action={
        <button type="button" onClick={focusCard} className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline shrink-0">
          View All
        </button>
      }
    >
      <div className="rounded-xl bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/40 dark:to-slate-900 border border-brand-100 dark:border-brand-900/50 p-4 space-y-3">
        <div className="flex items-center gap-4">
          <img src={`${BADGE_ASSET_BASE}${featured.asset}`} alt="" aria-hidden="true" className="w-[72px] h-[72px] shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-fluid-hero-sub font-bold text-slate-900 dark:text-white leading-tight">{featured.label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{featured.description}</p>
            <ProgressBar
              value={Math.round((featured.current / featured.target) * 100)}
              className="mt-2"
              label={`${featured.label} progress`}
            />
            <p className="mt-1 text-xs text-slate-400">
              {featured.current} / {featured.target}
            </p>
          </div>
        </div>
        {featured.earned ? (
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-2.5 text-sm font-bold">
            <CheckCircle2 size={16} />
            Earned!
          </div>
        ) : (
          <PrimaryButton onClick={() => navigate(featured.route)} className="w-full justify-center py-2.5">
            Continue Learning
          </PrimaryButton>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
        {badges.map((badge) => (
          <div
            key={badge.id}
            title={`${badge.label}: ${badge.description} (${badge.current}/${badge.target})`}
            className="relative flex items-center justify-center rounded-xl border border-slate-100 dark:border-slate-800 p-2.5 aspect-square"
          >
            <img
              src={`${BADGE_ASSET_BASE}${badge.asset}`}
              alt={badge.label}
              className={`w-full h-full object-contain ${badge.earned ? '' : 'grayscale opacity-30'}`}
            />
            {!badge.earned && (
              <Lock size={12} className="absolute bottom-1 right-1 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">{earnedCount}/{badges.length} earned</p>
        <button
          type="button"
          onClick={focusCard}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline"
        >
          View All Achievements
          <ArrowRight size={13} />
        </button>
      </div>
    </DashboardCard>
  );
}
