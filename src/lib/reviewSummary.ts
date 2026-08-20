import type { SrsItemType, SrsRating, Translatable } from '../types';
import type { ProgressState } from './progressStore';
import { getSrsCard } from './progressStore';
import { MASTERED_INTERVAL_DAYS } from './learningState';
import { calculateXp } from './xp';

/** One grade press, in the order it happened. The same id can appear twice when browsing back a card. */
export interface GradedCard {
  id: string;
  rating: SrsRating;
}

/**
 * What the deck looked like *before* the session started. Captured once on mount so the completion
 * screen can say what this session actually changed — XP earned, words met for the first time, cards
 * that crossed into the mastered range — instead of restating totals the learner already had.
 */
export interface ReviewBaseline {
  xp: number;
  unseen: Set<string>;
  mastered: Set<string>;
}

export function captureReviewBaseline(
  itemType: SrsItemType,
  ids: string[],
  progress: ProgressState,
): ReviewBaseline {
  const unseen = new Set<string>();
  const mastered = new Set<string>();
  for (const id of ids) {
    const card = getSrsCard(progress, itemType, id);
    if (!card) unseen.add(id);
    else if (card.intervalDays >= MASTERED_INTERVAL_DAYS) mastered.add(id);
  }
  return { xp: calculateXp(progress), unseen, mastered };
}

/** A group of cards that come back around the same time — one node on the completion screen's horizon. */
export interface HorizonBucket {
  key: string;
  label: Translatable;
  count: number;
  minDays: number;
  maxDays: number;
  /** True when every card in the bucket sits at or past the 21-day mastered threshold. */
  mastered: boolean;
}

export interface ReviewSummary {
  /** Grade presses, not distinct cards — matches the tally the session rail counted as you went. */
  graded: number;
  correct: number;
  /** 0–1, share of presses graded Good or Easy. 0 when nothing was graded. */
  accuracy: number;
  counts: Record<SrsRating, number>;
  /** Distinct cards met for the very first time in this session. */
  firstLearned: number;
  /** Distinct cards that crossed the mastered interval during this session. */
  newlyMastered: number;
  masteredIds: string[];
  /** XP the session genuinely added, measured against the baseline snapshot. */
  xpEarned: number;
  buckets: HorizonBucket[];
  /** Cards last graded Again or Hard — Again first, then Hard, each in the order they were graded. */
  weakIds: string[];
}

const BUCKET_EDGES: { key: string; maxDays: number }[] = [
  { key: 'tomorrow', maxDays: 1 },
  { key: 'soon', maxDays: 5 },
  { key: 'week', maxDays: 13 },
  { key: 'fortnight', maxDays: 20 },
  { key: 'long', maxDays: Number.POSITIVE_INFINITY },
];

function inDays(days: number): Translatable {
  if (days >= 14) {
    const weeks = Math.round(days / 7);
    return { en: `In ${weeks} weeks`, nl: `Over ${weeks} weken` };
  }
  return { en: `In ${days} days`, nl: `Over ${days} dagen` };
}

/** Labels a bucket from the real intervals inside it, so "in 2–5 days" always means exactly that. */
export function horizonLabel(minDays: number, maxDays: number): Translatable {
  if (maxDays <= 1) return { en: 'Tomorrow', nl: 'Morgen' };
  if (minDays === maxDays) return inDays(minDays);
  if (maxDays >= 14) {
    const from = Math.max(1, Math.round(minDays / 7));
    const to = Math.round(maxDays / 7);
    return from === to
      ? { en: `In ${to} weeks`, nl: `Over ${to} weken` }
      : { en: `In ${from}–${to} weeks`, nl: `Over ${from}–${to} weken` };
  }
  return {
    en: `In ${minDays}–${maxDays} days`,
    nl: `Over ${minDays}–${maxDays} dagen`,
  };
}

/**
 * Turns a finished session into the numbers the completion screen shows.
 *
 * Every field is read back out of the real scheduler afterwards rather than predicted while grading:
 * the horizon buckets are the intervals `reviewSrsCard` actually assigned, and the XP is the difference
 * between two real `calculateXp` reads. Nothing here is an estimate.
 */
export function buildReviewSummary(
  itemType: SrsItemType,
  graded: GradedCard[],
  baseline: ReviewBaseline,
  progress: ProgressState,
): ReviewSummary {
  const counts: Record<SrsRating, number> = {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };
  // A card graded twice (possible while browsing back) counts once here, at its final grade.
  const finalRating = new Map<string, SrsRating>();
  for (const g of graded) {
    counts[g.rating] += 1;
    finalRating.set(g.id, g.rating);
  }

  const correct = counts.good + counts.easy;
  const ids = [...finalRating.keys()];

  const byBucket = new Map<string, { count: number; minDays: number; maxDays: number }>();
  const masteredIds: string[] = [];
  let firstLearned = 0;

  for (const id of ids) {
    if (baseline.unseen.has(id)) firstLearned += 1;
    const card = getSrsCard(progress, itemType, id);
    if (!card) continue;
    const days = Math.max(1, card.intervalDays);
    if (days >= MASTERED_INTERVAL_DAYS && !baseline.mastered.has(id)) masteredIds.push(id);

    const edge = BUCKET_EDGES.find((b) => days <= b.maxDays) ?? BUCKET_EDGES[BUCKET_EDGES.length - 1];
    const existing = byBucket.get(edge.key);
    if (existing) {
      existing.count += 1;
      existing.minDays = Math.min(existing.minDays, days);
      existing.maxDays = Math.max(existing.maxDays, days);
    } else {
      byBucket.set(edge.key, { count: 1, minDays: days, maxDays: days });
    }
  }

  const buckets: HorizonBucket[] = BUCKET_EDGES.filter((edge) => byBucket.has(edge.key)).map((edge) => {
    const group = byBucket.get(edge.key)!;
    return {
      key: edge.key,
      label: horizonLabel(group.minDays, group.maxDays),
      count: group.count,
      minDays: group.minDays,
      maxDays: group.maxDays,
      mastered: group.minDays >= MASTERED_INTERVAL_DAYS,
    };
  });

  const order: SrsRating[] = ['again', 'hard'];
  const weakIds = order.flatMap((rating) => ids.filter((id) => finalRating.get(id) === rating));

  return {
    graded: graded.length,
    correct,
    accuracy: graded.length > 0 ? correct / graded.length : 0,
    counts,
    firstLearned,
    newlyMastered: masteredIds.length,
    masteredIds,
    xpEarned: Math.max(0, calculateXp(progress) - baseline.xp),
    buckets,
    weakIds,
  };
}
