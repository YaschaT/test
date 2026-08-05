import { useMemo } from 'react';
import { KanjiSession } from '../../components/kanji/review/KanjiSession';
import { KANJI_LIST } from '../../data/kanji';
import { useProgress } from '../../lib/progressStore';
import { buildReviewQueue } from '../../lib/reviewQueue';

/**
 * The SRS review session: a finite queue of what's actually due, graded card by card. Opening a
 * specific kanji from the grid goes through KanjiDetail instead, which runs the same session in
 * browse mode over the whole deck.
 */
export function KanjiReview() {
  const progress = useProgress();
  // Captured once per mount so the queue doesn't reshuffle mid-session as cards update.
  const queue = useMemo(() => buildReviewQueue(KANJI_LIST, 'kanji', progress, 10), []); // eslint-disable-line react-hooks/exhaustive-deps

  return <KanjiSession queue={queue} mode="review" title="Kanji review" exitTo="/kanji" />;
}
