import { useState } from 'react';
import { Card } from '../Card';
import { Celebration } from '../Celebration';
import { PrimaryButton } from '../PrimaryButton';
import { QuizPlayer } from '../QuizPlayer';
import type { QuizQuestion } from '../../types';

interface GrammarQuizCardProps {
  questions: QuizQuestion[];
  onComplete: (correct: number, total: number) => void;
}

/** Wraps the existing start-button / QuizPlayer / Celebration flow (unchanged logic) with a stable DOM
 * id so the lesson hero's CTA can scroll straight to it. */
export function GrammarQuizCard({ questions, onComplete }: GrammarQuizCardProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);

  function handleComplete(correct: number, total: number) {
    setResult({ correct, total });
    onComplete(correct, total);
  }

  return (
    <Card id="grammar-quiz" className="p-5 scroll-mt-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Mini quiz</h2>
      {result ? (
        <Celebration
          correct={result.correct}
          total={result.total}
          extraNote="This grammar point is marked complete — you can retry the quiz any time."
          retryLabel="Retry quiz"
          onRetry={() => {
            setResult(null);
            setShowQuiz(true);
          }}
        />
      ) : showQuiz ? (
        <QuizPlayer questions={questions} onComplete={handleComplete} />
      ) : (
        <PrimaryButton onClick={() => setShowQuiz(true)}>Start quiz</PrimaryButton>
      )}
    </Card>
  );
}
