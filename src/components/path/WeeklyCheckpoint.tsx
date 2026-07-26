import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { getCheckpointQuestions } from '../../lib/checkpoint';
import { recordCheckpointResult } from '../../lib/progressStore';
import type { RoadmapWeek } from '../../types';

interface WeeklyCheckpointProps {
  week: RoadmapWeek;
  onFinished?: () => void;
}

/** Inline multiple-choice checkpoint. On submit it records the best accuracy for the week, which the
 *  mastery gate on the Learning Path then reads. */
export function WeeklyCheckpoint({ week, onFinished }: WeeklyCheckpointProps) {
  const questions = useMemo(() => getCheckpointQuestions(week), [week]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const threshold = week.gate.minCheckpointAccuracy ?? 0.8;
  const correct = questions.filter((q) => answers[q.id] === q.correctIndex).length;
  const accuracy = questions.length ? correct / questions.length : 0;
  const passed = accuracy >= threshold;
  const allAnswered = questions.every((q) => answers[q.id] != null);

  function submit() {
    recordCheckpointResult(week.week, correct, questions.length);
    setSubmitted(true);
    onFinished?.();
  }

  if (questions.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Week {week.week} checkpoint · pass mark {Math.round(threshold * 100)}%
      </p>

      {questions.map((q, qi) => {
        const chosen = answers[q.id];
        return (
          <div key={q.id} className="space-y-1.5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              <span className="text-slate-400 mr-1">{qi + 1}.</span>
              {q.prompt.en}
            </p>
            {q.japanesePrompt && <p className="jp-text text-sm text-slate-500 dark:text-slate-400">{q.japanesePrompt}</p>}
            <div className="grid gap-1.5">
              {q.options.map((opt, oi) => {
                const isChosen = chosen === oi;
                const isCorrect = oi === q.correctIndex;
                let cls = 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800';
                if (submitted && isCorrect) cls = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30';
                else if (submitted && isChosen && !isCorrect) cls = 'border-rose-400 bg-rose-50 dark:bg-rose-900/30';
                else if (!submitted && isChosen) cls = 'border-brand-400 bg-brand-50 dark:bg-brand-900/30';
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
                  >
                    <span className="jp-text text-slate-700 dark:text-slate-200">{opt}</span>
                    {submitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                    {submitted && isChosen && !isCorrect && <XCircle size={16} className="text-rose-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{q.explanation.en}</p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          type="button"
          onClick={submit}
          disabled={!allAnswered}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {allAnswered ? 'Submit checkpoint' : `Answer all ${questions.length} questions`}
        </button>
      ) : (
        <div className={`rounded-lg p-3 text-sm font-medium ${passed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
          {correct}/{questions.length} correct ({Math.round(accuracy * 100)}%) —{' '}
          {passed ? 'checkpoint passed. This counts toward the week’s mastery gate.' : `keep practising and retake to reach ${Math.round(threshold * 100)}%.`}
        </div>
      )}
    </div>
  );
}
