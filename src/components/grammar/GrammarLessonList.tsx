import { ArrowRight, Check, ChevronRight, Lock } from 'lucide-react';
import type { GrammarLessonState } from '../../lib/grammarPath';

export type { GrammarLessonState };

/** Spoken status for each row, so it isn't carried by icon colour alone. */
const STATE_LABEL: Record<GrammarLessonState, string> = {
  completed: 'Completed',
  current: 'Next up',
  available: 'Not started',
  locked: 'Locked',
};

export interface GrammarLessonItem {
  id: string;
  /** 1-based index within the full course, shown as the two-digit row number. */
  number: number;
  title: string;
  meaningEn: string;
  /** The sentence pattern (e.g. "Noun / adjective + です"), previewed on the right of each row. */
  structure: string;
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
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 tabular-nums">
          {completedInLevel} / {totalInLevel} in {levelLabel}
        </span>
      </div>

      {/* A level with no points yet would otherwise render as a blank bordered frame that reads as a
          failed load. Not reachable today, but this list is driven by data that is still being written. */}
      {items.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-600 dark:border-white/[0.06] dark:bg-slate-900/40 dark:text-slate-300">
          No {levelLabel} grammar yet — it's still being written.
        </p>
      ) : (
        <ul className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-slate-900/40 divide-y divide-slate-100 dark:divide-white/[0.05] overflow-hidden">
          {items.map((item) => (
            <GrammarLessonRow key={item.id} item={item} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </section>
  );
}

function GrammarLessonRow({ item, onOpen }: { item: GrammarLessonItem; onOpen: (id: string) => void }) {
  const isCurrent = item.state === 'current';
  const isLocked = item.state === 'locked';

  return (
    <li className="relative">
      {/* A real button, not a div playing one: it gets Enter/Space, a focus ring and correct semantics for
          free. Locked rows stay focusable and use aria-disabled so a keyboard user can still read them —
          previously they were removed from the tab order entirely and were unreachable. */}
      <button
        type="button"
        aria-disabled={isLocked || undefined}
        onClick={isLocked ? undefined : () => onOpen(item.id)}
        /* Note the absence of `outline-none`: that was what suppressed the app's global :focus-visible
           ring, leaving the row with only a 3%-opacity background tint to show focus. Removing it is the
           whole fix — the row now gets the same ring as every other control in the app. */
        className={`group flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5 text-left transition-colors ${
          isCurrent
            ? 'bg-brand-500/10 dark:bg-brand-500/[0.12] shadow-[inset_2px_0_0_var(--color-brand-500)]'
            : isLocked
              ? 'cursor-default'
              : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03]'
        }`}
      >
        <StatusIcon state={item.state} />

        {/* Status in words, so it isn't carried by a small coloured circle alone. */}
        <span className="sr-only">{STATE_LABEL[item.state]}.</span>

        {/* Locked rows are muted with explicit foreground colours rather than a blanket opacity, which
            dimmed text and background together and dropped the row to 1.7:1. Both tiers now clear 4.5:1 —
            locked reads quieter than unlocked, but "quieter" stops at the legibility floor, and the real
            signal that a row is locked is the padlock and its label, not faint text. */}
        <span
          className={`w-6 shrink-0 text-sm font-semibold tabular-nums ${
            isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {String(item.number).padStart(2, '0')}
        </span>

        <span
          className={`jp-text shrink-0 text-base font-bold ${
            isLocked
              ? 'text-slate-500 dark:text-slate-400'
              : isCurrent
                ? 'text-brand-700 dark:text-white'
                : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {item.title}
        </span>

        {/* Wraps rather than truncating: at larger text sizes an ellipsis silently loses the meaning,
            which is the part a beginner leans on most. */}
        <span
          className={`min-w-0 text-sm ${isLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}
        >
          - {item.meaningEn}
        </span>

        {/* Pattern preview fills the row's right side so it reads as a full lesson, not a hollow line.
            Wraps rather than truncating, so enlarged text moves it onto its own line instead of cutting
            the pattern in half. */}
        <span className="jp-text ml-auto hidden max-w-[45%] rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 sm:inline-block dark:border-white/[0.06] dark:bg-white/[0.04] dark:text-slate-300">
          {item.structure}
        </span>

        {/* The padlock already sits in the status slot on the left, so a locked row simply has no
            trailing affordance — there is nowhere for it to go. */}
        {!isLocked && (
          <ChevronRight
            size={18}
            aria-hidden="true"
            className="ml-auto shrink-0 text-slate-400 transition-colors group-hover:text-slate-600 sm:ml-0 dark:text-slate-500 dark:group-hover:text-slate-300"
          />
        )}
      </button>
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
      <span className="flex h-6 w-6 shrink-0 items-center justify-center text-slate-500 dark:text-slate-400">
        <Lock size={15} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className="h-6 w-6 shrink-0 rounded-full border-2 border-slate-300 dark:border-slate-600" aria-hidden="true" />
  );
}
