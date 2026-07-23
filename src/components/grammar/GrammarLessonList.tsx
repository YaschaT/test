import { ArrowRight, Check, ChevronRight, Lock } from 'lucide-react';

export type GrammarLessonState = 'completed' | 'current' | 'available' | 'locked';

export interface GrammarLessonItem {
  id: string;
  /** 1-based index within the full course, shown as the two-digit row number. */
  number: number;
  title: string;
  meaningEn: string;
  state: GrammarLessonState;
}

interface GrammarLessonListProps {
  levelLabel: string;
  items: GrammarLessonItem[];
  completedInLevel: number;
  totalInLevel: number;
  onOpen: (id: string) => void;
}

export function GrammarLessonList({
  levelLabel,
  items,
  completedInLevel,
  totalInLevel,
  onOpen,
}: GrammarLessonListProps) {
  return (
    <section>
      <div className="flex items-baseline justify-between px-1 mb-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{levelLabel} Grammar</h2>
        <span className="text-sm font-medium text-slate-400 dark:text-slate-500 tabular-nums">
          {completedInLevel} / {totalInLevel}
        </span>
      </div>

      <ul className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-900/40 divide-y divide-slate-100 dark:divide-white/[0.05] overflow-hidden">
        {items.map((item) => (
          <GrammarLessonRow key={item.id} item={item} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  );
}

function GrammarLessonRow({ item, onOpen }: { item: GrammarLessonItem; onOpen: (id: string) => void }) {
  const isCurrent = item.state === 'current';
  const isLocked = item.state === 'locked';
  const clickable = !isLocked;

  return (
    <li className="relative">
      <div
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={clickable ? () => onOpen(item.id) : undefined}
        onKeyDown={
          clickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen(item.id);
                }
              }
            : undefined
        }
        aria-disabled={isLocked || undefined}
        className={`group flex items-center gap-4 px-4 py-3.5 outline-none transition-colors ${
          isCurrent
            ? 'bg-brand-500/10 dark:bg-brand-500/[0.12] shadow-[inset_2px_0_0_var(--color-brand-500)]'
            : clickable
              ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03] focus-visible:bg-slate-50 dark:focus-visible:bg-white/[0.03]'
              : 'opacity-45'
        }`}
      >
        <StatusIcon state={item.state} />

        <span className="w-6 shrink-0 text-sm font-semibold tabular-nums text-slate-400 dark:text-slate-500">
          {String(item.number).padStart(2, '0')}
        </span>

        <span
          className={`jp-text shrink-0 text-base font-bold ${
            isCurrent ? 'text-brand-700 dark:text-white' : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {item.title}
        </span>

        <span className="min-w-0 flex-1 truncate text-sm text-slate-400 dark:text-slate-500">
          - {item.meaningEn}
        </span>

        {isCurrent ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_6px_16px_-8px_rgba(58,84,214,0.9)] transition-transform group-hover:scale-[1.02]">
            Continue
            <ArrowRight size={15} aria-hidden="true" />
          </span>
        ) : (
          <ChevronRight
            size={18}
            aria-hidden="true"
            className="shrink-0 text-slate-300 dark:text-slate-600 transition-colors group-hover:text-slate-500 dark:group-hover:text-slate-400"
          />
        )}
      </div>
    </li>
  );
}

function StatusIcon({ state }: { state: GrammarLessonState }) {
  if (state === 'completed') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500">
        <Check size={14} strokeWidth={3} className="text-white" aria-hidden="true" />
      </span>
    );
  }
  if (state === 'current') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 shadow-[0_0_0_4px_rgba(76,110,240,0.18)]">
        <ArrowRight size={14} strokeWidth={2.5} className="text-white" aria-hidden="true" />
      </span>
    );
  }
  if (state === 'locked') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-slate-400 dark:text-slate-600">
        <Lock size={15} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="h-6 w-6 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" aria-hidden="true" />
  );
}
