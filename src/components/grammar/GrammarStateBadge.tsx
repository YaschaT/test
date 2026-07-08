import { CheckCircle2, Lock, Sparkles, type LucideIcon } from 'lucide-react';

export type GrammarPointState = 'completed' | 'current' | 'locked';

interface StateMeta {
  label: string;
  icon: LucideIcon;
  className: string;
}

/** Grammar's real state vocabulary — only three states exist because the data model is a flat
 * done/not-done boolean (no SRS interval, no separate "mastered" tier). "Current" doubles as the
 * brief's "Practice" label since it's the one point genuinely available to work on next. */
const STATE_META: Record<GrammarPointState, StateMeta> = {
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-brand-500/15 text-brand-700 dark:text-brand-300' },
  current: { label: 'Practice', icon: Sparkles, className: 'bg-violet-500/15 text-violet-700 dark:text-violet-300' },
  locked: { label: 'Locked', icon: Lock, className: 'bg-slate-500/10 text-slate-500 dark:text-slate-400' },
};

export function GrammarStateBadge({ state }: { state: GrammarPointState }) {
  const meta = STATE_META[state];
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${meta.className}`}>
      <Icon size={11} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
