import { useId, type ChangeEvent } from 'react';
import { ChevronDown, Target } from 'lucide-react';
import { formatDuration, STUDY_DURATION_PRESETS } from '../../lib/studyPlanCalculator';

interface DashboardGoalBarProps {
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
}

/**
 * The daily study goal.
 *
 * It used to live inside the dashboard hero; the category banner that replaced that hero has one
 * action slot and it belongs to starting a session. So the goal sits here instead — directly above the
 * summary strip whose "minutes today" and weekly ring it actually governs, which is arguably where it
 * always belonged.
 */
export function DashboardGoalBar({ durationMinutes, onDurationChange }: DashboardGoalBarProps) {
  const id = useId();

  // A duration saved by an older build's 5-minute slider need not be one of the presets — keep it in the
  // list so the control still shows the learner's real, saved goal instead of silently snapping.
  const options = STUDY_DURATION_PRESETS.includes(durationMinutes as (typeof STUDY_DURATION_PRESETS)[number])
    ? [...STUDY_DURATION_PRESETS]
    : [...STUDY_DURATION_PRESETS, durationMinutes].sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-hairline dark:bg-ink-900">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        <Target size={16} aria-hidden="true" className="text-brand-500" />
        Daily goal
      </label>
      <div className="relative">
        <select
          id={id}
          value={durationMinutes}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onDurationChange(Number(e.target.value))}
          className="min-h-10 appearance-none rounded-xl border border-slate-200 bg-white py-2 pr-10 pl-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 dark:border-hairline dark:bg-ink-800 dark:text-slate-100 dark:hover:bg-ink-700"
        >
          {options.map((minutes) => (
            <option key={minutes} value={minutes}>
              {formatDuration(minutes)}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
        />
      </div>
      <p className="text-sm text-slate-400 dark:text-slate-500">a day — sets today's plan and the weekly ring</p>
    </div>
  );
}
