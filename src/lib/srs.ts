import type { SrsCardState, SrsItemType, SrsRating } from '../types';
import { addDays, todayIso } from './date';

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;

export function createInitialSrsCard(itemId: string, itemType: SrsItemType): SrsCardState {
  return {
    itemId,
    itemType,
    easeFactor: DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
    dueDate: todayIso(),
    lastReviewed: null,
  };
}

/** SM-2-style scheduler driven by the four Anki-style ratings. Pure function, no I/O — see srs.test.ts. */
export function reviewSrsCard(
  card: SrsCardState,
  rating: SrsRating,
  today: string = todayIso(),
): SrsCardState {
  let { easeFactor, intervalDays, repetitions } = card;

  switch (rating) {
    case 'again':
      repetitions = 0;
      intervalDays = 1;
      easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
      break;
    case 'hard':
      repetitions += 1;
      intervalDays = Math.max(1, Math.round((intervalDays || 1) * 1.2));
      easeFactor = Math.max(MIN_EASE, easeFactor - 0.15);
      break;
    case 'good':
      repetitions += 1;
      if (repetitions === 1) intervalDays = 1;
      else if (repetitions === 2) intervalDays = 6;
      else intervalDays = Math.round((intervalDays || 1) * easeFactor);
      break;
    case 'easy':
      repetitions += 1;
      if (repetitions === 1) intervalDays = 2;
      else if (repetitions === 2) intervalDays = 8;
      else intervalDays = Math.round((intervalDays || 1) * easeFactor * 1.3);
      easeFactor = easeFactor + 0.15;
      break;
  }

  return {
    ...card,
    easeFactor,
    intervalDays,
    repetitions,
    dueDate: addDays(today, intervalDays),
    lastReviewed: today,
  };
}

export function isCardDue(card: SrsCardState, today: string = todayIso()): boolean {
  return card.dueDate <= today;
}

export function srsKey(itemType: SrsItemType, itemId: string): string {
  return `${itemType}:${itemId}`;
}
