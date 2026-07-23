import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrammarOverviewHeader } from '../../components/grammar/GrammarOverviewHeader';
import { GrammarContinueCard } from '../../components/grammar/GrammarContinueCard';
import {
  GrammarLessonList,
  type GrammarLessonItem,
  type GrammarLessonState,
} from '../../components/grammar/GrammarLessonList';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { GRAMMAR_POINTS } from '../../data/grammar';
import { useProgress } from '../../lib/progressStore';
import type { JlptLevel } from '../../types';

/** How many points beyond the current one are previewable before the path locks. */
const LOOKAHEAD = 2;

export function GrammarList() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [level, setLevel] = useState<JlptLevel>('N5');

  const completedIds = progress.completedGrammarIds;

  // First not-yet-completed point in the full course order — the genuine "continue learning" target and
  // the anchor for what's unlocked next.
  const currentIndex = useMemo(
    () => GRAMMAR_POINTS.findIndex((p) => !completedIds.includes(p.id)),
    [completedIds],
  );
  const currentPoint = currentIndex >= 0 ? GRAMMAR_POINTS[currentIndex] : GRAMMAR_POINTS[GRAMMAR_POINTS.length - 1];

  function stateFor(index: number, id: string): GrammarLessonState {
    if (completedIds.includes(id)) return 'completed';
    if (currentIndex === -1) return 'completed';
    if (index === currentIndex) return 'current';
    if (index > currentIndex && index <= currentIndex + LOOKAHEAD) return 'available';
    return 'locked';
  }

  const items: GrammarLessonItem[] = useMemo(
    () =>
      GRAMMAR_POINTS.map((p, index) => ({ point: p, index }))
        .filter(({ point }) => point.level === level)
        .map(({ point, index }) => ({
          id: point.id,
          number: index + 1,
          title: point.title,
          meaningEn: capitalize(point.meaning.en),
          structure: point.structure,
          state: stateFor(index, point.id),
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level, completedIds, currentIndex],
  );

  const totalInLevel = GRAMMAR_POINTS.filter((p) => p.level === level).length;
  const completedInLevel = GRAMMAR_POINTS.filter(
    (p) => p.level === level && completedIds.includes(p.id),
  ).length;

  function openLesson(id: string) {
    navigate(`/grammar/${id}`);
  }

  return (
    <div className="space-y-6">
      <GrammarOverviewHeader completedCount={completedIds.length} totalCount={GRAMMAR_POINTS.length} />

      <SegmentedTabs
        value={level}
        onChange={setLevel}
        groupLabel="Grammar level"
        options={(['N5', 'N4'] as const).map((l) => ({ value: l, label: l }))}
      />

      <GrammarContinueCard point={currentPoint} onContinue={openLesson} />

      <GrammarLessonList
        levelLabel={level}
        items={items}
        completedInLevel={completedInLevel}
        totalInLevel={totalInLevel}
        onOpen={openLesson}
      />
    </div>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
