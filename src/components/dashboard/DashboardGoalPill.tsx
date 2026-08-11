import { useId, type ChangeEvent } from 'react';
import { ChevronDown, Target } from 'lucide-react';
import { formatDuration, STUDY_DURATION_PRESETS } from '../../lib/studyPlanCalculator';

interface DashboardGoalProps {
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
}

/**
 * A duration saved by an older build's 5-minute slider need not be one of the presets — keep it in the
 * list so the control still shows the learner's real, saved goal instead of silently snapping.
 */
function useOptions(durationMinutes: number) {
  return STUDY_DURATION_PRESETS.includes(durationMinutes as (typeof STUDY_DURATION_PRESETS)[number])
    ? [...STUDY_DURATION_PRESETS]
    : [...STUDY_DURATION_PRESETS, durationMinutes].sort((a, b) => a - b);
}

const HINT = "Minutes a day. Sets today's plan and the weekly ring.";

/**
 * The daily goal as a compact pill, sitting on the banner's action row beside the primary CTA — start
 * the session, and set how long it is, on one line.
 *
 * The banner's text column is deliberately narrow and the mascot stands immediately to its right, so
 * the row is short on space: under 1600px the "Daily goal" wording drops and the target icon carries
 * the meaning (the mascot steps aside there too — see Dashboard.tsx). The select keeps its accessible
 * name either way.
 *
 * Glass on dark, because the banner is a painted night scene in both themes.
 */
export function DashboardGoalPill({ durationMinutes, onDurationChange }: DashboardGoalProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const options = useOptions(durationMinutes);

  // Padding stays at 2px so the pill lands a hair under the CTA's height: the banner's fixed height has
  // no slack at 1280, and anything taller than the button is clipped by the bottom edge.
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[#96a0dc]/22 bg-[#0b1230]/70 py-0.5 pr-0.5 pl-3.5 backdrop-blur-md">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap text-slate-300">
        <Target size={16} aria-hidden="true" className="text-brand-300" />
        {/* Hidden rather than dropped, so the select keeps its name where the wording doesn't fit: only
            from `lg` (where the mascot appears and the banner's height locks) up to 1600px. */}
        <span className="not-sr-only lg:sr-only min-[1600px]:not-sr-only">Daily goal</span>
      </label>
      <div className="relative">
        <select
          id={id}
          value={durationMinutes}
          aria-describedby={hintId}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onDurationChange(Number(e.target.value))}
          className="min-h-9 appearance-none rounded-xl border border-[#96a0dc]/22 bg-[#141c3c]/90 py-1.5 pr-8 pl-3 text-sm font-bold text-white transition-colors hover:bg-[#1c2650]/90"
        >
          {options.map((minutes) => (
            <option key={minutes} value={minutes} className="bg-ink-900 text-slate-100">
              {formatDuration(minutes)}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
        />
      </div>
      {/* No room on the action row to spell out what the goal drives, but a screen reader still gets it. */}
      <span id={hintId} className="sr-only">
        {HINT}
      </span>
    </div>
  );
}
