import { GRAMMAR_POINTS } from '../data/grammar';
import { VOCABULARY } from '../data/vocabulary';
import { KANJI_LIST } from '../data/kanji';
import { READINGS } from '../data/readings';
import { SCENARIOS } from '../data/scenarios';
import { ROADMAP } from '../data/roadmap';
import { buildListeningPool } from './listeningPool';
import { getLearningStats } from './learningState';
import type { ProgressState } from './progressStore';
import type { MilestoneCategory } from './milestones';
import type { SrsItemType } from '../types';
import { JLPT_LEVELS } from '../types';
import { todayIso } from './date';

/**
 * The four numbers every category banner reports, from one place.
 *
 * They're the app's own four learning states, so they always add up to the pool and each one means
 * exactly one thing:
 *
 *   done     items whose SRS interval has reached the mastered threshold — what the ring calls
 *            "Completed", deliberately the strictest reading of the word
 *   learned  items you've started at all (the pool minus the ones never touched)
 *   review   items due today
 *   toLearn  items never seen
 *
 * Learning Path and Mock Exam have no SRS deck of their own, so they map onto the nearest real thing
 * they *do* record — weeks and sittings. Nothing here is invented; a category with nothing to report
 * reports zeroes.
 */
export interface CategoryStats {
  done: number;
  total: number;
  learned: number;
  review: number;
  toLearn: number;
  /** 0..1, `done / total` — drives the ring. */
  percent: number;
}

/** The six content sections whose items are scheduled through the SRS engine. */
const SRS_POOLS: Record<string, { type: SrsItemType; ids: () => string[] }> = {
  grammar: { type: 'grammar', ids: () => GRAMMAR_POINTS.map((p) => p.id) },
  vocabulary: { type: 'vocabulary', ids: () => VOCABULARY.map((v) => v.id) },
  kanji: { type: 'kanji', ids: () => KANJI_LIST.map((k) => k.id) },
  reading: { type: 'reading', ids: () => READINGS.map((r) => r.id) },
  // The listening pool is generated from the vocab and grammar sentences, so its size is the honest
  // denominator here — the same items the exercise actually draws from.
  listening: { type: 'listening', ids: () => buildListeningPool().map((i) => i.id) },
  speaking: { type: 'speaking', ids: () => SCENARIOS.map((s) => s.id) },
};

function fromSrs(key: string, progress: ProgressState, today: string): CategoryStats {
  const pool = SRS_POOLS[key];
  const ids = pool.ids();
  const stats = getLearningStats(pool.type, ids, progress, today);
  return {
    done: stats.masteredCount,
    total: stats.totalCount,
    learned: stats.totalCount - stats.newCount,
    review: stats.reviewDueCount,
    toLearn: stats.newCount,
    percent: stats.totalCount > 0 ? stats.masteredCount / stats.totalCount : 0,
  };
}

function withPercent(s: Omit<CategoryStats, 'percent'>): CategoryStats {
  return { ...s, percent: s.total > 0 ? s.done / s.total : 0 };
}

export function categoryStats(
  category: MilestoneCategory,
  progress: ProgressState,
  today: string = todayIso(),
): CategoryStats {
  if (category in SRS_POOLS) return fromSrs(category, progress, today);

  if (category === 'learning-path') {
    // A week counts as done once its checkpoint has been passed at all; "review" is the unlocked-but-
    // unproven middle, which is exactly the set worth working on next.
    const mastered = Object.keys(progress.weeklyCheckpoints).length;
    const started = Object.values(progress.weeklyCheckpoints).filter((a) => a > 0).length;
    return withPercent({
      done: mastered,
      total: ROADMAP.length,
      learned: started,
      review: Math.max(0, started - mastered),
      toLearn: Math.max(0, ROADMAP.length - started),
    });
  }

  if (category === 'mock') {
    const records = JLPT_LEVELS.map((lv) => progress.mockExams[lv]);
    const attempted = records.filter(Boolean).length;
    const passed = records.filter((r) => r?.passed).length;
    return withPercent({
      done: passed,
      total: JLPT_LEVELS.length,
      learned: attempted,
      review: Math.max(0, attempted - passed),
      toLearn: Math.max(0, JLPT_LEVELS.length - attempted),
    });
  }

  // Dashboard: the whole course at once, summed across the six decks.
  const parts = Object.keys(SRS_POOLS).map((key) => fromSrs(key, progress, today));
  return withPercent({
    done: parts.reduce((n, p) => n + p.done, 0),
    total: parts.reduce((n, p) => n + p.total, 0),
    learned: parts.reduce((n, p) => n + p.learned, 0),
    review: parts.reduce((n, p) => n + p.review, 0),
    toLearn: parts.reduce((n, p) => n + p.toLearn, 0),
  });
}
