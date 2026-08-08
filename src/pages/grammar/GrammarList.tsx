import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { SectionBanner } from '../../components/learning/SectionBanner';
import { GrammarContinueCard } from '../../components/grammar/GrammarContinueCard';
import { GrammarLessonList, type GrammarLessonItem } from '../../components/grammar/GrammarLessonList';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { GRAMMAR_POINTS } from '../../data/grammar';
import { useProgress } from '../../lib/progressStore';
import { SKILL_THEME } from '../../lib/skillTheme';
import {
  currentPoint as nextPointFor,
  currentPointIndex,
  lessonState,
  levelLockedNotice,
  levelPoints,
} from '../../lib/grammarPath';
import type { JlptLevel } from '../../types';
import { JLPT_LEVELS } from '../../types';

export function GrammarList() {
  const progress = useProgress();
  const navigate = useNavigate();
  // Set when GrammarDetail redirected here because the lesson id in the URL no longer resolves.
  const missingLessonId = (useLocation().state as { missingLessonId?: string } | null)?.missingLessonId;
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
      <SectionBanner
        title="Grammar"
        accent={SKILL_THEME.grammar.from}
        icon={SKILL_THEME.grammar.icon}
        kanji="文"
        value={completedIds.length}
        detail={`of ${GRAMMAR_POINTS.length} grammar points learned`}
        progress={GRAMMAR_POINTS.length > 0 ? completedIds.length / GRAMMAR_POINTS.length : 0}
        levels={
          <SegmentedTabs
            value={level}
            onChange={setLevel}
            variant="glass"
            size="sm"
            groupLabel="Grammar level"
            options={JLPT_LEVELS.map((l) => ({ value: l, label: l }))}
          />
        }
        // No CTA here: GrammarContinueCard below carries the identical "Continue lesson" action with the
        // lesson name and an example attached. DESIGN.md's One Button Rule — one primary action per
        // screen — and the richer of the two is the one that keeps it.
      />

      {missingLessonId && (
        <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          That lesson isn't here any more — it may have been renamed since you saved the link. The full
          list is below.
        </p>
      )}

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
