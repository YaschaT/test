import { describe, it, expect } from 'vitest';
import { getCheckpointQuestions, hasCheckpoint } from './checkpoint';
import { evaluateGate, type GateProgress } from './roadmapGate';
import { ROADMAP } from '../data/roadmap';

const week1 = ROADMAP[0];

describe('weekly checkpoints', () => {
  it('builds a checkpoint from the week’s grammar quizzes', () => {
    const qs = getCheckpointQuestions(week1);
    expect(qs.length).toBeGreaterThan(0);
    for (const q of qs) {
      expect(q.options.length).toBeGreaterThan(1);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
    }
  });

  it('caps the number of questions', () => {
    expect(getCheckpointQuestions(week1, 3).length).toBeLessThanOrEqual(3);
  });

  it('every roadmap week that requires a checkpoint accuracy either has questions or falls back', () => {
    // Sanity: any grammar-bearing week exposes a checkpoint.
    const grammarWeeks = ROADMAP.filter((w) => w.units.some((u) => u.grammarIds.length > 0));
    for (const w of grammarWeeks) expect(hasCheckpoint(w)).toBe(true);
  });

  it('a passing checkpoint plus completed content satisfies the week-1 gate', () => {
    const ids = week1.units[0];
    const base: GateProgress = {
      completedGrammarIds: [...ids.grammarIds],
      learnedKanjiIds: [...ids.kanjiIds],
      completedReadingIds: [...ids.readingIds],
      srsCards: Object.fromEntries(
        ids.vocabIds.map((id) => [
          `vocabulary:${id}`,
          { itemId: id, itemType: 'vocabulary' as const, easeFactor: 2.5, intervalDays: 4, repetitions: 2, dueDate: '2999-01-01', lastReviewed: '2026-01-01' },
        ]),
      ),
      checkpointAccuracyByWeek: {},
    };
    // Without a checkpoint score the full gate should NOT pass...
    expect(evaluateGate(week1, base).passed).toBe(false);
    // ...but recording a passing checkpoint flips it.
    const withCheckpoint: GateProgress = { ...base, checkpointAccuracyByWeek: { 1: 1 } };
    expect(evaluateGate(week1, withCheckpoint).passed).toBe(true);
  });
});
