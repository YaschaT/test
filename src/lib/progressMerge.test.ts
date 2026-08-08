import { describe, it, expect } from 'vitest';
import { mergeProgress } from './progressMerge';
import type { ProgressState } from './progressStore';
import type { SrsCardState } from '../types';

function card(over: Partial<SrsCardState> = {}): SrsCardState {
  return {
    itemId: 'v-mizu',
    itemType: 'vocabulary',
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 1,
    dueDate: '2026-08-06',
    lastReviewed: '2026-08-05',
    ...over,
  };
}

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

describe('mergeProgress (cross-device sync)', () => {
  it('keeps work from BOTH devices instead of letting one overwrite the other', () => {
    // The reported bug: study on the iPad, then open a desktop still holding an older copy.
    const ipad = progress({
      completedGrammarIds: ['desu', 'masu-masen'],
      learnedKanjiIds: ['k-hi'],
      completedReadingIds: ['rx-hello'],
    });
    const desktop = progress({ completedGrammarIds: ['desu'] });

    const merged = mergeProgress(desktop, ipad);

    expect(merged.completedGrammarIds.sort()).toEqual(['desu', 'masu-masen']);
    expect(merged.learnedKanjiIds).toEqual(['k-hi']);
    expect(merged.completedReadingIds).toEqual(['rx-hello']);
  });

  it('is commutative — the order the two devices sync in cannot change the result', () => {
    const a = progress({
      completedGrammarIds: ['a'],
      minutesByDate: { '2026-08-05': 20 },
      weeklyCheckpoints: { 1: 0.5 },
    });
    const b = progress({
      completedGrammarIds: ['b'],
      minutesByDate: { '2026-08-05': 12 },
      weeklyCheckpoints: { 1: 0.9 },
    });

    const ab = mergeProgress(a, b);
    const ba = mergeProgress(b, a);

    expect(ab.completedGrammarIds.sort()).toEqual(ba.completedGrammarIds.sort());
    expect(ab.minutesByDate).toEqual(ba.minutesByDate);
    expect(ab.weeklyCheckpoints).toEqual(ba.weeklyCheckpoints);
  });

  it('is idempotent — re-merging an already merged result changes nothing', () => {
    const a = progress({ minutesByDate: { '2026-08-05': 20 }, completedGrammarIds: ['a'] });
    const b = progress({ minutesByDate: { '2026-08-05': 12 }, completedGrammarIds: ['b'] });

    const once = mergeProgress(a, b);
    const twice = mergeProgress(once, b);
    const thrice = mergeProgress(twice, once);

    expect(twice).toEqual(once);
    expect(thrice).toEqual(once);
  });

  it('takes the max of study minutes rather than summing (so repeated syncs cannot inflate them)', () => {
    const merged = mergeProgress(
      progress({ minutesByDate: { '2026-08-05': 20, '2026-08-04': 5 } }),
      progress({ minutesByDate: { '2026-08-05': 12 } }),
    );
    expect(merged.minutesByDate).toEqual({ '2026-08-05': 20, '2026-08-04': 5 });
  });

  it('keeps the most recently reviewed SRS card so scheduling is never rolled back', () => {
    const older = card({ lastReviewed: '2026-08-01', intervalDays: 1, repetitions: 1 });
    const newer = card({ lastReviewed: '2026-08-05', intervalDays: 6, repetitions: 3 });

    expect(mergeProgress(progress({ srsCards: { k: older } }), progress({ srsCards: { k: newer } })).srsCards.k)
      .toEqual(newer);
    // …and the same regardless of argument order
    expect(mergeProgress(progress({ srsCards: { k: newer } }), progress({ srsCards: { k: older } })).srsCards.k)
      .toEqual(newer);
  });

  it('unions quiz history without duplicating shared entries', () => {
    const shared = { id: 'q1', quizId: 'reading-x', skill: 'reading' as const, level: 'N5' as const, date: '2026-08-01', correct: 3, total: 3 };
    const onlyB = { id: 'q2', quizId: 'listening-select', skill: 'listening' as const, level: 'N5' as const, date: '2026-08-04', correct: 5, total: 8 };

    const merged = mergeProgress(progress({ quizResults: [shared] }), progress({ quizResults: [shared, onlyB] }));

    expect(merged.quizResults).toHaveLength(2);
    expect(merged.quizResults.map((r) => r.id)).toEqual(['q1', 'q2']);
  });

  it('keeps the best checkpoint accuracy and the best mock-exam score', () => {
    const merged = mergeProgress(
      progress({
        weeklyCheckpoints: { 1: 0.5, 2: 1 },
        mockExams: { N5: { bestScore: 90, passed: false, attempts: 2, lastAttempt: '2026-08-01' } },
      }),
      progress({
        weeklyCheckpoints: { 1: 0.75 },
        mockExams: { N5: { bestScore: 140, passed: true, attempts: 1, lastAttempt: '2026-08-04' } },
      }),
    );

    expect(merged.weeklyCheckpoints).toEqual({ 1: 0.75, 2: 1 });
    expect(merged.mockExams.N5).toEqual({ bestScore: 140, passed: true, attempts: 2, lastAttempt: '2026-08-04' });
  });

  it('keeps the deepest reading position, and the later timestamp, per book', () => {
    const merged = mergeProgress(
      progress({
        readingPositions: {
          'rx-hello': { sentencesRead: 4, totalSentences: 5, lastReadAt: '2026-08-05T09:00:00.000Z' },
        },
      }),
      progress({
        // Opened more recently, but this device had barely started the book.
        readingPositions: {
          'rx-hello': { sentencesRead: 1, totalSentences: 5, lastReadAt: '2026-08-06T20:00:00.000Z' },
          'rx-my-cat': { sentencesRead: 2, totalSentences: 4, lastReadAt: '2026-08-06T21:00:00.000Z' },
        },
      }),
    );

    expect(merged.readingPositions['rx-hello']).toEqual({
      sentencesRead: 4,
      totalSentences: 5,
      lastReadAt: '2026-08-06T20:00:00.000Z',
    });
    expect(merged.readingPositions['rx-my-cat'].sentencesRead).toBe(2);
  });

  it('takes the max of words read per day rather than summing them', () => {
    const a = progress({ readingWordsByDate: { '2026-08-06': 162, '2026-08-05': 40 } });
    const b = progress({ readingWordsByDate: { '2026-08-06': 98 } });

    expect(mergeProgress(a, b).readingWordsByDate).toEqual({ '2026-08-06': 162, '2026-08-05': 40 });
    expect(mergeProgress(mergeProgress(a, b), b).readingWordsByDate).toEqual({
      '2026-08-06': 162,
      '2026-08-05': 40,
    });
  });

  it('keeps the longest streak ever and the most recent current streak', () => {
    const merged = mergeProgress(
      progress({ streak: { current: 3, longest: 9, lastStudyDate: '2026-08-02' } }),
      progress({ streak: { current: 5, longest: 5, lastStudyDate: '2026-08-05' } }),
    );
    expect(merged.streak).toEqual({ current: 5, longest: 9, lastStudyDate: '2026-08-05' });
  });

  it('never demotes the chosen JLPT level', () => {
    expect(mergeProgress(progress({ level: 'N5' }), progress({ level: 'N3' })).level).toBe('N3');
    expect(mergeProgress(progress({ level: 'N3' }), progress({ level: 'N5' })).level).toBe('N3');
  });

  it('merges the same day’s plan so a section done on either device counts as done', () => {
    const base = { date: '2026-08-05', startedAt: '2026-08-05T08:00:00.000Z', completedAt: null };
    const merged = mergeProgress(
      progress({
        session: { ...base, sections: { grammar: 'completed', vocabulary: 'pending', kanji: 'pending', reading: 'pending', listening: 'pending', speaking: 'pending' } },
      }),
      progress({
        session: { ...base, sections: { grammar: 'pending', vocabulary: 'completed', kanji: 'pending', reading: 'pending', listening: 'pending', speaking: 'pending' } },
      }),
    );

    expect(merged.session?.sections.grammar).toBe('completed');
    expect(merged.session?.sections.vocabulary).toBe('completed');
  });
});
