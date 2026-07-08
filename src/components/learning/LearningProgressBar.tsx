import { Progress } from '../ui/progress';

interface LearningProgressBarProps {
  percent: number;
  barColor: string;
}

export function LearningProgressBar({ percent, barColor }: LearningProgressBarProps) {
  return (
    <Progress
      value={percent}
      className="h-1.5 bg-slate-100 dark:bg-slate-800"
      indicatorClassName={`${barColor} duration-300`}
    />
  );
}
