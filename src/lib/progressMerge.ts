import type { ProgressState, QuizResult, StudySession } from './progressStore';
import type { SrsCardState } from '../types';
import { JLPT_LEVELS } from '../types';

/**
 * Merges two progress snapshots into one that keeps the best of both.
 *
 * Cross-device sync used to be last-write-wins: whichever device pushed most recently replaced the
 * other's progress wholesale, so studying on an iPad and then opening the desktop (which still held an
 * older local copy) silently threw work away. Learning progress is *monotonic* — you don't un-learn a
 * kanji — so the correct resolution is a union/best-of merge rather than a winner.
 *
 * The merge is deliberately **commutative and idempotent**: merge(a,b) === merge(b,a), and merging an
 * already-merged result changes nothing. That matters because both devices run this on every sign-in
 * and push the result back; anything that accumulated (e.g. summing minutes) would inflate forever.
 */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  return {
    level: higherLevel(a.level, b.level),
    streak: mergeStreak(a, b),
    minutesByDate: mergeNumberMap(a.minutesByDate, b.minutesByDate),
    srsCards: mergeSrsCards(a.srsCards, b.srsCards),
    completedGrammarIds: union(a.completedGrammarIds, b.completedGrammarIds),
    learnedKanjiIds: union(a.learnedKanjiIds, b.learnedKanjiIds),
    completedReadingIds: union(a.completedReadingIds, b.completedReadingIds),
    readingPositions: mergeReadingPositions(a.readingPositions, b.readingPositions),
    readingWordsByDate: mergeNumberMap(a.readingWordsByDate, b.readingWordsByDate),
    speakingSessions: mergeSpeakingSessions(a.speakingSessions, b.speakingSessions),
    phraseScores: mergeNumberMap(a.phraseScores, b.phraseScores),
    speakingTurnsByDate: mergeNumberMap(a.speakingTurnsByDate, b.speakingTurnsByDate),
    quizResults: mergeQuizResults(a.quizResults, b.quizResults),
    weeklyCheckpoints: mergeNumberMap(a.weeklyCheckpoints, b.weeklyCheckpoints),
    mockExams: mergeMockExams(a.mockExams, b.mockExams),
    session: mergeSession(a.session, b.session),
  };
}

/** The further-along level wins (N5 → N4 → N3), so a device left behind never demotes the other. */
function higherLevel(a: ProgressState['level'], b: ProgressState['level']): ProgressState['level'] {
  return JLPT_LEVELS.indexOf(a) >= JLPT_LEVELS.indexOf(b) ? a : b;
}

function union(a: string[] = [], b: string[] = []): string[] {
  return [...new Set([...a, ...b])];
}

/** Per key, the larger value wins — max (not sum) so re-merging the same data can't inflate it. */
function mergeNumberMap<K extends string | number>(
  a: Record<K, number> = {} as Record<K, number>,
  b: Record<K, number> = {} as Record<K, number>,
): Record<K, number> {
  const out = { ...a } as Record<K, number>;
  for (const [key, value] of Object.entries(b) as [K, number][]) {
    const existing = out[key];
    out[key] = existing == null ? value : Math.max(existing, value);
  }
  return out;
}

function mergeStreak(a: ProgressState, b: ProgressState): ProgressState['streak'] {
  const sa = a.streak;
  const sb = b.streak;
  // The device that studied most recently owns `current`; `longest` is a high-water mark either can hold.
  const aIsNewer = (sa.lastStudyDate ?? '') >= (sb.lastStudyDate ?? '');
  const newer = aIsNewer ? sa : sb;
  const sameDay = sa.lastStudyDate === sb.lastStudyDate;
  return {
    current: sameDay ? Math.max(sa.current, sb.current) : newer.current,
    longest: Math.max(sa.longest, sb.longest),
    lastStudyDate: newer.lastStudyDate,
  };
}

/**
 * Per card, keeps the more recently reviewed copy — that's the one whose SRS scheduling reflects the
 * latest answer. Ties fall back to whichever is further along, so a card is never rolled backwards.
 */
function mergeSrsCards(
  a: Record<string, SrsCardState> = {},
  b: Record<string, SrsCardState> = {},
): Record<string, SrsCardState> {
  const out: Record<string, SrsCardState> = { ...a };
  for (const [key, card] of Object.entries(b)) {
    const existing = out[key];
    if (!existing) {
      out[key] = card;
      continue;
    }
    out[key] = laterCard(existing, card);
  }
  return out;
}

function laterCard(a: SrsCardState, b: SrsCardState): SrsCardState {
  const ra = a.lastReviewed ?? '';
  const rb = b.lastReviewed ?? '';
  if (ra !== rb) return ra > rb ? a : b;
  if (a.repetitions !== b.repetitions) return a.repetitions > b.repetitions ? a : b;
  return a.intervalDays >= b.intervalDays ? a : b;
}

/** Quiz results are an append-only log with unique ids, so the union is the full history. */
function mergeQuizResults(a: QuizResult[] = [], b: QuizResult[] = []): QuizResult[] {
  const byId = new Map<string, QuizResult>();
  for (const result of [...a, ...b]) byId.set(result.id, result);
  return [...byId.values()].sort((x, y) => x.date.localeCompare(y.date));
}

/**
 * Per book, the further-along position wins — reading position is a high-water mark, so the device
 * that got deeper is right even if the other one opened the book more recently. `lastReadAt` still
 * takes the later of the two, so "Continue reading" surfaces whatever was genuinely touched last.
 */
function mergeReadingPositions(
  a: ProgressState['readingPositions'] = {},
  b: ProgressState['readingPositions'] = {},
): ProgressState['readingPositions'] {
  const out: ProgressState['readingPositions'] = { ...a };
  for (const [id, position] of Object.entries(b)) {
    const existing = out[id];
    if (!existing) {
      out[id] = position;
      continue;
    }
    out[id] = {
      sentencesRead: Math.max(existing.sentencesRead, position.sentencesRead),
      // A book can be re-authored with more sentences; the larger total is the current one.
      totalSentences: Math.max(existing.totalSentences, position.totalSentences),
      lastReadAt: existing.lastReadAt > position.lastReadAt ? existing.lastReadAt : position.lastReadAt,
    };
  }
  return out;
}

/**
 * Per scenario, the device that got further owns the turn count, and finishing it anywhere counts as
 * finished. `lastLine` has to come from whichever copy was touched last, though — pairing the newest
 * line with an older device's turn count would put the wrong sentence on the "pick up where you
 * stopped" card.
 */
function mergeSpeakingSessions(
  a: ProgressState['speakingSessions'] = {},
  b: ProgressState['speakingSessions'] = {},
): ProgressState['speakingSessions'] {
  const out: ProgressState['speakingSessions'] = { ...a };
  for (const [id, session] of Object.entries(b)) {
    const existing = out[id];
    if (!existing) {
      out[id] = session;
      continue;
    }
    const newer = existing.updatedAt >= session.updatedAt ? existing : session;
    out[id] = {
      turns: Math.max(existing.turns, session.turns),
      turnGoal: Math.max(existing.turnGoal, session.turnGoal),
      completed: existing.completed || session.completed,
      lastLine: newer.lastLine,
      updatedAt: newer.updatedAt,
    };
  }
  return out;
}

function mergeMockExams(
  a: ProgressState['mockExams'] = {},
  b: ProgressState['mockExams'] = {},
): ProgressState['mockExams'] {
  const out: ProgressState['mockExams'] = { ...a };
  for (const [key, record] of Object.entries(b)) {
    const existing = out[key];
    if (!existing) {
      out[key] = record;
      continue;
    }
    // `passed` must stay tied to the best score it was actually achieved with, not OR-ed independently.
    const best = record.bestScore > existing.bestScore ? record : existing;
    out[key] = {
      bestScore: best.bestScore,
      passed: best.passed,
      attempts: Math.max(existing.attempts, record.attempts),
      lastAttempt: existing.lastAttempt > record.lastAttempt ? existing.lastAttempt : record.lastAttempt,
    };
  }
  return out;
}

/** Only today's plan matters; for the same day, a section counts as done if either device finished it. */
function mergeSession(a: StudySession | null, b: StudySession | null): StudySession | null {
  if (!a) return b;
  if (!b) return a;
  if (a.date !== b.date) return a.date > b.date ? a : b;

  const sections = { ...a.sections };
  for (const [skill, status] of Object.entries(b.sections) as [keyof typeof sections, string][]) {
    if (sections[skill] === 'completed' || status === 'completed') sections[skill] = 'completed';
    else if (sections[skill] === 'skipped' || status === 'skipped') sections[skill] = 'skipped';
  }
  return {
    date: a.date,
    sections,
    startedAt: a.startedAt < b.startedAt ? a.startedAt : b.startedAt,
    completedAt: a.completedAt ?? b.completedAt,
  };
}
