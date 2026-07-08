import type { ReactNode } from 'react';
import { Card } from '../Card';
import { ENTRANCE_ANIMATION_CLASSES, getEntranceDelayMs } from '../../lib/entranceAnimation';

interface GrammarStatCardProps {
  icon: ReactNode;
  iconBg: string;
  value: ReactNode;
  label: string;
  /** Position within the stats row — drives the entrance stagger. Omit to skip animating. */
  index?: number;
}

/** One of the Grammar stats row's four cards — same icon-circle + value + label shape as the
 * Dashboard's StatCard, so this row reads as the same product rather than a one-off. */
export function GrammarStatCard({ icon, iconBg, value, label, index }: GrammarStatCardProps) {
  return (
    <Card
      className={`p-4 flex items-center gap-3 ${index !== undefined ? ENTRANCE_ANIMATION_CLASSES : ''}`}
      style={index !== undefined ? { animationDelay: `${getEntranceDelayMs(index)}ms` } : undefined}
    >
      <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">{value}</div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{label}</p>
      </div>
    </Card>
  );
}
