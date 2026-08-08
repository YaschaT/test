import { useMemo, useState } from 'react';
import { SectionBanner } from '../../components/learning/SectionBanner';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { LearningControls } from '../../components/learning/LearningControls';
import { playPrimaryAction } from '../../lib/sound';
import { KanjiCardGrid } from '../../components/kanji/KanjiCardGrid';
import { KANJI_LIST } from '../../data/kanji';
import { getSrsCard, useProgress } from '../../lib/progressStore';
import { isCardDue } from '../../lib/srs';
import { todayIso } from '../../lib/date';
import { buildReviewQueue } from '../../lib/reviewQueue';
import { getLearningStats } from '../../lib/learningState';
import { SKILL_THEME } from '../../lib/skillTheme';
import {
  filterKanji,
  loadKanjiFilters,
  saveKanjiFilters,
  KANJI_STATUS_OPTIONS,
  type KanjiFilters,
  type KanjiStatus,
} from '../../lib/kanjiFilter';
import type { JlptLevel } from '../../types';

/** 'All' first: the deck is browsed whole more often than it is browsed by level. */
const LEVEL_TABS: Array<JlptLevel | 'all'> = ['all', 'N5', 'N4', 'N3'];

export function KanjiList() {
  const progress = useProgress();
  const [filters, setFilters] = useState<KanjiFilters>(() => loadKanjiFilters());
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const today = todayIso();

  // Persisted (level/status only) so the card session opened from a card rebuilds the same deck.
  function updateFilters(next: Partial<KanjiFilters>) {
    setFilters((f) => {
      const merged = { ...f, ...next };
      saveKanjiFilters(merged);
      return merged;
    });
  }

  const reviewQueue = buildReviewQueue(KANJI_LIST, 'kanji', progress, 10, today);
  const dueCount = reviewQueue.filter((k) => {
    const card = getSrsCard(progress, 'kanji', k.id);
    return card && isCardDue(card, today);
  }).length;

  const stats = useMemo(
    () => getLearningStats('kanji', KANJI_LIST.map((k) => k.id), progress, today),
    [progress, today],
  );

  const filtered = useMemo(() => filterKanji(KANJI_LIST, filters, progress), [filters, progress]);

  const ctaLabel = reviewQueue.length > 0 ? formatReviewLabel(dueCount, reviewQueue.length - dueCount) : null;
  // Opens the carousel session rather than a single character's detail page — reviewing a queue no
  // longer means going back to the grid between every kanji.
  const ctaHref = reviewQueue.length > 0 ? '/kanji/review' : '/kanji';

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300 ease-out">
      <SectionBanner
        title="Kanji"
        accent={SKILL_THEME.kanji.from}
        icon={SKILL_THEME.kanji.icon}
        kanji="字"
        value={stats.learnedCount}
        detail={`of ${stats.totalCount.toLocaleString()} kanji learned`}
        progress={stats.learnedPercent / 100}
        levels={
          <SegmentedTabs
            value={filters.level}
            onChange={(level) => updateFilters({ level })}
            variant="glass"
            size="sm"
            groupLabel="Kanji level"
            options={LEVEL_TABS.map((l) => ({ value: l, label: l === 'all' ? 'All' : l }))}
          />
        }
        action={ctaLabel ? { label: ctaLabel, to: ctaHref, onClick: () => playPrimaryAction() } : undefined}
      />
      <LearningControls
        query={filters.query}
        onQueryChange={(query) => updateFilters({ query })}
        searchPlaceholder="Search kanji..."
        status={filters.status}
        onStatusChange={(status) => updateFilters({ status: status as KanjiStatus })}
        statusOptions={KANJI_STATUS_OPTIONS}
        layout={layout}
        onLayoutChange={setLayout}
      />

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No kanji match these filters.
        </p>
      ) : (
        <KanjiCardGrid
          key={`${filters.level}-${filters.status}`}
          entries={filtered}
          progress={progress}
          layout={layout}
        />
      )}
    </div>
  );
}

function formatReviewLabel(dueCount: number, newCount: number): string {
  if (dueCount > 0) return `Review ${dueCount} due`;
  return `Learn ${newCount} new`;
}
