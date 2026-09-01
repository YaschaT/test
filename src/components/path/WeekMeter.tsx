import { PATH_SKILLS, type SkillSlice } from '../../lib/pathWeek';
import { SKILL_FILL_CLASS, SKILL_LABEL } from '../../lib/pathSkillVisuals';

/**
 * A week's progress as one shape instead of four chips.
 *
 * Four fixed-width tracks, one per skill, in that skill's own colour (see `skillTheme.ts` — light mode
 * uses the deep end of each gradient, dark mode the light end, since brand-600 disappears on ink-900).
 * A skill the week doesn't cover keeps its empty track, so every meter is the same width and a column
 * of them reads straight down. The numbers live in the week panel; at rest this is shape only.
 */


export function WeekMeter({ slices, className = '' }: { slices: SkillSlice[]; className?: string }) {
  const bySkill = new Map(slices.map((s) => [s.skill, s]));
  const summary = PATH_SKILLS.map((skill) => {
    const slice = bySkill.get(skill);
    if (!slice || slice.total === 0) return `${SKILL_LABEL[skill]} none this week`;
    return `${SKILL_LABEL[skill]} ${slice.done} of ${slice.total}`;
  }).join(', ');

  return (
    <span className={`flex gap-1 ${className}`} role="img" aria-label={summary}>
      {PATH_SKILLS.map((skill) => {
        const slice = bySkill.get(skill);
        const percent = slice && slice.total > 0 ? (slice.done / slice.total) * 100 : 0;
        return (
          <span
            key={skill}
            aria-hidden="true"
            className="h-1.5 w-7 shrink-0 overflow-hidden rounded-full bg-slate-200 sm:w-10 dark:bg-ink-700"
          >
            <span className={`block h-full rounded-full ${SKILL_FILL_CLASS[skill]}`} style={{ width: `${percent}%` }} />
          </span>
        );
      })}
    </span>
  );
}

/** The one legend the page needs, so 22 rows don't have to label their own segments. */
export function WeekMeterLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span className="text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase dark:text-slate-500">
        Week mastery
      </span>
      {PATH_SKILLS.map((skill) => (
        <span key={skill} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span aria-hidden="true" className={`h-1.5 w-4 rounded-full ${SKILL_FILL_CLASS[skill]}`} />
          {SKILL_LABEL[skill]}
        </span>
      ))}
    </div>
  );
}
