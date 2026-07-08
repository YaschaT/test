import type { SrsItemType } from '../types';
import type { ProgressState } from './progressStore';
import { getSrsCard } from './progressStore';
import { isCardDue } from './srs';
import { todayIso } from './date';

export type LearningState = 'new' | 'practice' | 'review' | 'mastered';

/** A card counts as "mastered" once its SRS interval reaches 21 days — the same "mature card" threshold
 * Anki uses, so it reflects genuine long-term retention rather than an arbitrary number. Shared by both
 * Vocabulary and Kanji since both are scheduled through the same SM-2 SRS engine (see srs.ts). */
export const MASTERED_INTERVAL_DAYS = 21;

export function getLearningState(
  itemType: SrsItemType,
  itemId: string,
  progress: ProgressState,
  today: string = todayIso(),
): LearningState {
  const card = getSrsCard(progress, itemType, itemId);
  if (!card) return 'new';
  if (isCardDue(card, today)) return 'review';
  if (card.intervalDays >= MASTERED_INTERVAL_DAYS) return 'mastered';
  return 'practice';
}

/** 0-100 for a card's progress bar — scales with real SRS interval growth, capped at the mastered
 * threshold so "mastered" cards always read as full. */
export function getLearningProgress(itemType: SrsItemType, itemId: string, progress: ProgressState): number {
  const card = getSrsCard(progress, itemType, itemId);
  if (!card) return 0;
  return Math.max(4, Math.min(100, Math.round((card.intervalDays / MASTERED_INTERVAL_DAYS) * 100)));
}

export interface LearningStats {
  totalCount: number;
  learnedCount: number;
  newCount: number;
  reviewDueCount: number;
  masteredCount: number;
  longestStreak: number;
  learnedPercent: number;
}

export function getLearningStats(
  itemType: SrsItemType,
  ids: string[],
  progress: ProgressState,
  today: string = todayIso(),
): LearningStats {
  let learnedCount = 0;
  let newCount = 0;
  let reviewDueCount = 0;
  let masteredCount = 0;

  for (const id of ids) {
    const state = getLearningState(itemType, id, progress, today);
    if (state === 'new') newCount++;
    else learnedCount++;
    if (state === 'review') reviewDueCount++;
    if (state === 'mastered') masteredCount++;
  }

  return {
    totalCount: ids.length,
    learnedCount,
    newCount,
    reviewDueCount,
    masteredCount,
    longestStreak: progress.streak.longest,
    learnedPercent: ids.length > 0 ? Math.round((learnedCount / ids.length) * 100) : 0,
  };
}
