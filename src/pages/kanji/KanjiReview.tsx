import { useMemo, useState } from 'react';
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
  const [round, setRound] = useState(0);

  // Captured once per round so the queue doesn't reshuffle mid-session as cards update; starting
  // another round bumps `round`, which rebuilds it and remounts the session through the key below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queue = useMemo(() => buildReviewQueue(KANJI_LIST, 'kanji', progress, 10), [round]);

  // What a queue built *right now* would hold — see VocabReview for why this is honest at the point
  // the completion screen reads it.
  const nextRoundCount = useMemo(
    () => buildReviewQueue(KANJI_LIST, 'kanji', progress, 10).length,
    [progress],
  );

  return (
    <KanjiSession
      key={round}
      queue={queue}
      mode="review"
      title="Kanji review"
      exitTo="/kanji"
      nextRound={
        nextRoundCount > 0 ? { count: nextRoundCount, onStart: () => setRound((r) => r + 1) } : undefined
      }
    />
  );
}
