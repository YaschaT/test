import type { CSSProperties } from 'react';
import { Check, ChevronRight, Map, Sparkles } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { SKILL_THEME } from '../../lib/skillTheme';
import type { SkillArea } from '../../types';

export interface SessionStep {
  id: string;
  title: string;
  /** "5 min · 10 reviews" — real duration plus whatever metadata that step actually has. */
  meta: string;
  done: boolean;
  /** null when the skill has no built page yet — rendered as unavailable, never a dead link. */
  route: string | null;
  /** undefined for the synthetic "Warm-up" step, which isn't tied to one skill area. */
  skill?: SkillArea;
}

interface TodaySessionCardProps {
  steps: SessionStep[];
  totalMinutes: number;
  onSelect: (route: string) => void;
  onViewFullPlan: () => void;
}

/** Today's session as a single vertical timeline: numbered rail on the left, the skill's coloured icon
 * next to it, then the step and its metadata. One day's order, not the whole curriculum. */
export function TodaySessionCard({ steps, totalMinutes, onSelect, onViewFullPlan }: TodaySessionCardProps) {
  return (
    <DashboardCard
      title="Today's Session"
      icon={<Map size={20} className="text-brand-500 dark:text-iris-400" aria-hidden="true" />}
      subtitle={`${steps.length} ${steps.length === 1 ? 'activity' : 'activities'} · ${totalMinutes} min`}
      className="flex h-full flex-col"
    >
      {/* The rows share whatever height the card was given rather than bunching at the top: each step
          keeps its own minimum and grows evenly, so a stretched card reads as a roomy timeline instead
          of a short list with a void under it. */}
      <ol className="mt-5 flex flex-1 flex-col gap-1">
        {steps.map((step, i) => (
          <SessionRow key={step.id} step={step} index={i} isLast={i === steps.length - 1} onSelect={onSelect} />
        ))}
      </ol>

      <div className="pt-5">
        <button
          type="button"
          onClick={onViewFullPlan}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-ink-line dark:text-slate-200 dark:hover:bg-ink-800"
        >
          <Map size={16} className="text-brand-500 dark:text-iris-400" aria-hidden="true" />
          View full plan
        </button>
      </div>
    </DashboardCard>
  );
}

function SessionRow({
  step,
  index,
  isLast,
  onSelect,
}: {
  step: SessionStep;
  index: number;
  isLast: boolean;
  onSelect: (route: string) => void;
}) {
  const theme = step.skill ? SKILL_THEME[step.skill] : null;
  const StepIcon = theme?.icon ?? Sparkles;
  const accent = theme?.to ?? 'var(--color-iris-500)';
  const gradient = theme
    ? `linear-gradient(135deg, ${theme.from}, ${theme.to})`
    : 'linear-gradient(135deg, var(--color-iris-400), var(--color-iris-600))';
  const available = step.route !== null;

  const content = (
    <>
      {/* Numbered rail. The marker centres on the row like the icon and text beside it, and the connector
          runs from its bottom edge to the next marker's top edge — `100%` here is the row's own height, so
          the line still meets both markers if a step's text wraps to another line. */}
      <span
        className="relative flex w-10 shrink-0 items-center justify-center self-stretch"
        style={{ '--step-accent': accent } as CSSProperties}
      >
        {!isLast && (
          <span
            className="absolute left-1/2 top-[calc(50%+1.25rem)] h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-slate-200 dark:bg-ink-line"
            aria-hidden="true"
          />
        )}
        {/* Tinted with the step's own skill colour: a pale wash under a dark numeral on white, and the
            reverse on the dark card, so the marker stays clearly legible without competing with the
            saturated icon next to it. */}
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--step-accent)_16%,transparent)] text-sm font-bold text-[color-mix(in_srgb,var(--step-accent)_85%,black)] dark:bg-[color-mix(in_srgb,var(--step-accent)_52%,transparent)] dark:text-[color-mix(in_srgb,var(--step-accent)_20%,white)]">
          {step.done ? <Check size={18} aria-hidden="true" /> : index + 1}
        </span>
      </span>

      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: gradient }}
        aria-hidden="true"
      >
        <StepIcon size={22} className="text-white" />
      </span>

      <span className="min-w-0 flex-1 text-left">
        <span
          className={`block text-base font-semibold ${
            step.done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-900 dark:text-white'
          }`}
        >
          {step.title}
        </span>
        <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{step.meta}</span>
      </span>

      {available ? (
        <ChevronRight size={20} className="shrink-0 text-slate-300 dark:text-slate-500" aria-hidden="true" />
      ) : (
        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">Coming soon</span>
      )}
    </>
  );

  return (
    <li className="flex min-h-[4.25rem] flex-1 flex-col">
      {available ? (
        <button
          type="button"
          onClick={() => onSelect(step.route!)}
          className="flex h-full w-full items-center gap-4 rounded-2xl px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-ink-800"
        >
          {content}
        </button>
      ) : (
        <div className="flex h-full w-full items-center gap-4 px-2 py-2.5 opacity-60">{content}</div>
      )}
    </li>
  );
}
