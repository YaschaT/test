import { CheckCircle2, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { GrammarStatCard } from './GrammarStatCard';
import { useCountUp } from '../../lib/useCountUp';

interface GrammarStatsGridProps {
  completedCount: number;
  remainingCount: number;
  nextTitle: string | null;
}

/**
 * Four real metrics under the hero. "Review due" is honestly always 0 — Grammar has no SRS/interval
 * system behind it (unlike Vocabulary/Kanji), so there is no real due-for-review count to show; 0 is
 * the accurate value, not a placeholder (and not worth animating, since 0 → 0 is a no-op).
 */
export function GrammarStatsGrid({ completedCount, remainingCount, nextTitle }: GrammarStatsGridProps) {
  const displayCompleted = useCountUp(completedCount);
  const displayRemaining = useCountUp(remainingCount);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <GrammarStatCard
        icon={<CheckCircle2 size={20} className="text-brand-600 dark:text-brand-300" aria-hidden="true" />}
        iconBg="bg-brand-500/15"
        value={displayCompleted}
        label="Completed"
        index={0}
      />
      <GrammarStatCard
        icon={<Sparkles size={20} className="text-violet-600 dark:text-violet-300" aria-hidden="true" />}
        iconBg="bg-violet-500/15"
        value={displayRemaining}
        label="Practice available"
        index={1}
      />
      <GrammarStatCard
        icon={<Clock size={20} className="text-amber-600 dark:text-amber-300" aria-hidden="true" />}
        iconBg="bg-amber-500/15"
        value={0}
        label="Review due"
        index={2}
      />
      <GrammarStatCard
        icon={<ArrowRight size={20} className="text-slate-600 dark:text-slate-300" aria-hidden="true" />}
        iconBg="bg-slate-500/15"
        value={<span className="jp-text text-base">{nextTitle ?? 'All done!'}</span>}
        label="Next up"
        index={3}
      />
    </div>
  );
}
