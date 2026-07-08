import { addDays } from './date';

export interface StreakState {
  current: number;
  longest: number;
  lastStudyDate: string | null;
}

export const INITIAL_STREAK: StreakState = { current: 0, longest: 0, lastStudyDate: null };

/** Pure transition so it's unit-testable — see streak.test.ts. */
export function advanceStreak(streak: StreakState, studyDate: string): StreakState {
  if (streak.lastStudyDate === studyDate) return streak; // already counted today

  const isConsecutive = streak.lastStudyDate !== null && addDays(streak.lastStudyDate, 1) === studyDate;
  const current = isConsecutive ? streak.current + 1 : 1;

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastStudyDate: studyDate,
  };
}

/** A streak "breaks" (resets to 0 for display) once a full day has been missed. */
export function displayedStreak(streak: StreakState, today: string): number {
  if (!streak.lastStudyDate) return 0;
  const gapDays = new Date(today).getTime() - new Date(streak.lastStudyDate).getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const gap = Math.round(gapDays / dayMs);
  return gap <= 1 ? streak.current : 0;
}
