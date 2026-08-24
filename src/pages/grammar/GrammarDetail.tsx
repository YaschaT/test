import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { GrammarLessonIntro, type LessonMastery } from '../../components/grammar/GrammarLessonIntro';
import { GrammarLessonRail, type GrammarRailItem } from '../../components/grammar/GrammarLessonRail';
import { GrammarPractice } from '../../components/grammar/GrammarPractice';
import { GRAMMAR_POINTS, getGrammarPoint } from '../../data/grammar';
import { getSrsCard, useProgress } from '../../lib/progressStore';
import { getLearningProgress } from '../../lib/learningState';
import { reviewDueLabel } from '../../lib/grammarDrills';
import { currentPointIndex, lessonNumberInLevel, lessonState, levelPoints } from '../../lib/grammarPath';

type Phase = 'lesson' | 'practice';

export function GrammarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>('lesson');

  const point = id ? getGrammarPoint(id) : undefined;
  const completedIds = progress.completedGrammarIds;

  const currentIndex = useMemo(() => currentPointIndex(completedIds), [completedIds]);

  const railItems: GrammarRailItem[] = useMemo(() => {
    if (!point) return [];
    return levelPoints(point.level).map((p, indexInLevel) => ({
      id: p.id,
      number: indexInLevel + 1,
      title: p.title,
      state: lessonState(GRAMMAR_POINTS.indexOf(p), p.id, currentIndex, completedIds),
    }));
  }, [point, completedIds, currentIndex]);

  // "Lesson 5 of 18" — both numbers scoped to the point's own level.
  const lessonNumber = point ? lessonNumberInLevel(point) : 0;
  const levelTotal = point ? levelPoints(point.level).length : 0;

  // What this point is genuinely worth right now: its own SRS interval, and the date it comes back.
  const mastery: LessonMastery = useMemo(() => {
    if (!point) return { percent: null, dueLabel: null };
    const card = getSrsCard(progress, 'grammar', point.id);
    return {
      percent: card ? getLearningProgress('grammar', point.id, progress) : null,
      dueLabel: reviewDueLabel(card?.dueDate),
    };
  }, [point, progress]);

  // Carries a reason rather than bouncing silently: a stale bookmark or a link to a lesson that has since
  // been renamed used to dump the learner back on the list with nothing said, so it read as a misclick.
  if (!point) return <Navigate to="/grammar" replace state={{ missingLessonId: id }} />;

  const courseIndex = GRAMMAR_POINTS.indexOf(point);
  const nextPoint = GRAMMAR_POINTS[courseIndex + 1] ?? null;

  return (
    <div className="flex w-full flex-1 flex-col">
      {phase === 'lesson' ? (
        <div className="grid flex-1 gap-6 lg:grid-cols-[232px_minmax(0,1fr)] lg:items-start">
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
            lessonNumber={lessonNumber}
            levelTotal={levelTotal}
            mastery={mastery}
            onStart={() => setPhase('practice')}
          />
        </div>
      ) : (
        <GrammarPractice
          point={point}
          nextPoint={nextPoint}
          onExit={() => setPhase('lesson')}
          onOpenPoint={(pid) => {
            setPhase('lesson');
            navigate(`/grammar/${pid}`);
          }}
          onBackToList={() => navigate('/grammar')}
        />
      )}
    </div>
  );
}
