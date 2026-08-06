import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenText, Lock } from 'lucide-react';
import { ModuleHeader } from '../../components/learning/ModuleHeader';
import { ModuleStatsHero } from '../../components/learning/ModuleStatsHero';
import { GrammarContinueCard } from '../../components/grammar/GrammarContinueCard';
import { GrammarLessonList, type GrammarLessonItem } from '../../components/grammar/GrammarLessonList';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { GRAMMAR_POINTS } from '../../data/grammar';
import { useProgress } from '../../lib/progressStore';
import {
  currentPoint as nextPointFor,
  currentPointIndex,
  lessonState,
  levelLockedNotice,
  levelPoints,
} from '../../lib/grammarPath';
import type { JlptLevel } from '../../types';

export function GrammarList() {
  const progress = useProgress();
  const navigate = useNavigate();
  // Starts on the learner's own level rather than always N5, so the page opens where they left off.
  const [level, setLevel] = useState<JlptLevel>(progress.level);

  const completedIds = progress.completedGrammarIds;

  const currentIndex = useMemo(() => currentPointIndex(completedIds), [completedIds]);
  const currentPoint = nextPointFor(completedIds);

  const items: GrammarLessonItem[] = useMemo(
    () =>
      levelPoints(level).map((point, indexInLevel) => ({
        id: point.id,
        // Numbered within the level, not within the whole course — see lessonNumberInLevel.
        number: indexInLevel + 1,
        title: point.title,
        meaningEn: capitalize(point.meaning.en),
        structure: point.structure,
        state: lessonState(GRAMMAR_POINTS.indexOf(point), point.id, currentIndex, completedIds),
      })),
    [level, completedIds, currentIndex],
  );

  const lockedNotice = levelLockedNotice(level, completedIds);
  const inLevel = levelPoints(level);
  const totalInLevel = inLevel.length;
  const completedInLevel = inLevel.filter((p) => completedIds.includes(p.id)).length;

  function openLesson(id: string) {
    navigate(`/grammar/${id}`);
  }

  return (
    <div className="space-y-6">
      <ModuleHeader skill="grammar" title="Grammar" subtitle="Master Japanese sentence patterns step by step." />
      <ModuleStatsHero
        ringProgress={GRAMMAR_POINTS.length > 0 ? completedIds.length / GRAMMAR_POINTS.length : 0}
        ringIcon={BookOpenText}
        headlineValue={completedIds.length}
        headlineTotal={GRAMMAR_POINTS.length}
        headlineLabel="Grammar learned, all levels"
        mascot="grammar"
      />

      <SegmentedTabs
        value={level}
        onChange={setLevel}
        groupLabel="Grammar level"
        options={(['N5', 'N4', 'N3'] as const).map((l) => ({ value: l, label: l }))}
      />

      <GrammarContinueCard point={currentPoint} onContinue={openLesson} />

      {/* A level the learner hasn't reached yet has every row locked. Without this, that state is a screen
          of dimmed text with no explanation — indistinguishable from a page that failed to load. */}
      {lockedNotice && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-ink-line dark:bg-ink-900 dark:text-slate-300">
          <Lock size={15} aria-hidden="true" className="shrink-0" />
          <span>
            <strong className="font-semibold text-slate-900 dark:text-white">{level} opens</strong> once you
            finish {lockedNotice.blockingLevel} — {lockedNotice.done} of {lockedNotice.total} done. You can
            read ahead here any time.
          </span>
          <button
            type="button"
            onClick={() => setLevel(lockedNotice.blockingLevel)}
            className="font-semibold text-brand-600 underline-offset-2 hover:underline dark:text-iris-400"
          >
            Back to {lockedNotice.blockingLevel}
          </button>
        </p>
      )}

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
