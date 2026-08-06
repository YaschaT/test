import { useMemo } from 'react';
import { VocabSession } from '../../components/vocabulary/review/VocabSession';
import { VOCABULARY } from '../../data/vocabulary';
import { useProgress } from '../../lib/progressStore';
import { buildReviewQueue } from '../../lib/reviewQueue';

/** The SRS review queue. The session itself is shared with browsing a word from the grid. */
export function VocabReview() {
  const progress = useProgress();

  // Queue is captured once per mount so it doesn't reshuffle mid-session as cards update.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const queue = useMemo(() => buildReviewQueue(VOCABULARY, 'vocabulary', progress, 10), []);

  return <VocabSession queue={queue} mode="review" title="Vocabulary review" exitTo="/vocabulary" />;
}
