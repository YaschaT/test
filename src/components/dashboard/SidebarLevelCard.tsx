import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { RingStat } from './RingStat';
import type { JlptLevel } from '../../types';

interface SidebarLevelCardProps {
  level: JlptLevel;
  /** Share of the current level's curriculum completed, 0–100 (see dashboardStats.levelProgressPercent). */
  percent: number;
}

/** Foot of the sidebar: how far through the current JLPT level the learner is, linking to the full
 * learning path. The number is derived from real completions, never a stored or example value. */
export function SidebarLevelCard({ level, percent }: SidebarLevelCardProps) {
  return (
    <NavLink
      to="/path"
      className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50 dark:border-ink-line dark:bg-ink-900 dark:hover:bg-ink-800"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-slate-500 dark:text-slate-400">{level} Progress</span>
        <span className="mt-0.5 block text-xl font-extrabold text-slate-900 dark:text-white">{percent}%</span>
      </span>
      <RingStat progress={percent / 100} color="var(--color-iris-500)" size={44} strokeWidth={5}>
        <span className="sr-only">{percent}% complete</span>
      </RingStat>
      <ChevronRight size={18} className="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
    </NavLink>
  );
}
