import { readStorage, writeStorage } from './storage';
import type { RoadmapWeek } from '../types';

/**
 * How much time a day the learner is giving this. Every roadmap week carries both numbers
 * (`coreMinutesPerDay` 75–90, `stretchMinutesPerDay` +30–60), so this is a real choice about the shape
 * of the learner's day rather than a filter over the list — and the week's stated target follows it.
 *
 * Deliberately not a content filter: week 21 lists weeks 14 *and* 20 as prerequisites, so the N3 weeks
 * are load-bearing for consolidation. Hiding them would promise a shortcut the mastery gates don't give.
 */
export type BudgetChoice = 'core' | 'stretch';

const KEY = 'path-daily-budget';

export function getBudget(): BudgetChoice {
  return readStorage<BudgetChoice>(KEY, 'core') === 'stretch' ? 'stretch' : 'core';
}

export function saveBudget(choice: BudgetChoice): void {
  writeStorage(KEY, choice);
}

/** The week's daily target in minutes for the chosen budget, as a "75–90" style range. */
export function dailyRange(week: RoadmapWeek, choice: BudgetChoice): string {
  const [coreLow, coreHigh] = week.coreMinutesPerDay;
  // A week without a stretch band simply has no extra to add — its core range is the whole day.
  if (choice === 'core' || !week.stretchMinutesPerDay) return `${coreLow}–${coreHigh}`;
  const [stretchLow, stretchHigh] = week.stretchMinutesPerDay;
  return `${coreLow + stretchLow}–${coreHigh + stretchHigh}`;
}
