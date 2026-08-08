import { useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from './storage';
import { addDays, todayIso } from './date';
import { advanceStreak, INITIAL_STREAK, type StreakState } from './streak';
import { createInitialSrsCard, isCardDue, reviewSrsCard, srsKey } from './srs';
import type { JlptLevel, SkillArea, SrsCardState, SrsItemType, SrsRating } from '../types';
import { SKILL_AREAS } from '../types';

export type SectionStatus = 'pending' | 'completed' | 'skipped';

export interface StudySession {
  date: string;
  sections: Record<SkillArea, SectionStatus>;
  startedAt: string;
  completedAt: string | null;
}

export interface QuizResult {
  id: string;
  quizId: string;
  skill: SkillArea | 'mock-test';
  level: JlptLevel;
  date: string;
  correct: number;
  total: number;
  /**
   * False when the learner left partway through — the answers they did give still count toward accuracy
   * and per-answer XP, but the completion bonus is not awarded. Absent on results saved before this
   * field existed, which are all completions, so `!== false` is the correct test.
   */
  completed?: boolean;
}

export interface ProgressState {
  level: JlptLevel;
  streak: StreakState;
  minutesByDate: Record<string, number>;
  srsCards: Record<string, SrsCardState>;
  completedGrammarIds: string[];
  learnedKanjiIds: string[];
  completedReadingIds: string[];
  /** Where the reader got to in each book, keyed by passage id — powers "Continue reading". */
  readingPositions: Record<string, ReadingPosition>;
  /** Japanese words actually read per calendar day (local), keyed yyyy-mm-dd. */
  readingWordsByDate: Record<string, number>;
  /** How far the learner got in each speaking role-play, keyed by scenario id. */
  speakingSessions: Record<string, SpeakingSession>;
  /** Best pronunciation match (0..100) per phrase id, from the Phrases tab's record-and-compare. */
  phraseScores: Record<string, number>;
  /** Turns actually spoken/typed to Kai per calendar day (local), keyed yyyy-mm-dd. */
  speakingTurnsByDate: Record<string, number>;
  quizResults: QuizResult[];
  /** Best accuracy (0..1) achieved on each roadmap week's checkpoint quiz, keyed by week number. */
  weeklyCheckpoints: Record<number, number>;
  /** Best mock-exam result per JLPT level (kept as best accuracy + attempt count). */
  mockExams: Record<string, MockExamRecord>;
  session: StudySession | null;
}

/**
 * How far into one book the reader has actually got.
 *
 * `sentencesRead` is a high-water mark, not a cursor: it only ever goes up, so re-opening a book at
 * the top doesn't wipe out progress, and it's what makes the shelf's per-book percentage a measured
 * number rather than a decorative one.
 */
export interface ReadingPosition {
  sentencesRead: number;
  totalSentences: number;
  /** ISO timestamp of the last time this book was opened — orders the "Continue reading" pick. */
  lastReadAt: string;
}

/**
 * One role-play with Kai, as far as it got.
 *
 * `turns` is a high-water mark like a reading position, so re-opening a scenario and saying nothing
 * can't roll it back. `lastLine` is Kai's most recent line — the one sentence that makes "pick up
 * where you stopped" mean something on a device that doesn't hold the transcript (transcripts stay
 * local, see speakingTranscripts.ts).
 */
export interface SpeakingSession {
  turns: number;
  /** The scenario's turn goal at the time — kept so an old session still renders its own "x / y". */
  turnGoal: number;
  completed: boolean;
  lastLine: string;
  updatedAt: string;
}

export interface MockExamRecord {
  /** Best scaled score (0..180, official JLPT scale) ever achieved on this level's mock exam. */
  bestScore: number;
  /** Whether that best result was an official pass (overall mark + every sectional minimum). */
  passed: boolean;
  attempts: number;
  lastAttempt: string;
}

const STORAGE_KEY = 'progress-v1';

function defaultState(): ProgressState {
  return {
    level: 'N5',
    streak: INITIAL_STREAK,
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

function emptySession(date: string): StudySession {
  const sections = SKILL_AREAS.reduce(
    (acc, skill) => ({ ...acc, [skill]: 'pending' as SectionStatus }),
    {} as Record<SkillArea, SectionStatus>,
  );
  return { date, sections, startedAt: new Date().toISOString(), completedAt: null };
}

// Spreading defaults underneath the stored value means any field added to ProgressState after a user's
// first save (like completedReadingIds below) fills in safely instead of being `undefined` at runtime.
let state: ProgressState = { ...defaultState(), ...readStorage(STORAGE_KEY, defaultState()) };
const listeners = new Set<() => void>();

function setState(updater: (prev: ProgressState) => ProgressState) {
  state = updater(state);
  writeStorage(STORAGE_KEY, state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getProgressSnapshot(): ProgressState {
  return state;
}

/** Notifies on every local progress change — used by progressSync.ts to push updates while signed in. */
export function subscribeProgress(listener: () => void): () => void {
  return subscribe(listener);
}

/** Replaces the whole state wholesale — used only to hydrate from a remote snapshot after sign-in. */
export function replaceProgress(next: ProgressState): void {
  setState(() => next);
}

export function setLevel(level: JlptLevel) {
  setState((s) => ({ ...s, level }));
}

export function recordStudyMinutes(minutes: number, date: string = todayIso()) {
  if (minutes <= 0) return;
  setState((s) => ({
    ...s,
    minutesByDate: { ...s.minutesByDate, [date]: (s.minutesByDate[date] ?? 0) + minutes },
    streak: advanceStreak(s.streak, date),
  }));
}

export function getMinutesToday(s: ProgressState, date: string = todayIso()): number {
  return s.minutesByDate[date] ?? 0;
}

export function getOrCreateTodaySession(): StudySession {
  const today = todayIso();
  if (state.session && state.session.date === today) return state.session;
  const session = emptySession(today);
  setState((s) => ({ ...s, session }));
  return session;
}

export function setSectionStatus(skill: SkillArea, status: SectionStatus) {
  setState((s) => {
    if (!s.session) return s;
    const sections = { ...s.session.sections, [skill]: status };
    const allDone = Object.values(sections).every((st) => st !== 'pending');
    return {
      ...s,
      session: {
        ...s.session,
        sections,
        completedAt: allDone ? new Date().toISOString() : s.session.completedAt,
      },
    };
  });
}

export function getDueSrsCount(s: ProgressState, today: string = todayIso()): number {
  return Object.values(s.srsCards).filter((c) => isCardDue(c, today)).length;
}

export function getSrsCard(s: ProgressState, itemType: SrsItemType, itemId: string): SrsCardState | undefined {
  return s.srsCards[srsKey(itemType, itemId)];
}

export function reviewItem(itemType: SrsItemType, itemId: string, rating: SrsRating) {
  setState((s) => {
    const key = srsKey(itemType, itemId);
    const existing = s.srsCards[key] ?? createInitialSrsCard(itemId, itemType);
    const updated = reviewSrsCard(existing, rating);
    return { ...s, srsCards: { ...s.srsCards, [key]: updated } };
  });
}

export function markGrammarCompleted(id: string) {
  setState((s) =>
    s.completedGrammarIds.includes(id)
      ? s
      : { ...s, completedGrammarIds: [...s.completedGrammarIds, id] },
  );
}

export function markKanjiLearned(id: string) {
  setState((s) =>
    s.learnedKanjiIds.includes(id) ? s : { ...s, learnedKanjiIds: [...s.learnedKanjiIds, id] },
  );
}

export function markReadingCompleted(id: string) {
  setState((s) =>
    s.completedReadingIds.includes(id) ? s : { ...s, completedReadingIds: [...s.completedReadingIds, id] },
  );
}

/**
 * Records that the reader has now reached `sentencesRead` of a book's `totalSentences`, and credits
 * the words in the part they just got through to today's tally.
 *
 * Words are credited by the *difference* in the high-water mark, apportioned from the book's authored
 * word count: reaching sentence 4 of 6 in a 34-word book credits round(34·4/6) − round(34·2/6) for the
 * two sentences newly reached. Because both ends are rounded from the same curve, finishing a book
 * always credits exactly its word count — no drift, and no double-counting when a book is re-read.
 *
 * A call that doesn't advance the mark still refreshes `lastReadAt`, so simply re-opening a book moves
 * it to the front of the "Continue reading" queue.
 */
export function recordReadingPosition(
  id: string,
  sentencesRead: number,
  totalSentences: number,
  wordCount: number,
  date: string = todayIso(),
) {
  if (totalSentences <= 0) return;
  setState((s) => {
    const previous = s.readingPositions[id];
    const before = Math.min(previous?.sentencesRead ?? 0, totalSentences);
    const after = Math.max(before, Math.min(sentencesRead, totalSentences));
    const wordsGained =
      Math.round((wordCount * after) / totalSentences) - Math.round((wordCount * before) / totalSentences);

    return {
      ...s,
      readingPositions: {
        ...s.readingPositions,
        [id]: { sentencesRead: after, totalSentences, lastReadAt: new Date().toISOString() },
      },
      readingWordsByDate:
        wordsGained > 0
          ? { ...s.readingWordsByDate, [date]: (s.readingWordsByDate[date] ?? 0) + wordsGained }
          : s.readingWordsByDate,
    };
  });
}

/** Japanese words read today, across every book. */
export function getReadingWordsToday(s: ProgressState, date: string = todayIso()): number {
  return s.readingWordsByDate[date] ?? 0;
}

/**
 * Records that the learner has now taken `turns` in a scenario with Kai.
 *
 * Like a reading position this is a high-water mark, and `completed` latches once the scenario's turn
 * goal is reached — replaying a finished role-play shows it as finished, not as 3/8 again. Today's
 * turn tally is credited by the *difference*, so the week strip counts turns spoken, not sessions
 * re-opened.
 */
export function recordSpeakingTurn(
  scenarioId: string,
  turns: number,
  turnGoal: number,
  lastLine: string,
  date: string = todayIso(),
) {
  setState((s) => {
    const previous = s.speakingSessions[scenarioId];
    const before = previous?.turns ?? 0;
    const after = Math.max(before, turns);
    const gained = after - before;
    return {
      ...s,
      speakingSessions: {
        ...s.speakingSessions,
        [scenarioId]: {
          turns: after,
          turnGoal,
          completed: (previous?.completed ?? false) || after >= turnGoal,
          lastLine,
          updatedAt: new Date().toISOString(),
        },
      },
      speakingTurnsByDate:
        gained > 0
          ? { ...s.speakingTurnsByDate, [date]: (s.speakingTurnsByDate[date] ?? 0) + gained }
          : s.speakingTurnsByDate,
    };
  });
}

/** Clears one scenario's progress — the conversation view's "Restart", which starts it from scratch. */
export function resetSpeakingSession(scenarioId: string) {
  setState((s) => {
    if (!s.speakingSessions[scenarioId]) return s;
    const speakingSessions = { ...s.speakingSessions };
    delete speakingSessions[scenarioId];
    return { ...s, speakingSessions };
  });
}

/** Keeps the learner's best pronunciation match for a phrase (0..100). */
export function recordPhraseScore(phraseId: string, score: number) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  setState((s) => ({
    ...s,
    phraseScores: { ...s.phraseScores, [phraseId]: Math.max(s.phraseScores[phraseId] ?? 0, clamped) },
  }));
}

/**
 * The last `days` calendar days, oldest first, each flagged with whether the learner spoke that day —
 * the Speaking page's week strip.
 */
export function getSpeakingDays(s: ProgressState, days = 7, today: string = todayIso()) {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - (days - 1));
    return { date, spoke: (s.speakingTurnsByDate[date] ?? 0) > 0 };
  });
}

export function recordQuizResult(result: Omit<QuizResult, 'id' | 'date'>) {
  setState((s) => ({
    ...s,
    quizResults: [
      ...s.quizResults,
      { ...result, id: crypto.randomUUID(), date: todayIso() },
    ],
  }));
}

/** Records a roadmap week's checkpoint result, keeping the learner's best accuracy for that week. */
export function recordCheckpointResult(week: number, correct: number, total: number) {
  if (total <= 0) return;
  const accuracy = correct / total;
  setState((s) => ({
    ...s,
    weeklyCheckpoints: {
      ...s.weeklyCheckpoints,
      [week]: Math.max(s.weeklyCheckpoints[week] ?? 0, accuracy),
    },
  }));
}

/**
 * Records a mock-exam attempt on the official JLPT scale: keeps the learner's best scaled score (0–180)
 * and pass status for that level, and logs a `mock-test` QuizResult so its correct answers feed the
 * derived XP score like any other quiz. `passed` reflects the full official rule (overall + sectionals).
 */
export function recordMockExamResult(level: JlptLevel, correct: number, total: number, scaled: number, passed: boolean) {
  if (total <= 0) return;
  setState((s) => {
    const prev = s.mockExams[level];
    const record: MockExamRecord = {
      bestScore: Math.max(prev?.bestScore ?? 0, scaled),
      passed: (prev?.passed ?? false) || passed,
      attempts: (prev?.attempts ?? 0) + 1,
      lastAttempt: todayIso(),
    };
    return {
      ...s,
      mockExams: { ...s.mockExams, [level]: record },
      quizResults: [
        ...s.quizResults,
        { id: crypto.randomUUID(), quizId: `mock-${level}`, skill: 'mock-test', level, date: todayIso(), correct, total },
      ],
    };
  });
}

export function resetAllProgress() {
  setState(() => defaultState());
}
