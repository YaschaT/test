import { ProgressBar } from '../ui/ProgressBar';

interface LearningProgressBarProps {
  percent: number;
}

/** Per-card learning-progress meter — the app-wide ProgressBar, so vocabulary and kanji cards match the
 * grammar completion bar. The card's state badge still carries the learning-state color. */
export function LearningProgressBar({ percent }: LearningProgressBarProps) {
  return <ProgressBar value={percent} label="Learning progress" />;
}
