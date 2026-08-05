import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Sparkles } from 'lucide-react';
import { ModuleHeader } from '../../components/learning/ModuleHeader';
import { ModuleStatsHero } from '../../components/learning/ModuleStatsHero';
import { LearningControls } from '../../components/learning/LearningControls';
import { PRIMARY_BUTTON_CLASSES } from '../../lib/buttonStyles';
import { playPrimaryAction } from '../../lib/sound';
import { KanjiCardGrid } from '../../components/kanji/KanjiCardGrid';
import { KANJI_LIST } from '../../data/kanji';
import { getSrsCard, useProgress } from '../../lib/progressStore';
import { isCardDue } from '../../lib/srs';
import { todayIso } from '../../lib/date';
import { buildReviewQueue } from '../../lib/reviewQueue';
import { getLearningStats } from '../../lib/learningState';
import {
  filterKanji,
  loadKanjiFilters,
  saveKanjiFilters,
  KANJI_STATUS_OPTIONS,
  type KanjiFilters,
  type KanjiStatus,
} from '../../lib/kanjiFilter';

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
      <ModuleHeader
        skill="kanji"
        title="Kanji"
        subtitle="Master the building blocks of Japanese."
        right={
          ctaLabel ? (
            <Link to={ctaHref} onClick={() => playPrimaryAction()} className={PRIMARY_BUTTON_CLASSES}>
              <Sparkles size={16} />
              {ctaLabel}
            </Link>
          ) : (
            <span className="self-center text-sm text-slate-400">All caught up for now</span>
          )
        }
      />
      <ModuleStatsHero
        ringProgress={stats.learnedPercent / 100}
        ringIcon={PenTool}
        headlineValue={stats.learnedCount}
        headlineTotal={stats.totalCount}
        headlineLabel="Kanji learned"
        mascot="kanji"
        facts={[
          { value: stats.reviewDueCount, label: 'Due', actionable: true },
          { value: stats.masteredCount, label: 'Mastered' },
        ]}
      />
      <LearningControls
        level={filters.level}
        onLevelChange={(level) => updateFilters({ level })}
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
  if (dueCount > 0 && newCount > 0) return `Review (${dueCount} due, ${newCount} new)`;
  if (dueCount > 0) return `Review (${dueCount} due)`;
  return `Learn (${newCount} new)`;
}
