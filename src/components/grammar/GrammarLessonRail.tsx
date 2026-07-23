import { Check, Lock } from 'lucide-react';
import type { GrammarLessonState } from './GrammarLessonList';

export interface GrammarRailItem {
  id: string;
  number: number;
  title: string;
  state: GrammarLessonState;
}

interface GrammarLessonRailProps {
  levelLabel: string;
  items: GrammarRailItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Table-of-contents rail down the side of a lesson — every grammar point in the level with its status,
 * so the learner keeps their place in the path while inside a lesson. Locked points are shown but not
 * navigable; the active lesson is highlighted.
 */
export function GrammarLessonRail({ levelLabel, items, activeId, onSelect }: GrammarLessonRailProps) {
  const completed = items.filter((i) => i.state === 'completed').length;

  return (
    <nav
      aria-label={`${levelLabel} lessons`}
      className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:shadow-none"
    >
      <div className="flex items-baseline justify-between px-2.5 pb-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-300">
          {levelLabel} Path
        </span>
        <span className="text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500">
          {completed} / {items.length}
        </span>
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = item.id === activeId;
          const locked = item.state === 'locked';
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={locked}
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(item.id)}
                className={`group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                  active
                    ? 'bg-brand-500/10 shadow-[inset_2px_0_0_var(--color-brand-500)] dark:bg-brand-500/15'
                    : locked
                      ? 'opacity-45 cursor-not-allowed'
                      : 'hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                }`}
              >
                <RailIcon state={item.state} active={active} />
                <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                  {String(item.number).padStart(2, '0')}
                </span>
                <span
                  className={`jp-text truncate text-sm ${
                    active
                      ? 'font-bold text-brand-700 dark:text-white'
                      : 'font-medium text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function RailIcon({ state, active }: { state: GrammarLessonState; active: boolean }) {
  if (state === 'completed') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
        <Check size={12} strokeWidth={3} className="text-white" aria-hidden="true" />
      </span>
    );
  }
  if (state === 'locked') {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 dark:text-slate-500">
        <Lock size={13} aria-hidden="true" />
      </span>
    );
  }
  // current / available
  return (
    <span
      className={`h-5 w-5 shrink-0 rounded-full border-2 ${
        active ? 'border-brand-500 bg-brand-500/20 dark:border-brand-400 dark:bg-brand-500/30' : 'border-slate-300 dark:border-slate-600'
      }`}
      aria-hidden="true"
    />
  );
}
