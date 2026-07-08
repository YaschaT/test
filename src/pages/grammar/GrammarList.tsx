import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrammarHero } from '../../components/grammar/GrammarHero';
import { GrammarStatsGrid } from '../../components/grammar/GrammarStatsGrid';
import { GrammarPathList } from '../../components/grammar/GrammarPathList';
import { GrammarLessonPreview } from '../../components/grammar/GrammarLessonPreview';
import { GrammarLearningLayout } from '../../components/grammar/GrammarLearningLayout';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { GRAMMAR_POINTS, getGrammarPoint } from '../../data/grammar';
import { useProgress } from '../../lib/progressStore';
import type { GrammarPointState } from '../../components/grammar/GrammarStateBadge';
import type { GrammarPathItem } from '../../components/grammar/GrammarPointCard';
import type { JlptLevel } from '../../types';

export function GrammarList() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<JlptLevel | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentId = useMemo(
    () => GRAMMAR_POINTS.find((p) => !progress.completedGrammarIds.includes(p.id))?.id ?? null,
    [progress.completedGrammarIds],
  );

  function stateFor(id: string): GrammarPointState {
    if (progress.completedGrammarIds.includes(id)) return 'completed';
    return id === currentId ? 'current' : 'locked';
  }

  const items: GrammarPathItem[] = useMemo(
    () =>
      GRAMMAR_POINTS.filter((p) => filter === 'all' || p.level === filter).map((p) => ({
        id: p.id,
        title: p.title,
        meaningEn: p.meaning.en,
        level: p.level,
        state: stateFor(p.id),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filter, progress.completedGrammarIds, currentId],
  );

  const nextPoint = useMemo(() => {
    const next = GRAMMAR_POINTS.find((p) => !progress.completedGrammarIds.includes(p.id));
    return next ? { id: next.id, title: next.title } : null;
  }, [progress.completedGrammarIds]);

  const effectiveSelectedId = selectedId ?? currentId ?? GRAMMAR_POINTS[0]?.id ?? null;
  const previewPoint = effectiveSelectedId ? getGrammarPoint(effectiveSelectedId) : null;

  function scrollToPath() {
    document.getElementById('grammar-path-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="space-y-5">
      <GrammarHero
        completedCount={progress.completedGrammarIds.length}
        totalCount={GRAMMAR_POINTS.length}
        nextPoint={nextPoint}
        onContinue={(id) => navigate(`/grammar/${id}`)}
        onReview={scrollToPath}
      />

      <GrammarStatsGrid
        completedCount={progress.completedGrammarIds.length}
        remainingCount={GRAMMAR_POINTS.length - progress.completedGrammarIds.length}
        nextTitle={nextPoint?.title ?? null}
      />

      <div id="grammar-path-section" className="scroll-mt-4 space-y-4">
        <SegmentedTabs
          value={filter}
          onChange={setFilter}
          options={(['all', 'N5', 'N4'] as const).map((l) => ({ value: l, label: l === 'all' ? 'All' : l }))}
        />

        <GrammarLearningLayout
          path={<GrammarPathList key={filter} items={items} selectedId={effectiveSelectedId} onSelect={setSelectedId} />}
          preview={previewPoint && <GrammarLessonPreview point={previewPoint} state={stateFor(previewPoint.id)} />}
        />
      </div>
    </div>
  );
}
