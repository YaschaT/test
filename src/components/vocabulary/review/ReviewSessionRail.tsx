import { Flame } from 'lucide-react';
import { ReviewProgress } from './ReviewProgress';
import { DisplayToggles, type DisplayPrefs } from '../../DisplayToggles';
import { Kbd } from './Kbd';
import { GRADE_META, GRADE_ORDER } from './gradeTheme';

export interface ReviewSessionCounts {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

interface ReviewSessionRailProps {
  position: number;
  total: number;
  counts: ReviewSessionCounts;
  correctStreak: number;
  estMinutes: number;
  prefs: DisplayPrefs;
  onPrefsChange: (prefs: DisplayPrefs) => void;
  className?: string;
}

/**
 * One coherent session panel (not a stack of dashboard cards): progress, streak, grade counts,
 * estimated time, display toggles and shortcuts, separated by hairline dividers. Rendered fixed in the
 * right column on xl screens and as a collapsible panel under the header below that.
 */
export function ReviewSessionRail({
  position,
  total,
  counts,
  correctStreak,
  estMinutes,
  prefs,
  onPrefsChange,
  className = '',
}: ReviewSessionRailProps) {
  const pct = total > 0 ? Math.round((position / total) * 100) : 0;
  const remaining = total - position;

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-slate-900/70 ${className}`}
    >
      <div className="p-6">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Session</h2>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Progress</span>
          <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{pct}%</span>
        </div>
        <ReviewProgress value={pct} className="mt-2" />
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Cards remaining</span>
          <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{remaining}</span>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-white/[0.06] p-6">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current streak</p>
        <p className="mt-1.5 flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <Flame size={18} aria-hidden="true" className={correctStreak > 0 ? 'text-accent-500' : 'text-slate-400 dark:text-slate-500'} />
          {correctStreak} correct
        </p>

        <ul className="mt-4 space-y-2">
          {GRADE_ORDER.map((rating) => (
            <li key={rating} className="flex items-center gap-2.5 text-sm">
              <span aria-hidden="true" className={`w-2 h-2 rounded-full ${GRADE_META[rating].dotClass}`} />
              <span className="flex-1 text-slate-500 dark:text-slate-400">{GRADE_META[rating].label}</span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{counts[rating]}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Estimated time</span>
          <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
            {remaining > 0 ? `~${estMinutes} min` : 'Done'}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-white/[0.06] p-6">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Display</p>
        <DisplayToggles prefs={prefs} onChange={onPrefsChange} />
      </div>

      <div className="border-t border-slate-100 dark:border-white/[0.06] p-6 xl:flex-1">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Shortcuts</p>
        <ul className="space-y-2">
          {GRADE_ORDER.map((rating) => (
            <li key={rating} className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
              <Kbd>{GRADE_META[rating].key}</Kbd>
              {GRADE_META[rating].label}
            </li>
          ))}
          <li className="flex items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
            <Kbd>Space</Kbd>
            Reveal answer
          </li>
        </ul>
      </div>
    </div>
  );
}
