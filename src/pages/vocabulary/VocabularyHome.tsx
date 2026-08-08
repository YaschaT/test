import { useMemo, useState } from 'react';
import { SectionBanner } from '../../components/learning/SectionBanner';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { LearningControls } from '../../components/learning/LearningControls';
import { playPrimaryAction } from '../../lib/sound';
import { VocabularyCardGrid } from '../../components/vocabulary/VocabularyCardGrid';
import { VOCABULARY, VOCAB_CATEGORIES } from '../../data/vocabulary';
import { getSrsCard, useProgress } from '../../lib/progressStore';
import { filterVocabulary, loadVocabFilters, saveVocabFilters } from '../../lib/vocabFilter';
import { isCardDue } from '../../lib/srs';
import { todayIso } from '../../lib/date';
import { buildReviewQueue } from '../../lib/reviewQueue';
import { getLearningStats } from '../../lib/learningState';
import { SKILL_THEME } from '../../lib/skillTheme';
import type { JlptLevel } from '../../types';

/** 'All' first: the deck is browsed whole more often than it is browsed by level. */
const LEVEL_TABS: Array<JlptLevel | 'all'> = ['all', 'N5', 'N4', 'N3'];

export function VocabularyHome() {
  const progress = useProgress();
  // Seeded from (and written back to) the persisted filters, so opening a word pages through the deck
  // that was on screen rather than all 1000 words. Same contract as the kanji grid.
  const saved = loadVocabFilters();
  const [query, setQuery] = useState(saved.query);
  const [level, setLevel] = useState<JlptLevel | 'all'>(saved.level);
  const [category, setCategory] = useState<string>(saved.category);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const today = todayIso();

  function changeLevel(next: JlptLevel | 'all') {
    setLevel(next);
    saveVocabFilters({ level: next, category, query });
  }

  function changeCategory(next: string) {
    setCategory(next);
    saveVocabFilters({ level, category: next, query });
  }

  const reviewQueue = buildReviewQueue(VOCABULARY, 'vocabulary', progress, 10, today);
  const dueCount = reviewQueue.filter((w) => {
    const card = getSrsCard(progress, 'vocabulary', w.id);
    return card && isCardDue(card, today);
  }).length;
  const reviewQueueSize = reviewQueue.length;

  const stats = useMemo(
    () => getLearningStats('vocabulary', VOCABULARY.map((w) => w.id), progress, today),
    [progress, today],
  );

  // Shared with the card session so both show exactly the same deck.
  const filtered = useMemo(() => filterVocabulary(VOCABULARY, { level, category, query }), [query, level, category]);

  const ctaLabel = reviewQueueSize > 0 ? formatReviewLabel(dueCount, reviewQueueSize - dueCount) : null;

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300 ease-out">
      <SectionBanner
        title="Vocabulary"
        accent={SKILL_THEME.vocabulary.from}
        icon={SKILL_THEME.vocabulary.icon}
        kanji="語"
        value={stats.learnedCount}
        detail={`of ${stats.totalCount.toLocaleString()} words learned`}
        progress={stats.learnedPercent / 100}
        levels={
          <SegmentedTabs
            value={level}
            onChange={changeLevel}
            variant="glass"
            size="sm"
            groupLabel="Vocabulary level"
            options={LEVEL_TABS.map((l) => ({ value: l, label: l === 'all' ? 'All' : l }))}
          />
        }
        action={
          ctaLabel ? { label: ctaLabel, to: '/vocabulary/review', onClick: () => playPrimaryAction() } : undefined
        }
      />
      <LearningControls
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search vocabulary..."
        category={category}
        onCategoryChange={changeCategory}
        categories={VOCAB_CATEGORIES}
        layout={layout}
        onLayoutChange={setLayout}
      />
      <VocabularyCardGrid key={`${level}-${category}`} words={filtered} progress={progress} layout={layout} />
    </div>
  );
}

function formatReviewLabel(dueCount: number, newCount: number): string {
  if (dueCount > 0) return `Review ${dueCount} due`;
  return `Learn ${newCount} new`;
}
