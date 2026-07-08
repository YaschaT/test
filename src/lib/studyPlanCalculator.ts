import type { SkillArea } from '../types';
import { SKILL_LABELS } from '../types';

export const MIN_STUDY_MINUTES = 10;
export const MAX_STUDY_MINUTES = 240;
export const STUDY_MINUTES_STEP = 5;

export const STUDY_DURATION_PRESETS = [10, 30, 60, 120, 180] as const;

interface CategoryConfig {
  skill: SkillArea;
  weight: number;
  /** A category only appears once the total session is at least this long — short sessions stay focused. */
  minMinutesToInclude: number;
}

/**
 * Weights and thresholds are tuned so common preset durations (10/30/60/120 min) land on clean,
 * realistic splits: e.g. 10 min -> Vocabulary/Listening 5+5; 60 min -> Grammar/Vocabulary 15 each,
 * Kanji/Reading/Listening 10 each; 120 min -> all six skills, weighted toward Grammar/Vocabulary.
 */
const CATEGORY_CONFIG: CategoryConfig[] = [
  { skill: 'vocabulary', weight: 3, minMinutesToInclude: 10 },
  { skill: 'listening', weight: 2, minMinutesToInclude: 10 },
  { skill: 'grammar', weight: 3, minMinutesToInclude: 25 },
  { skill: 'kanji', weight: 2.5, minMinutesToInclude: 55 },
  { skill: 'reading', weight: 2.5, minMinutesToInclude: 55 },
  { skill: 'speaking', weight: 2, minMinutesToInclude: 110 },
];

export interface StudyPlanItem {
  skill: SkillArea;
  minutes: number;
}

export interface StudyPlanResult {
  totalMinutes: number;
  items: StudyPlanItem[];
  skippedSkills: SkillArea[];
  skippedNote: string | null;
}

export function clampStudyMinutes(minutes: number): number {
  const clamped = Math.min(MAX_STUDY_MINUTES, Math.max(MIN_STUDY_MINUTES, minutes));
  return Math.round(clamped / STUDY_MINUTES_STEP) * STUDY_MINUTES_STEP;
}

function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** Pure function — deterministic for a given duration, easy to unit test and safe to tune later. */
export function calculateStudyPlan(requestedMinutes: number): StudyPlanResult {
  const totalMinutes = clampStudyMinutes(requestedMinutes);
  const included = CATEGORY_CONFIG.filter((c) => totalMinutes >= c.minMinutesToInclude);
  const excluded = CATEGORY_CONFIG.filter((c) => totalMinutes < c.minMinutesToInclude);
  const totalWeight = included.reduce((sum, c) => sum + c.weight, 0);

  const shares = included.map((c) => ({
    skill: c.skill,
    raw: (totalMinutes * c.weight) / totalWeight,
  }));

  const rounded = shares.map((s) => ({
    skill: s.skill,
    raw: s.raw,
    minutes: Math.max(STUDY_MINUTES_STEP, Math.round(s.raw / STUDY_MINUTES_STEP) * STUDY_MINUTES_STEP),
  }));

  // Rounding to clean 5-minute blocks can drift from the exact requested total — nudge the biggest
  // over/under-allocated category by one step at a time until the plan sums back to the request exactly.
  let diff = totalMinutes - rounded.reduce((sum, r) => sum + r.minutes, 0);
  let safety = 200;
  while (diff !== 0 && safety-- > 0) {
    if (diff > 0) {
      const target = rounded.reduce(
        (best, r, i) => (r.raw - r.minutes > rounded[best].raw - rounded[best].minutes ? i : best),
        0,
      );
      rounded[target].minutes += STUDY_MINUTES_STEP;
      diff -= STUDY_MINUTES_STEP;
    } else {
      const candidates = rounded.filter((r) => r.minutes > STUDY_MINUTES_STEP);
      if (candidates.length === 0) break;
      const target = candidates.reduce((best, r) => (r.minutes - r.raw > best.minutes - best.raw ? r : best));
      target.minutes -= STUDY_MINUTES_STEP;
      diff += STUDY_MINUTES_STEP;
    }
  }

  const skippedSkills = excluded.map((c) => c.skill);
  const skippedNote =
    skippedSkills.length > 0
      ? `${formatList(skippedSkills.map((s) => SKILL_LABELS[s].en))} ${skippedSkills.length === 1 ? 'is' : 'are'} skipped today to keep this session focused.`
      : null;

  return {
    totalMinutes,
    items: rounded.map((r) => ({ skill: r.skill, minutes: r.minutes })),
    skippedSkills,
    skippedNote,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourLabel = `${hours} hr${hours > 1 ? 's' : ''}`;
  return rest === 0 ? hourLabel : `${hourLabel} ${rest} min`;
}
