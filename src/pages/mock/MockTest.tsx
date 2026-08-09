import { useState } from 'react';
import type { JlptLevel } from '../../types';
import { buildMockExam, scoreExamOfficial, EXAM_CONFIG, type MockQuestion } from '../../lib/mockExam';
import { getProgressSnapshot, recordMockExamResult, useProgress } from '../../lib/progressStore';
import { ExamLobby } from '../../components/mock/ExamLobby';
import { ExamCountdown } from '../../components/mock/ExamCountdown';
import { ExamRuntime } from '../../components/mock/ExamRuntime';
import { ExamResults } from '../../components/mock/ExamResults';
import { MOCK_SECTIONS, scoreByContent } from '../../lib/mockExam';

type Phase = 'lobby' | 'countdown' | 'exam' | 'results';

interface FinishedExam {
  questions: MockQuestion[];
  answers: (number | null)[];
  isNewBest: boolean;
  secondsUsed: number;
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

  /** The paper is built before the countdown, so the three seconds are a pause and not a loading spinner. */
  function begin() {
    setQuestions(buildMockExam(level));
    setFinished(null);
    setPhase('countdown');
    window.scrollTo({ top: 0 });
  }

  function finish(answers: (number | null)[], secondsUsed: number) {
    const result = scoreExamOfficial(level, questions, answers);
    // Capture the prior best before recording so we can flag a genuine improvement.
    const previousBest = getProgressSnapshot().mockExams[level]?.bestScore ?? -1;
    // The per-section tally travels with the score so the lobby can show the breakdown of the sitting
    // that actually set the best, rather than a best-of that never happened in one paper.
    const byContent = scoreByContent(questions, answers);
    const sectionCorrect = Object.fromEntries(
      MOCK_SECTIONS.map((section) => [section, byContent.find((c) => c.section === section)?.correct ?? 0]),
    );
    recordMockExamResult(level, result.correct, result.rawTotal, result.scaled, result.passed, sectionCorrect);
    setFinished({ questions, answers, isNewBest: result.scaled > previousBest, secondsUsed });
    setPhase('results');
    window.scrollTo({ top: 0 });
  }

  return (
    // No padding of its own — the app shell already provides the page gutter, and adding a second
    // one here left the exam sitting further from the edges than every other screen.
    <div className="flex flex-1 flex-col">
      {phase === 'lobby' && <ExamLobby level={level} onLevelChange={setLevel} onBegin={begin} />}
      {phase === 'countdown' && (
        <ExamCountdown level={level} onDone={() => setPhase('exam')} onCancel={() => setPhase('lobby')} />
      )}
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
          secondsUsed={finished.secondsUsed}
          onRetake={begin}
          onExit={() => setPhase('lobby')}
        />
      )}
    </div>
  );
}
