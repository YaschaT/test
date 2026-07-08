import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Bilingual } from '../../components/Bilingual';
import { DisplayToggles, type DisplayPrefs } from '../../components/DisplayToggles';
import { ExampleSentenceCard } from '../../components/ExampleSentenceCard';
import { GrammarFormulaCard } from '../../components/grammar/GrammarFormulaCard';
import { GrammarLessonHero } from '../../components/grammar/GrammarLessonHero';
import { GrammarMistakeCard } from '../../components/grammar/GrammarMistakeCard';
import { GrammarNextStepCard } from '../../components/grammar/GrammarNextStepCard';
import { GrammarQuizCard } from '../../components/grammar/GrammarQuizCard';
import { GRAMMAR_POINTS, getGrammarPoint } from '../../data/grammar';
import { markGrammarCompleted, useProgress } from '../../lib/progressStore';

export function GrammarDetail() {
  const { id } = useParams<{ id: string }>();
  const progress = useProgress();
  const [prefs, setPrefs] = useState<DisplayPrefs>({ furigana: true, romaji: true });

  const point = id ? getGrammarPoint(id) : undefined;
  if (!point) return <Navigate to="/grammar" replace />;

  const done = progress.completedGrammarIds.includes(point.id);
  const pointIndex = GRAMMAR_POINTS.findIndex((p) => p.id === point.id);
  const next = GRAMMAR_POINTS[pointIndex + 1] ?? null;

  function handleQuizComplete() {
    markGrammarCompleted(point!.id);
  }

  function jumpToQuiz() {
    document.getElementById('grammar-quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <GrammarLessonHero point={point} done={done} onJumpToQuiz={jumpToQuiz} />

      <Card className="p-5 space-y-5">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">What it means</h2>
          <Bilingual text={point.meaning} />
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1.5">Why it works this way</h2>
          <Bilingual text={point.explanation} />
        </div>
      </Card>

      <GrammarFormulaCard structure={point.structure} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Examples</h2>
          <DisplayToggles prefs={prefs} onChange={setPrefs} />
        </div>
        <div className="space-y-3">
          {point.examples.map((ex, i) => (
            <ExampleSentenceCard key={i} example={ex} prefs={prefs} />
          ))}
        </div>
      </div>

      <GrammarMistakeCard commonMistake={point.commonMistake} />

      <GrammarQuizCard questions={point.quiz} onComplete={handleQuizComplete} />

      <GrammarNextStepCard nextPoint={next ? { id: next.id, title: next.title } : null} />
    </div>
  );
}
