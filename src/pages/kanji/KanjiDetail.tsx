import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { KanjiSession } from '../../components/kanji/review/KanjiSession';
import { KANJI_LIST } from '../../data/kanji';

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

  const startIndex = useMemo(() => KANJI_LIST.findIndex((k) => k.id === id), [id]);
  if (startIndex === -1) return <Navigate to="/kanji" replace />;

  return (
    <KanjiSession
      // Remount when arriving at a different kanji from outside (e.g. a link on another page), so the
      // session restarts at that character instead of keeping the previous position.
      key={id}
      queue={KANJI_LIST}
      initialIndex={startIndex}
      mode="browse"
      title="Kanji"
      exitTo="/kanji"
    />
  );
}
