import { useState } from 'react';
import type { JlptLevel } from '../../types';
import { buildMockExam, scoreExam, PASS_THRESHOLD, type MockQuestion } from '../../lib/mockExam';
import { getProgressSnapshot, recordMockExamResult, useProgress } from '../../lib/progressStore';
import { ExamLobby } from '../../components/mock/ExamLobby';
import { ExamRuntime } from '../../components/mock/ExamRuntime';
import { ExamResults } from '../../components/mock/ExamResults';
import { EXAM_CONFIG } from '../../lib/mockExam';

type Phase = 'lobby' | 'exam' | 'results';

interface FinishedExam {
  questions: MockQuestion[];
  answers: (number | null)[];
  isNewBest: boolean;
}

/**
 * JLPT mock-exam flow: a self-contained state machine (lobby → timed exam → results). The lobby picks a
 * level and shows real best scores; the runtime owns the in-exam interaction and clock; on submit we score
 * it, record the attempt (which also logs a `mock-test` QuizResult so XP updates), and show the breakdown.
 */
export function MockTest() {
  const progress = useProgress();
  const [phase, setPhase] = useState<Phase>('lobby');
  const [level, setLevel] = useState<JlptLevel>(progress.level);
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [finished, setFinished] = useState<FinishedExam | null>(null);

  function begin() {
    setQuestions(buildMockExam(level));
    setFinished(null);
    setPhase('exam');
  }

  function finish(answers: (number | null)[]) {
    const { correct, total } = scoreExam(questions, answers);
    const percent = total > 0 ? correct / total : 0;
    // Capture the prior best before recording so we can flag a genuine improvement.
    const previousBest = getProgressSnapshot().mockExams[level]?.bestPercent ?? -1;
    recordMockExamResult(level, correct, total, PASS_THRESHOLD);
    setFinished({ questions, answers, isNewBest: percent > previousBest });
    setPhase('results');
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="px-4 py-8 sm:py-10">
      {phase === 'lobby' && <ExamLobby level={level} onLevelChange={setLevel} onBegin={begin} />}
      {phase === 'exam' && (
        <ExamRuntime
          questions={questions}
          config={EXAM_CONFIG[level]}
          onFinish={finish}
          onExit={() => setPhase('lobby')}
        />
      )}
      {phase === 'results' && finished && (
        <ExamResults
          level={level}
          questions={finished.questions}
          answers={finished.answers}
          isNewBest={finished.isNewBest}
          onRetake={begin}
          onExit={() => setPhase('lobby')}
        />
      )}
    </div>
  );
}
