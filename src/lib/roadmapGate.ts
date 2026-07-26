import type { RoadmapWeek, SrsCardState } from '../types';
import { srsKey } from './srs';

/**
 * Mastery gates for the 22-week path (`src/data/roadmap.ts`).
 *
 * A week opens because the learner has *demonstrated* the previous one — completed items,
 * retained SRS cards, and a passing checkpoint — never because a number of days elapsed.
 * These functions are pure so they can be unit-tested and reused by the dashboard and the
 * roadmap page without touching the store directly.
 */

/** The slices of progress a gate needs. Matches fields on ProgressState in progressStore.ts. */
export interface GateProgress {
  completedGrammarIds: string[];
  learnedKanjiIds: string[];
  completedReadingIds: string[];
  srsCards: Record<string, SrsCardState>;
  /** Best checkpoint accuracy (0..1) recorded for this week, if the learner has taken it. */
  checkpointAccuracyByWeek: Record<number, number>;
}

export interface GateCriterion {
  key: 'grammar' | 'kanji' | 'vocab' | 'reading' | 'checkpoint';
  required: number;
  actual: number;
  met: boolean;
}

export interface GateEvaluation {
  week: number;
  /** True only when every applicable criterion is met. A week with no required criteria is open. */
  passed: boolean;
  criteria: GateCriterion[];
}

function weekContentIds(week: RoadmapWeek) {
  const grammar = new Set<string>();
  const vocab = new Set<string>();
  const kanji = new Set<string>();
  const reading = new Set<string>();
  for (const u of week.units) {
    u.grammarIds.forEach((id) => grammar.add(id));
    u.vocabIds.forEach((id) => vocab.add(id));
    u.kanjiIds.forEach((id) => kanji.add(id));
    u.readingIds.forEach((id) => reading.add(id));
  }
  return { grammar: [...grammar], vocab: [...vocab], kanji: [...kanji], reading: [...reading] };
}

/** Fraction of ids present in a completed-id list. An empty required set counts as fully met (1). */
function fractionComplete(ids: string[], completed: string[]): number {
  if (ids.length === 0) return 1;
  const set = new Set(completed);
  return ids.filter((id) => set.has(id)).length / ids.length;
}

/** A vocab card counts as "retained" once it has at least one non-failing repetition. */
function fractionRetained(vocabIds: string[], srsCards: Record<string, SrsCardState>): number {
  if (vocabIds.length === 0) return 1;
  const retained = vocabIds.filter((id) => {
    const card = srsCards[srsKey('vocabulary', id)];
    return !!card && card.repetitions >= 1;
  }).length;
  return retained / vocabIds.length;
}

export function evaluateGate(week: RoadmapWeek, progress: GateProgress): GateEvaluation {
  const ids = weekContentIds(week);
  const { gate } = week;
  const criteria: GateCriterion[] = [];

  if (gate.grammarCompletion != null) {
    const actual = fractionComplete(ids.grammar, progress.completedGrammarIds);
    criteria.push({ key: 'grammar', required: gate.grammarCompletion, actual, met: actual >= gate.grammarCompletion });
  }
  if (gate.kanjiCompletion != null) {
    const actual = fractionComplete(ids.kanji, progress.learnedKanjiIds);
    criteria.push({ key: 'kanji', required: gate.kanjiCompletion, actual, met: actual >= gate.kanjiCompletion });
  }
  if (gate.vocabMastery != null) {
    const actual = fractionRetained(ids.vocab, progress.srsCards);
    criteria.push({ key: 'vocab', required: gate.vocabMastery, actual, met: actual >= gate.vocabMastery });
  }
  if (gate.readingCompletion != null) {
    const actual = fractionComplete(ids.reading, progress.completedReadingIds);
    criteria.push({ key: 'reading', required: gate.readingCompletion, actual, met: actual >= gate.readingCompletion });
  }
  if (gate.minCheckpointAccuracy != null) {
    const actual = progress.checkpointAccuracyByWeek[week.week] ?? 0;
    criteria.push({ key: 'checkpoint', required: gate.minCheckpointAccuracy, actual, met: actual >= gate.minCheckpointAccuracy });
  }

  return { week: week.week, passed: criteria.every((c) => c.met), criteria };
}

/**
 * A week is unlocked when every prerequisite week's gate has passed. Week 1 (no prerequisites)
 * is always unlocked. This is the time-independent progression the brief asks for.
 */
export function isWeekUnlocked(week: RoadmapWeek, allWeeks: RoadmapWeek[], progress: GateProgress): boolean {
  if (week.prerequisiteWeeks.length === 0) return true;
  return week.prerequisiteWeeks.every((wNum) => {
    const prereq = allWeeks.find((w) => w.week === wNum);
    return prereq ? evaluateGate(prereq, progress).passed : false;
  });
}
