import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ReadingQuestion } from '../types';
import { PrimaryButton } from './PrimaryButton';
import { playCorrect, playWrong } from '../lib/sound';

export function ReadingQuestionPlayer({
  questions,
  onComplete,
}: {
  questions: ReadingQuestion[];
  onComplete: (correct: number, total: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const answered = selected !== null;

  function select(i: number) {
    if (answered) return;
    setSelected(i);
    if (i === question.correctIndex) {
      setCorrectCount((c) => c + 1);
      playCorrect();
    } else {
      playWrong();
    }
  }

  function next() {
    if (isLast) {
      onComplete(correctCount, questions.length);
      return;
    }
    setIndex((n) => n + 1);
    setSelected(null);
  }

  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-2">
        Question {index + 1} of {questions.length}
      </p>
      <p className="text-slate-800 dark:text-slate-100 font-medium">{question.question.en}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{question.question.nl}</p>

      <div className="space-y-2" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, i) => {
          const showCorrect = answered && i === question.correctIndex;
          const showWrong = answered && i === selected && i !== question.correctIndex;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected === i}
              disabled={answered}
              onClick={() => select(i)}
              className={`w-full text-left rounded-xl border px-4 py-2.5 text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                showCorrect
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : showWrong
                    ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-shake'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 text-slate-800 dark:text-slate-100'
              } ${answered ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
            >
              <span>
                {option.en} <span className="text-slate-400">· {option.nl}</span>
              </span>
              {showCorrect && <CheckCircle2 size={16} />}
              {showWrong && <XCircle size={16} />}
            </button>
          );
        })}
      </div>

      {answered && (
        <PrimaryButton onClick={next} className="mt-4">
          {isLast ? 'Finish' : 'Next question'}
        </PrimaryButton>
      )}
    </div>
  );
}
