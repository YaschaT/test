import { describe, expect, it } from 'vitest';
import { MILESTONES, milestoneFor, milestoneXpEarned } from './milestones';
import type { ProgressState } from './progressStore';

function progress(over: Partial<ProgressState> = {}): ProgressState {
  return {
    level: 'N5',
    streak: { current: 0, longest: 0, lastStudyDate: null },
    minutesByDate: {},
    srsCards: {},
    completedGrammarIds: [],
    learnedKanjiIds: [],
    completedReadingIds: [],
    readingPositions: {},
    readingWordsByDate: {},
    speakingSessions: {},
    phraseScores: {},
    speakingTurnsByDate: {},
    quizResults: [],
    weeklyCheckpoints: {},
    mockExams: {},
    session: null,
    ...over,
  };
}

describe('milestoneFor', () => {
  it('starts empty on a fresh account', () => {
    const m = milestoneFor('kanji', progress());
    expect(m).toMatchObject({ done: 0, target: 10, completed: 0, percent: 0 });
  });

  it('tracks progress toward the first rung', () => {
    const m = milestoneFor('kanji', progress({ learnedKanjiIds: ['a', 'b', 'c'] }));
    expect(m.done).toBe(3);
    expect(m.completed).toBe(0);
    expect(m.percent).toBe(30);
  });

  it('rolls over to the next rung rather than sitting full', () => {
    const ids = Array.from({ length: 13 }, (_, i) => `k${i}`);
    const m = milestoneFor('kanji', progress({ learnedKanjiIds: ids }));
    expect(m.completed).toBe(1);
    expect(m.done).toBe(3);
  });

  it('reads exactly on a rung boundary as a fresh rung, not a full bar', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `k${i}`);
    const m = milestoneFor('kanji', progress({ learnedKanjiIds: ids }));
    expect(m.completed).toBe(2);
    expect(m.done).toBe(0);
  });

  it('counts vocabulary from SRS cards, not from a separate list', () => {
    const srsCards = Object.fromEntries(
      ['vocabulary:a', 'vocabulary:b', 'kanji:c'].map((k) => [
        k,
        { itemId: k.split(':')[1], itemType: 'vocabulary' as const, easeFactor: 2.5, intervalDays: 1, repetitions: 1, dueDate: '2026-01-01', lastReviewed: null },
      ]),
    );
    expect(milestoneFor('vocabulary', progress({ srsCards })).done).toBe(2);
  });

  it('ignores abandoned listening sessions', () => {
    const quizResults = [
      { id: '1', quizId: 'l1', skill: 'listening' as const, level: 'N5' as const, date: '2026-01-01', correct: 5, total: 8 },
      { id: '2', quizId: 'l2', skill: 'listening' as const, level: 'N5' as const, date: '2026-01-01', correct: 1, total: 8, completed: false },
    ];
    expect(milestoneFor('listening', progress({ quizResults })).done).toBe(1);
  });
});

describe('milestoneXpEarned', () => {
  it('pays nothing until a rung is completed', () => {
    expect(milestoneXpEarned(progress({ learnedKanjiIds: ['a', 'b'] }))).toBe(0);
  });

  it('pays once per completed rung', () => {
    const ids = Array.from({ length: 25 }, (_, i) => `k${i}`);
    expect(milestoneXpEarned(progress({ learnedKanjiIds: ids }))).toBe(2 * MILESTONES.kanji.xp);
  });

  it('adds up across categories', () => {
    const p = progress({
      learnedKanjiIds: Array.from({ length: 10 }, (_, i) => `k${i}`),
      completedGrammarIds: Array.from({ length: 10 }, (_, i) => `g${i}`),
    });
    expect(milestoneXpEarned(p)).toBe(MILESTONES.kanji.xp + MILESTONES.grammar.xp);
  });

  it('is stable — recomputing the same progress gives the same number', () => {
    const p = progress({ completedReadingIds: ['a', 'b', 'c', 'd', 'e', 'f'] });
    expect(milestoneXpEarned(p)).toBe(milestoneXpEarned(p));
    expect(milestoneXpEarned(p)).toBe(MILESTONES.reading.xp);
  });
});
