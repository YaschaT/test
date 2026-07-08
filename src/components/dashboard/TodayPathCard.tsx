import { CheckCircle2, ChevronRight, Map, Sparkles } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { SKILL_THEME } from '../../lib/skillTheme';
import type { SkillArea } from '../../types';

export interface TodayPathStepData {
  id: string;
  title: string;
  subtitle: string;
  done: boolean;
  /** null when the skill has no built page yet (e.g. Speaking) — rendered as unavailable, never a dead link. */
  route: string | null;
  /** undefined for the synthetic "Warm Up" step, which isn't tied to one skill area. */
  skill?: SkillArea;
}

interface TodayPathCardProps {
  steps: TodayPathStepData[];
  onSelect: (route: string) => void;
  onViewPath?: () => void;
}

/**
 * A simple top-to-bottom sequence (not the zigzag chapter map used inside Grammar) since this represents
 * one day's session order, not a whole curriculum. Every step with a real route stays clickable regardless
 * of state — "later" only means "recommended for later in the session," never an actual navigation block.
 */
export function TodayPathCard({ steps, onSelect, onViewPath }: TodayPathCardProps) {
  const currentIndex = steps.findIndex((s) => !s.done);

  return (
    <DashboardCard
      title="Today's Path"
      icon={<Map size={20} className="text-brand-500" aria-hidden="true" />}
      action={
        <button
          type="button"
          onClick={onViewPath}
          className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline shrink-0"
        >
          View Path
        </button>
      }
    >
      <ol className="relative space-y-1.5">
        <div className="absolute left-[21px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex;
          const available = step.route !== null;
          const theme = step.skill ? SKILL_THEME[step.skill] : null;
          const StepIcon = theme?.icon ?? Sparkles;
          const content = (
            <>
              <span
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-base font-bold shrink-0 ${
                  step.done
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.done ? <CheckCircle2 size={20} /> : i + 1}
              </span>
              <span
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: theme ? `linear-gradient(135deg, ${theme.from}, ${theme.to})` : 'linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))' }}
                aria-hidden="true"
              >
                <StepIcon size={18} className="text-white" />
              </span>
              <span className="flex-1 min-w-0 text-left">
                <span className={`block text-base font-semibold ${step.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                  {step.title}
                </span>
                <span className="block text-sm text-slate-400 dark:text-slate-500">{step.subtitle}</span>
              </span>
              {available ? (
                <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 shrink-0" aria-hidden="true" />
              ) : (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">Coming soon</span>
              )}
            </>
          );

          return (
            <li key={step.id}>
              {available ? (
                <button
                  type="button"
                  onClick={() => onSelect(step.route!)}
                  className="w-full flex items-center gap-3.5 py-2.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {content}
                </button>
              ) : (
                <div className="w-full flex items-center gap-3.5 py-2.5 px-2 opacity-60">{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </DashboardCard>
  );
}
