import { Headphones } from 'lucide-react';
import { Card } from '../Card';
import { RingStat } from '../dashboard/RingStat';
import { XP_RULES } from '../../lib/xp';

interface ListeningSessionProgressProps {
  index: number;
  total: number;
  correctCount: number;
}

/**
 * A real, honest session-progress panel — position in the session (a genuine bounded ratio, matching
 * the RingStat contract everywhere else in the app) and the running correct-answer count. Deliberately
 * does not include a per-skill "minutes today" goal or a weekly streak calendar: neither exists as real,
 * per-listening-skill data in the progress store (only aggregate daily minutes and an overall streak do),
 * and inventing skill-specific numbers to fill the space would violate "real data, always."
 */
export function ListeningSessionProgress({ index, total, correctCount }: ListeningSessionProgressProps) {
  const progress = total > 0 ? index / total : 0;

  return (
    <Card className="p-5 flex items-center gap-4">
      <RingStat progress={progress} color="var(--color-brand-500)" size={64} strokeWidth={6}>
        <Headphones size={20} className="text-brand-500" aria-hidden="true" />
      </RingStat>
      {/* Says how it's going; the card beside it says where you are. They used to say the same thing
          twice. The XP figure names what it counts, because the session bonus lands only at the end and
          an unexplained jump makes every other number on the page look unreliable. */}
      <div className="min-w-0">
        <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
          {correctCount} <span className="text-sm font-medium text-slate-600 dark:text-slate-300">correct</span>
        </p>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-tight">
          of {index} answered
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
          +{correctCount * XP_RULES.quizCorrectAnswer} XP from answers
        </p>
      </div>
    </Card>
  );
}
