import { useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from './storage';
import { todayIso } from './date';
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
}

export interface ProgressState {
  level: JlptLevel;
  streak: StreakState;
  minutesByDate: Record<string, number>;
  srsCards: Record<string, SrsCardState>;
  completedGrammarIds: string[];
  learnedKanjiIds: string[];
  completedReadingIds: string[];
  quizResults: QuizResult[];
  /** Best accuracy (0..1) achieved on each roadmap week's checkpoint quiz, keyed by week number. */
  weeklyCheckpoints: Record<number, number>;
  /** Best mock-exam result per JLPT level (kept as best accuracy + attempt count). */
  mockExams: Record<string, MockExamRecord>;
  session: StudySession | null;
}

export interface MockExamRecord {
  /** Best accuracy (0..1) ever achieved on this level's mock exam. */
  bestPercent: number;
  /** Whether the best result cleared the pass threshold. */
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
 * Records a mock-exam attempt: keeps the learner's best accuracy + pass status for that level, and
 * logs a `mock-test` QuizResult so its correct answers feed the derived XP score like any other quiz.
 */
export function recordMockExamResult(level: JlptLevel, correct: number, total: number, passThreshold: number) {
  if (total <= 0) return;
  const accuracy = correct / total;
  setState((s) => {
    const prev = s.mockExams[level];
    const bestPercent = Math.max(prev?.bestPercent ?? 0, accuracy);
    const record: MockExamRecord = {
      bestPercent,
      passed: bestPercent >= passThreshold,
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
