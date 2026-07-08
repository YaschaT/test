import { Headphones } from 'lucide-react';
import { Card } from '../Card';
import { RingStat } from '../dashboard/RingStat';

interface ListeningSessionProgressProps {
  index: number;
  total: number;
  correctCount: number;
}

/**
 * A real, honest session-progress panel — position in the session (a genuine bounded ratio, matching
 * the RingStat contract everywhere else in the app) and the running correct-answer count. Deliberately
 * does not include a per-skill "minutes today" goal or a weekly streak calendar: neither exists as real,
 * per-listening-skill data in the progress store (only aggregate daily minutes and an overall streak do),
 * and inventing skill-specific numbers to fill the space would violate "real data, always."
 */
export function ListeningSessionProgress({ index, total, correctCount }: ListeningSessionProgressProps) {
  const progress = total > 0 ? index / total : 0;

  return (
    <Card className="p-5 flex items-center gap-4">
      <RingStat progress={progress} color="var(--color-brand-500)" size={64} strokeWidth={6}>
        <Headphones size={20} className="text-brand-500" aria-hidden="true" />
      </RingStat>
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {index} <span className="text-sm font-medium text-slate-400">/ {total}</span>
        </p>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-tight">Questions</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{correctCount} correct so far</p>
      </div>
    </Card>
  );
}
