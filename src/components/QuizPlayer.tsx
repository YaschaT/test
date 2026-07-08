import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../types';
import { Bilingual } from './Bilingual';
import { PrimaryButton } from './PrimaryButton';
import { playCorrect, playWrong } from '../lib/sound';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  onComplete: (correct: number, total: number) => void;
}

export function QuizPlayer({ questions, onComplete }: QuizPlayerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const answered = selected !== null;

  function selectOption(i: number) {
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
      {question.japanesePrompt && (
        <p className="jp-text text-lg font-medium text-slate-900 dark:text-white mb-2">{question.japanesePrompt}</p>
      )}
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{question.prompt.en}</p>

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
              onClick={() => selectOption(i)}
              className={`w-full text-left jp-text rounded-xl border px-4 py-2.5 text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                showCorrect
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : showWrong
                    ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-shake'
                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 text-slate-800 dark:text-slate-100'
              } ${answered ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
            >
              {option}
              {showCorrect && <CheckCircle2 size={16} />}
              {showWrong && <XCircle size={16} />}
            </button>
          );
        })}
      </div>

      {answered && question.explanation && (
        <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
          <Bilingual text={question.explanation} />
        </div>
      )}

      {answered && (
        <PrimaryButton onClick={next} className="mt-4">
          {isLast ? 'Finish' : 'Next question'}
        </PrimaryButton>
      )}
    </div>
  );
}
