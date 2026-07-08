import type { SrsItemType } from '../types';
import type { ProgressState } from './progressStore';
import { getSrsCard } from './progressStore';
import { isCardDue } from './srs';
import { todayIso } from './date';

/** Due cards first (oldest due date first), then a capped number of not-yet-seen items. */
export function buildReviewQueue<T extends { id: string }>(
  items: T[],
  itemType: SrsItemType,
  progress: ProgressState,
  newItemLimit = 10,
  today: string = todayIso(),
): T[] {
  const due: T[] = [];
  const unseen: T[] = [];

  for (const item of items) {
    const card = getSrsCard(progress, itemType, item.id);
    if (!card) {
      unseen.push(item);
    } else if (isCardDue(card, today)) {
      due.push(item);
    }
  }

  due.sort((a, b) => {
    const cardA = getSrsCard(progress, itemType, a.id)!;
    const cardB = getSrsCard(progress, itemType, b.id)!;
    return cardA.dueDate.localeCompare(cardB.dueDate);
  });

  return [...due, ...unseen.slice(0, newItemLimit)];
}
