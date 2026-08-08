import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProgressSnapshot,
  getReadingWordsToday,
  recordReadingPosition,
  replaceProgress,
  type ProgressState,
} from './progressStore';

/**
 * The word-crediting maths behind "N words today".
 *
 * This is the number most worth pinning down: it has to reflect what was actually read, land exactly
 * on the book's authored word count when finished, and survive a book being re-opened or re-read
 * without inflating.
 */
function blank(): ProgressState {
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
  };
}

const TODAY = '2026-08-07';

describe('recordReadingPosition', () => {
  beforeEach(() => replaceProgress(blank()));

  it('credits only the words in the part just read', () => {
    // 37-word book, 5 sentences: reaching sentence 2 is 2/5 of it.
    recordReadingPosition('r-my-town', 2, 5, 37, TODAY);
    expect(getReadingWordsToday(getProgressSnapshot(), TODAY)).toBe(15);

    recordReadingPosition('r-my-town', 4, 5, 37, TODAY);
    expect(getReadingWordsToday(getProgressSnapshot(), TODAY)).toBe(30);
  });

  it('lands exactly on the book’s word count when it is finished', () => {
    for (let sentence = 1; sentence <= 5; sentence++) {
      recordReadingPosition('r-my-town', sentence, 5, 37, TODAY);
    }
    expect(getReadingWordsToday(getProgressSnapshot(), TODAY)).toBe(37);
  });

  it('never double-counts a re-read, and never rolls the position backwards', () => {
    recordReadingPosition('r-my-town', 5, 5, 37, TODAY);
    expect(getReadingWordsToday(getProgressSnapshot(), TODAY)).toBe(37);

    // Re-opening at the top, then scrolling through again.
    recordReadingPosition('r-my-town', 1, 5, 37, TODAY);
    recordReadingPosition('r-my-town', 3, 5, 37, TODAY);
    expect(getReadingWordsToday(getProgressSnapshot(), TODAY)).toBe(37);
    expect(getProgressSnapshot().readingPositions['r-my-town'].sentencesRead).toBe(5);
  });

  it('keeps each day’s words separate', () => {
    recordReadingPosition('r-my-town', 2, 5, 37, '2026-08-06');
    recordReadingPosition('r-my-town', 5, 5, 37, TODAY);

    const state = getProgressSnapshot();
    expect(state.readingWordsByDate['2026-08-06']).toBe(15);
    expect(state.readingWordsByDate[TODAY]).toBe(22);
  });

  it('records that a book was opened even when no new ground was covered', () => {
    recordReadingPosition('r-my-town', 3, 5, 37, TODAY);
    const first = getProgressSnapshot().readingPositions['r-my-town'].lastReadAt;

    recordReadingPosition('r-my-town', 1, 5, 37, TODAY);
    const second = getProgressSnapshot().readingPositions['r-my-town'].lastReadAt;

    expect(second >= first).toBe(true);
    expect(getReadingWordsToday(getProgressSnapshot(), TODAY)).toBe(22);
  });

  it('ignores a book with no sentences rather than dividing by zero', () => {
    recordReadingPosition('broken', 1, 0, 20, TODAY);
    expect(getProgressSnapshot().readingPositions.broken).toBeUndefined();
    expect(getReadingWordsToday(getProgressSnapshot(), TODAY)).toBe(0);
  });
});
