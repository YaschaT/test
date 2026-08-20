import { describe, expect, it } from 'vitest';
import { buildReviewSummary, captureReviewBaseline, horizonLabel } from './reviewSummary';
import type { GradedCard } from './reviewSummary';
import type { ProgressState } from './progressStore';
import type { SrsCardState } from '../types';

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

function card(itemId: string, intervalDays: number): SrsCardState {
  return {
    itemId,
    itemType: 'vocabulary',
    easeFactor: 2.5,
    intervalDays,
    repetitions: 3,
    dueDate: '2026-01-01',
    lastReviewed: '2026-01-01',
  };
}

function cards(entries: Record<string, number>): Record<string, SrsCardState> {
  return Object.fromEntries(
    Object.entries(entries).map(([id, days]) => [`vocabulary:${id}`, card(id, days)]),
  );
}

describe('captureReviewBaseline', () => {
  it('separates never-seen cards from already-mastered ones', () => {
    const before = progress({ srsCards: cards({ a: 30, b: 6 }) });
    const baseline = captureReviewBaseline('vocabulary', ['a', 'b', 'c'], before);

    expect([...baseline.unseen]).toEqual(['c']);
    expect([...baseline.mastered]).toEqual(['a']);
    expect(baseline.xp).toBe(20); // two vocabulary cards at 10 XP each
  });
});

describe('buildReviewSummary', () => {
  const graded: GradedCard[] = [
    { id: 'a', rating: 'good' },
    { id: 'b', rating: 'again' },
    { id: 'c', rating: 'easy' },
    { id: 'd', rating: 'hard' },
  ];

  it('counts every grade press and derives accuracy from them', () => {
    const baseline = captureReviewBaseline('vocabulary', ['a', 'b', 'c', 'd'], progress());
    const after = progress({ srsCards: cards({ a: 6, b: 1, c: 8, d: 2 }) });
    const s = buildReviewSummary('vocabulary', graded, baseline, after);

    expect(s.graded).toBe(4);
    expect(s.correct).toBe(2);
    expect(s.accuracy).toBe(0.5);
    expect(s.counts).toEqual({ again: 1, hard: 1, good: 1, easy: 1 });
  });

  it('lists the Again cards before the Hard ones', () => {
    const baseline = captureReviewBaseline('vocabulary', ['a', 'b', 'c', 'd'], progress());
    const after = progress({ srsCards: cards({ a: 6, b: 1, c: 8, d: 2 }) });

    expect(buildReviewSummary('vocabulary', graded, baseline, after).weakIds).toEqual(['b', 'd']);
  });

  it('keeps only a card final grade when it was graded twice', () => {
    const baseline = captureReviewBaseline('vocabulary', ['a'], progress());
    const after = progress({ srsCards: cards({ a: 6 }) });
    const twice: GradedCard[] = [
      { id: 'a', rating: 'again' },
      { id: 'a', rating: 'good' },
    ];
    const s = buildReviewSummary('vocabulary', twice, baseline, after);

    expect(s.graded).toBe(2); // both presses still count toward the session tally
    expect(s.weakIds).toEqual([]); // ...but the card itself ended on Good
    expect(s.buckets.reduce((n, b) => n + b.count, 0)).toBe(1);
  });

  it('buckets cards by the interval the scheduler actually gave them', () => {
    const baseline = captureReviewBaseline('vocabulary', ['a', 'b', 'c', 'd'], progress());
    const after = progress({ srsCards: cards({ a: 1, b: 1, c: 6, d: 30 }) });
    const s = buildReviewSummary('vocabulary', graded, baseline, after);

    expect(s.buckets.map((b) => [b.key, b.count, b.label.en])).toEqual([
      ['tomorrow', 2, 'Tomorrow'],
      ['week', 1, 'In 6 days'],
      ['long', 1, 'In 4 weeks'],
    ]);
    expect(s.buckets.at(-1)?.mastered).toBe(true);
  });

  it('only reports mastery for cards that crossed the threshold in this session', () => {
    const before = progress({ srsCards: cards({ a: 30, c: 8 }) });
    const baseline = captureReviewBaseline('vocabulary', ['a', 'b', 'c', 'd'], before);
    const after = progress({ srsCards: cards({ a: 40, b: 1, c: 25, d: 2 }) });
    const s = buildReviewSummary('vocabulary', graded, baseline, after);

    expect(s.masteredIds).toEqual(['c']); // 'a' was already mastered before the session
    expect(s.newlyMastered).toBe(1);
  });

  it('measures XP and first-time cards against the pre-session snapshot', () => {
    const before = progress({ srsCards: cards({ a: 6 }) });
    const baseline = captureReviewBaseline('vocabulary', ['a', 'b', 'c', 'd'], before);
    const after = progress({ srsCards: cards({ a: 6, b: 1, c: 2, d: 1 }) });
    const s = buildReviewSummary('vocabulary', graded, baseline, after);

    expect(s.firstLearned).toBe(3);
    expect(s.xpEarned).toBe(30); // three new vocabulary cards at 10 XP
  });

  it('reports an empty session without dividing by zero', () => {
    const s = buildReviewSummary(
      'vocabulary',
      [],
      captureReviewBaseline('vocabulary', [], progress()),
      progress(),
    );

    expect(s).toMatchObject({ graded: 0, accuracy: 0, xpEarned: 0, buckets: [], weakIds: [] });
  });
});

describe('horizonLabel', () => {
  it('names the near horizon in days and the far one in weeks', () => {
    expect(horizonLabel(1, 1).en).toBe('Tomorrow');
    expect(horizonLabel(6, 6).en).toBe('In 6 days');
    expect(horizonLabel(2, 5).en).toBe('In 2–5 days');
    expect(horizonLabel(21, 21).en).toBe('In 3 weeks');
    expect(horizonLabel(21, 60).en).toBe('In 3–9 weeks');
    expect(horizonLabel(6, 6).nl).toBe('Over 6 dagen');
  });
});
