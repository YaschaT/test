import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { KanjiSession } from '../../components/kanji/review/KanjiSession';
import { KANJI_LIST } from '../../data/kanji';
import { useProgress } from '../../lib/progressStore';
import { filterKanji, loadKanjiFilters } from '../../lib/kanjiFilter';

/**
 * Opening a kanji from the grid.
 *
 * This used to be a static detail page — read one character, press Back, pick the next. It now runs the
 * same card session as the vocabulary review, opened at the kanji you tapped with the whole deck behind
 * it, so you can page (or swipe) straight through and grade in place. The readings, example words,
 * example sentence and the See→Trace→Copy→Recall writing practice all live in the panel under the card.
 */
export function KanjiDetail() {
  const { id } = useParams<{ id: string }>();
  const progress = useProgress();

  // Page through exactly what the grid was showing. Rebuilt from the persisted filters rather than
  // passed through navigation state so a refresh (or a shared link) still lands on a sensible deck.
  // Falls back to the whole list when the filters would exclude the kanji you actually opened.
  const { deck, startIndex } = useMemo(() => {
    const filtered = filterKanji(KANJI_LIST, loadKanjiFilters(), progress);
    const inFiltered = filtered.findIndex((k) => k.id === id);
    if (inFiltered !== -1) return { deck: filtered, startIndex: inFiltered };
    return { deck: KANJI_LIST, startIndex: KANJI_LIST.findIndex((k) => k.id === id) };
    // Deliberately keyed on `id` only: the deck is captured when the session opens so grading a card
    // (which changes its status) can't reshuffle the deck out from under you mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (startIndex === -1) return <Navigate to="/kanji" replace />;

  return (
    <KanjiSession
      // Remount when arriving at a different kanji from outside (e.g. a link on another page), so the
      // session restarts at that character instead of keeping the previous position.
      key={id}
      queue={deck}
      initialIndex={startIndex}
      mode="browse"
      title="Kanji"
      exitTo="/kanji"
    />
  );
}
