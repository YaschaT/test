import { CalendarDays, Play, Zap } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { StudyDurationPicker } from '../StudyDurationPicker';
import { PrimaryButton } from '../PrimaryButton';
import type { StudyPlanResult } from '../../lib/studyPlanCalculator';

interface StudyPlanCardProps {
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
  plan: StudyPlanResult;
  onStart: () => void;
}

export function StudyPlanCard({ durationMinutes, onDurationChange, plan, onStart }: StudyPlanCardProps) {
  return (
    <DashboardCard title="Your Study Plan" icon={<CalendarDays size={20} className="text-brand-500" />}>
      <StudyDurationPicker minutes={durationMinutes} onChange={onDurationChange} />

      <PrimaryButton onClick={onStart} className="w-full justify-center py-3 text-base">
        <Play size={18} />
        Start Study Session
      </PrimaryButton>
      <p className="flex items-center justify-center gap-1.5 text-sm text-slate-400 dark:text-slate-500">
        <Zap size={14} className="text-amber-400" aria-hidden="true" />
        {plan.totalMinutes} min · {plan.items.length} {plan.items.length === 1 ? 'section' : 'sections'}
      </p>
    </DashboardCard>
  );
}
