import { useMemo, useState } from 'react';
import { VocabSession } from '../../components/vocabulary/review/VocabSession';
import { VOCABULARY } from '../../data/vocabulary';
import { useProgress } from '../../lib/progressStore';
import { buildReviewQueue } from '../../lib/reviewQueue';

/** The SRS review queue. The session itself is shared with browsing a word from the grid. */
export function VocabReview() {
  const progress = useProgress();
  const [round, setRound] = useState(0);

  // Queue is captured once per round so it doesn't reshuffle mid-session as cards update. Starting
  // another round bumps `round`, which rebuilds it and remounts the session through the key below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queue = useMemo(() => buildReviewQueue(VOCABULARY, 'vocabulary', progress, 10), [round]);

  // What a queue built *right now* would hold. Every card graded this session has been scheduled into
  // the future, so by the time the completion screen reads this it is genuinely what is left to do —
  // due cards that never made the cut, plus the next batch of words never seen before.
  const nextRoundCount = useMemo(
    () => buildReviewQueue(VOCABULARY, 'vocabulary', progress, 10).length,
    [progress],
  );

  return (
    <VocabSession
      key={round}
      queue={queue}
      mode="review"
      title="Vocabulary review"
      exitTo="/vocabulary"
      nextRound={
        nextRoundCount > 0 ? { count: nextRoundCount, onStart: () => setRound((r) => r + 1) } : undefined
      }
    />
  );
}
