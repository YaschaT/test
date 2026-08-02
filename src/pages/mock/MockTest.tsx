import { useState } from 'react';
import type { JlptLevel } from '../../types';
import { buildMockExam, scoreExamOfficial, EXAM_CONFIG, type MockQuestion } from '../../lib/mockExam';
import { getProgressSnapshot, recordMockExamResult, useProgress } from '../../lib/progressStore';
import { ExamLobby } from '../../components/mock/ExamLobby';
import { ExamRuntime } from '../../components/mock/ExamRuntime';
import { ExamResults } from '../../components/mock/ExamResults';

type Phase = 'lobby' | 'exam' | 'results';

interface FinishedExam {
  questions: MockQuestion[];
  answers: (number | null)[];
  isNewBest: boolean;
}

/**
 * JLPT mock-exam flow: a self-contained state machine (lobby → timed exam → results). Scored on the
 * official JLPT model (scaled 0–180, overall pass mark + sectional minimums; see mockExam.ts). Each
 * attempt is recorded (which also logs a `mock-test` QuizResult so XP updates).
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
    window.scrollTo({ top: 0 });
  }

  function finish(answers: (number | null)[]) {
    const result = scoreExamOfficial(level, questions, answers);
    // Capture the prior best before recording so we can flag a genuine improvement.
    const previousBest = getProgressSnapshot().mockExams[level]?.bestScore ?? -1;
    recordMockExamResult(level, result.correct, result.rawTotal, result.scaled, result.passed);
    setFinished({ questions, answers, isNewBest: result.scaled > previousBest });
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
