import { describe, expect, it } from 'vitest';
import { calculateStudyPlan, clampStudyMinutes, MAX_STUDY_MINUTES, MIN_STUDY_MINUTES } from './studyPlanCalculator';

function minutesFor(plan: ReturnType<typeof calculateStudyPlan>, skill: string): number | undefined {
  return plan.items.find((i) => i.skill === skill)?.minutes;
}

describe('calculateStudyPlan', () => {
  it('matches the 10-minute focused plan: Vocabulary + Listening only', () => {
    const plan = calculateStudyPlan(10);
    expect(plan.totalMinutes).toBe(10);
    expect(plan.items).toEqual(
      expect.arrayContaining([
        { skill: 'vocabulary', minutes: 5 },
        { skill: 'listening', minutes: 5 },
      ]),
    );
    expect(plan.items).toHaveLength(2);
    expect(plan.skippedSkills).toEqual(expect.arrayContaining(['grammar', 'kanji', 'reading', 'speaking']));
  });

  it('matches the 30-minute balanced plan: Vocabulary/Grammar/Listening 10 each', () => {
    const plan = calculateStudyPlan(30);
    expect(minutesFor(plan, 'vocabulary')).toBe(10);
    expect(minutesFor(plan, 'grammar')).toBe(10);
    expect(minutesFor(plan, 'listening')).toBe(10);
    expect(plan.items).toHaveLength(3);
  });

  it('matches the 60-minute plan across five categories', () => {
    const plan = calculateStudyPlan(60);
    expect(minutesFor(plan, 'grammar')).toBe(15);
    expect(minutesFor(plan, 'vocabulary')).toBe(15);
    expect(minutesFor(plan, 'kanji')).toBe(10);
    expect(minutesFor(plan, 'reading')).toBe(10);
    expect(minutesFor(plan, 'listening')).toBe(10);
    expect(plan.items).toHaveLength(5);
    expect(plan.skippedSkills).toEqual(['speaking']);
  });

  it('matches the 120-minute plan across all six categories', () => {
    const plan = calculateStudyPlan(120);
    expect(minutesFor(plan, 'grammar')).toBe(25);
    expect(minutesFor(plan, 'vocabulary')).toBe(25);
    expect(minutesFor(plan, 'kanji')).toBe(20);
    expect(minutesFor(plan, 'reading')).toBe(20);
    expect(minutesFor(plan, 'listening')).toBe(15);
    expect(minutesFor(plan, 'speaking')).toBe(15);
    expect(plan.items).toHaveLength(6);
    expect(plan.skippedSkills).toHaveLength(0);
    expect(plan.skippedNote).toBeNull();
  });

  it('always sums exactly to the requested (clamped) duration', () => {
    for (let minutes = MIN_STUDY_MINUTES; minutes <= MAX_STUDY_MINUTES; minutes += 5) {
      const plan = calculateStudyPlan(minutes);
      const sum = plan.items.reduce((s, i) => s + i.minutes, 0);
      expect(sum).toBe(minutes);
    }
  });

  it('never produces a block smaller than 5 minutes', () => {
    for (let minutes = MIN_STUDY_MINUTES; minutes <= MAX_STUDY_MINUTES; minutes += 5) {
      const plan = calculateStudyPlan(minutes);
      for (const item of plan.items) {
        expect(item.minutes).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('includes more categories as duration grows (never fewer)', () => {
    let previousCount = 0;
    for (let minutes = MIN_STUDY_MINUTES; minutes <= MAX_STUDY_MINUTES; minutes += 5) {
      const plan = calculateStudyPlan(minutes);
      expect(plan.items.length).toBeGreaterThanOrEqual(previousCount);
      previousCount = plan.items.length;
    }
  });

  it('includes all six categories once duration is long enough', () => {
    const plan = calculateStudyPlan(180);
    expect(plan.items).toHaveLength(6);
  });

  it('clamps below the minimum and above the maximum', () => {
    expect(clampStudyMinutes(1)).toBe(MIN_STUDY_MINUTES);
    expect(clampStudyMinutes(1000)).toBe(MAX_STUDY_MINUTES);
  });

  it('rounds arbitrary durations to the nearest 5-minute step', () => {
    expect(clampStudyMinutes(47)).toBe(45);
    expect(clampStudyMinutes(48)).toBe(50);
  });

  it('provides a human-readable note naming skipped skills', () => {
    const plan = calculateStudyPlan(10);
    expect(plan.skippedNote).toMatch(/skipped today/);
    expect(plan.skippedNote).toContain('Grammar');
  });
});
