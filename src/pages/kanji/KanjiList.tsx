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
import type { JlptLevel } from '../../types';

export function KanjiList() {
  const progress = useProgress();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<JlptLevel | 'all'>('all');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const today = todayIso();

  const reviewQueue = buildReviewQueue(KANJI_LIST, 'kanji', progress, 10, today);
  const dueCount = reviewQueue.filter((k) => {
    const card = getSrsCard(progress, 'kanji', k.id);
    return card && isCardDue(card, today);
  }).length;

  const stats = useMemo(
    () => getLearningStats('kanji', KANJI_LIST.map((k) => k.id), progress, today),
    [progress, today],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return KANJI_LIST.filter((k) => {
      if (level !== 'all' && k.level !== level) return false;
      if (!q) return true;
      return (
        k.character.includes(q) ||
        k.onyomi.some((r) => r.toLowerCase().includes(q)) ||
        k.kunyomi.some((r) => r.toLowerCase().includes(q)) ||
        k.meaning.en.toLowerCase().includes(q) ||
        k.meaning.nl.toLowerCase().includes(q)
      );
    });
  }, [query, level]);

  const ctaLabel = reviewQueue.length > 0 ? formatReviewLabel(dueCount, reviewQueue.length - dueCount) : null;
  const ctaHref = reviewQueue.length > 0 ? `/kanji/${reviewQueue[0].id}` : '/kanji';

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
        level={level}
        onLevelChange={setLevel}
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search kanji..."
        layout={layout}
        onLayoutChange={setLayout}
      />
      <KanjiCardGrid key={level} entries={filtered} progress={progress} layout={layout} />
    </div>
  );
}

function formatReviewLabel(dueCount: number, newCount: number): string {
  if (dueCount > 0 && newCount > 0) return `Review (${dueCount} due, ${newCount} new)`;
  if (dueCount > 0) return `Review (${dueCount} due)`;
  return `Learn (${newCount} new)`;
}
