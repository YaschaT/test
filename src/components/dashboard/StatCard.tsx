import type { ReactNode } from 'react';
import { Card } from '../Card';
import { RingStat } from './RingStat';
import { ENTRANCE_ANIMATION_CLASSES, getEntranceDelayMs } from '../../lib/entranceAnimation';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  /** Usually a short string; accepts a node so a card can swap in a richer sublabel (e.g. a locked/disabled hint with an icon) while keeping the same shape as its siblings. */
  sublabel: ReactNode;
  ringProgress: number;
  ringColor: string;
  /** Position within the stat row — drives the entrance stagger. Omit to skip animating. */
  index?: number;
}

/** One of the four top stat cards — a real, bounded ring (see RingStat) with the metric's icon centered,
 * next to the primary number and a short supporting line (best streak, goal, etc). Label/sublabel wrap
 * instead of truncating so short-but-real copy never clips mid-word on the narrow mobile 2-column grid. */
export function StatCard({ icon, label, value, sublabel, ringProgress, ringColor, index }: StatCardProps) {
  return (
    <Card
      className={`p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 ${index !== undefined ? ENTRANCE_ANIMATION_CLASSES : ''}`}
      style={index !== undefined ? { animationDelay: `${getEntranceDelayMs(index)}ms` } : undefined}
    >
      <RingStat progress={ringProgress} color={ringColor} size={78} strokeWidth={6} displaySize="clamp(52px, 35px + 2.7vw, 78px)">
        {icon}
      </RingStat>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-snug">{label}</p>
        <p className="text-fluid-stat-value font-bold text-slate-900 dark:text-white leading-tight mt-1 whitespace-nowrap">
          {value}
        </p>
        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 leading-snug mt-0.5">{sublabel}</p>
      </div>
    </Card>
  );
}
