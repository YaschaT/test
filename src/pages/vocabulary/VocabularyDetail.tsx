import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { VocabSession } from '../../components/vocabulary/review/VocabSession';
import { VOCABULARY } from '../../data/vocabulary';
import { filterVocabulary, loadVocabFilters } from '../../lib/vocabFilter';

/**
 * Opening a word from the grid.
 *
 * This used to expand an accordion inside the card — you read the example, then had nowhere to go and
 * nothing was recorded. It now runs the same card session as the kanji grid, opened at the word you
 * tapped with the rest of the deck behind it, so you can page (or swipe) through and grade in place.
 */
export function VocabularyDetail() {
  const { id } = useParams<{ id: string }>();

  // Page through exactly what the grid was showing. Rebuilt from the persisted filters rather than
  // passed through navigation state so a refresh (or a shared link) still lands on a sensible deck.
  // Falls back to the whole list when the filters would exclude the word you actually opened.
  const { deck, startIndex } = useMemo(() => {
    const filtered = filterVocabulary(VOCABULARY, loadVocabFilters());
    const inFiltered = filtered.findIndex((w) => w.id === id);
    if (inFiltered !== -1) return { deck: filtered, startIndex: inFiltered };
    return { deck: VOCABULARY, startIndex: VOCABULARY.findIndex((w) => w.id === id) };
    // `id` is the only real dependency: vocabulary filters don't consider SRS state, so unlike the kanji
    // grid there is nothing here that grading could change mid-session.
  }, [id]);

  if (startIndex === -1) return <Navigate to="/vocabulary" replace />;

  return (
    <VocabSession
      // Remount when arriving at a different word from outside (e.g. a link on another page), so the
      // session restarts at that word instead of keeping the previous position.
      key={id}
      queue={deck}
      initialIndex={startIndex}
      mode="browse"
      title="Vocabulary"
      exitTo="/vocabulary"
    />
  );
}
