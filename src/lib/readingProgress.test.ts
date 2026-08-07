import { describe, it, expect } from 'vitest';
import { bookPercent, isInProgress, pickNextRead, resumeSentenceIndex } from './readingProgress';
import type { ProgressState } from './progressStore';
import { getReading, READINGS } from '../data/readings';

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
    quizResults: [],
    weeklyCheckpoints: {},
    mockExams: {},
    session: null,
    ...over,
  };
}

const hello = getReading('rx-hello')!;
const myTown = getReading('r-my-town')!;

describe('reading progress selectors', () => {
  it('reports an untouched book as 0% and a finished one as 100%', () => {
    expect(bookPercent(progress(), hello)).toBe(0);
    expect(bookPercent(progress({ completedReadingIds: [hello.id] }), hello)).toBe(1);
  });

  it('reports a part-read book by how far into it the reader got', () => {
    const state = progress({
      readingPositions: {
        [myTown.id]: { sentencesRead: 2, totalSentences: 5, lastReadAt: '2026-08-07T09:00:00.000Z' },
      },
    });
    expect(bookPercent(state, myTown)).toBeCloseTo(0.4);
    expect(isInProgress(state, myTown)).toBe(true);
  });

  it('counts a book marked read as finished even if its position was never closed out', () => {
    const state = progress({
      completedReadingIds: [myTown.id],
      readingPositions: {
        [myTown.id]: { sentencesRead: 1, totalSentences: 5, lastReadAt: '2026-08-07T09:00:00.000Z' },
      },
    });
    expect(bookPercent(state, myTown)).toBe(1);
    expect(isInProgress(state, myTown)).toBe(false);
  });

  it('resumes one sentence before the high-water mark, for context', () => {
    const state = progress({
      readingPositions: {
        [myTown.id]: { sentencesRead: 3, totalSentences: 5, lastReadAt: '2026-08-07T09:00:00.000Z' },
      },
    });
    expect(resumeSentenceIndex(state, myTown)).toBe(2);
    // Nothing read yet, and a fully-read book, both open at the top rather than at the end.
    expect(resumeSentenceIndex(progress(), myTown)).toBe(0);
    expect(
      resumeSentenceIndex(
        progress({
          readingPositions: {
            [myTown.id]: { sentencesRead: 5, totalSentences: 5, lastReadAt: '2026-08-07T09:00:00.000Z' },
          },
        }),
        myTown,
      ),
    ).toBe(0);
  });

  describe('pickNextRead', () => {
    it('offers the most recently opened half-finished book, whatever its level', () => {
      const pick = pickNextRead(
        progress({
          readingPositions: {
            [hello.id]: { sentencesRead: 2, totalSentences: 5, lastReadAt: '2026-08-05T09:00:00.000Z' },
            [myTown.id]: { sentencesRead: 1, totalSentences: 5, lastReadAt: '2026-08-07T09:00:00.000Z' },
          },
        }),
        'N5',
      );
      expect(pick?.kind).toBe('resume');
      expect(pick?.passage.id).toBe(myTown.id);
    });

    it('falls back to suggesting the shortest unread book at the chosen level', () => {
      const pick = pickNextRead(progress(), 'N3');
      expect(pick?.kind).toBe('start');
      expect(pick?.percent).toBe(0);
      expect(pick?.passage.level).toBe('N3');

      const shortestN3 = READINGS.filter((r) => r.level === 'N3').sort(
        (a, b) => a.tadokuLevel - b.tadokuLevel || a.wordCount - b.wordCount,
      )[0];
      expect(pick?.passage.id).toBe(shortestN3.id);
    });

    it('still suggests something once every book at the chosen level is read', () => {
      const allN5Read = READINGS.filter((r) => r.level === 'N5').map((r) => r.id);
      const pick = pickNextRead(progress({ completedReadingIds: allN5Read }), 'N5');
      expect(pick?.kind).toBe('start');
      expect(allN5Read).not.toContain(pick?.passage.id);
    });

    it('has nothing to offer only when the whole library is finished', () => {
      const everything = READINGS.map((r) => r.id);
      expect(pickNextRead(progress({ completedReadingIds: everything }), 'N5')).toBeUndefined();
    });
  });
});
