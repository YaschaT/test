import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { GrammarLessonIntro } from '../../components/grammar/GrammarLessonIntro';
import { GrammarLessonRail, type GrammarRailItem } from '../../components/grammar/GrammarLessonRail';
import { GrammarPractice } from '../../components/grammar/GrammarPractice';
import type { GrammarLessonState } from '../../components/grammar/GrammarLessonList';
import { GRAMMAR_POINTS, getGrammarPoint } from '../../data/grammar';
import { markGrammarCompleted, useProgress } from '../../lib/progressStore';

/** How many points beyond the current one are previewable before the path locks (mirrors the overview). */
const LOOKAHEAD = 2;

type Phase = 'lesson' | 'practice';

export function GrammarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>('lesson');

  const point = id ? getGrammarPoint(id) : undefined;
  const completedIds = progress.completedGrammarIds;

  const currentIndex = useMemo(
    () => GRAMMAR_POINTS.findIndex((p) => !completedIds.includes(p.id)),
    [completedIds],
  );

  function stateFor(index: number, pid: string): GrammarLessonState {
    if (completedIds.includes(pid)) return 'completed';
    if (currentIndex === -1) return 'completed';
    if (index === currentIndex) return 'current';
    if (index > currentIndex && index <= currentIndex + LOOKAHEAD) return 'available';
    return 'locked';
  }

  const pointIndex = point ? GRAMMAR_POINTS.findIndex((p) => p.id === point.id) : -1;

  const railItems: GrammarRailItem[] = useMemo(() => {
    if (!point) return [];
    return GRAMMAR_POINTS.map((p, index) => ({ p, index }))
      .filter(({ p }) => p.level === point.level)
      .map(({ p, index }) => ({
        id: p.id,
        number: index + 1,
        title: p.title,
        state: stateFor(index, p.id),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point, completedIds, currentIndex]);

  // Lesson number within its level, and the level's total (e.g. "Lesson 5 of 10").
  const levelBefore = point ? GRAMMAR_POINTS.slice(0, pointIndex).filter((p) => p.level === point.level).length : 0;
  const levelTotal = point ? GRAMMAR_POINTS.filter((p) => p.level === point.level).length : 0;

  if (!point) return <Navigate to="/grammar" replace />;

  function finishPractice() {
    markGrammarCompleted(point!.id);
    navigate('/grammar');
  }

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      {phase === 'lesson' ? (
        <div className="grid gap-6 lg:grid-cols-[232px_minmax(0,1fr)] lg:items-start">
          <div className="hidden lg:block lg:sticky lg:top-4">
            <GrammarLessonRail
              levelLabel={point.level}
              items={railItems}
              activeId={point.id}
              onSelect={(pid) => {
                if (pid !== point.id) {
                  setPhase('lesson');
                  navigate(`/grammar/${pid}`);
                }
              }}
            />
          </div>

          <GrammarLessonIntro
            point={point}
            lessonNumber={levelBefore + 1}
            levelTotal={levelTotal}
            onStart={() => setPhase('practice')}
          />
        </div>
      ) : (
        <GrammarPractice
          questions={point.quiz}
          onExit={() => setPhase('lesson')}
          onFinish={finishPractice}
        />
      )}
    </div>
  );
}
