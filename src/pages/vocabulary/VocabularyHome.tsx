import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Sparkles } from 'lucide-react';
import { ModuleHeader } from '../../components/learning/ModuleHeader';
import { ModuleStatsHero } from '../../components/learning/ModuleStatsHero';
import { LearningControls } from '../../components/learning/LearningControls';
import { PRIMARY_BUTTON_CLASSES } from '../../lib/buttonStyles';
import { playPrimaryAction } from '../../lib/sound';
import { VocabularyCardGrid } from '../../components/vocabulary/VocabularyCardGrid';
import { VOCABULARY, VOCAB_CATEGORIES } from '../../data/vocabulary';
import { getSrsCard, useProgress } from '../../lib/progressStore';
import { isCardDue } from '../../lib/srs';
import { todayIso } from '../../lib/date';
import { buildReviewQueue } from '../../lib/reviewQueue';
import { getLearningStats } from '../../lib/learningState';
import type { JlptLevel } from '../../types';

export function VocabularyHome() {
  const progress = useProgress();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<JlptLevel | 'all'>('all');
  const [category, setCategory] = useState<string>('all');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const today = todayIso();

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VOCABULARY.filter((w) => {
      if (level !== 'all' && w.level !== level) return false;
      if (category !== 'all' && w.category !== category) return false;
      if (!q) return true;
      return (
        w.japanese.toLowerCase().includes(q) ||
        w.kana.toLowerCase().includes(q) ||
        w.romaji.toLowerCase().includes(q) ||
        w.meaning.en.toLowerCase().includes(q) ||
        w.meaning.nl.toLowerCase().includes(q)
      );
    });
  }, [query, level, category]);

  const ctaLabel = reviewQueueSize > 0 ? formatReviewLabel(dueCount, reviewQueueSize - dueCount) : null;

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300 ease-out">
      <ModuleHeader
        skill="vocabulary"
        title="Vocabulary"
        subtitle="Build your Japanese word bank step by step."
        right={
          ctaLabel ? (
            <Link to="/vocabulary/review" onClick={() => playPrimaryAction()} className={PRIMARY_BUTTON_CLASSES}>
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
        ringIcon={Layers}
        headlineValue={stats.learnedCount}
        headlineTotal={stats.totalCount}
        headlineLabel="Words learned"
        mascot="vocabulary"
        facts={[
          { value: stats.reviewDueCount, label: 'Due', actionable: true },
          { value: stats.masteredCount, label: 'Mastered' },
        ]}
      />
      <LearningControls
        level={level}
        onLevelChange={setLevel}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search vocabulary..."
        category={category}
        onCategoryChange={setCategory}
        categories={VOCAB_CATEGORIES}
        layout={layout}
        onLayoutChange={setLayout}
      />
      <VocabularyCardGrid key={`${level}-${category}`} words={filtered} progress={progress} layout={layout} />
    </div>
  );
}

function formatReviewLabel(dueCount: number, newCount: number): string {
  if (dueCount > 0 && newCount > 0) return `Review (${dueCount} due, ${newCount} new)`;
  if (dueCount > 0) return `Review (${dueCount} due)`;
  return `Learn (${newCount} new)`;
}
