import { Sparkles, TrendingUp, Wrench } from 'lucide-react';
import type { ReleaseChange, ReleaseChangeKind } from '../../data/releases';

/**
 * Only "New" carries colour, and it borrows the identity indigo the rest of the app already uses.
 * The four learning-state colours (blue/violet/amber/emerald) stay locked to learning states, so a
 * changelog tag never borrows a meaning that belongs to a word's SRS status.
 */
const KIND = {
  new: {
    label: 'New',
    icon: Sparkles,
    className:
      'border-brand-500/25 bg-brand-500/10 text-brand-700 dark:border-brand-400/30 dark:bg-brand-500/15 dark:text-brand-300',
  },
  improved: {
    label: 'Improved',
    icon: TrendingUp,
    className:
      'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
  },
  fixed: {
    label: 'Fixed',
    icon: Wrench,
    className:
      'border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
  },
} as const satisfies Record<ReleaseChangeKind, { label: string; icon: typeof Sparkles; className: string }>;

export function ChangeTag({ kind }: { kind: ReleaseChangeKind }) {
  const { label, icon: Icon, className } = KIND[kind];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em] ${className}`}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}

/** The tagged change rows, shared by the card, the dialog and the full panel. */
export function ChangeList({ changes, compact = false }: { changes: ReleaseChange[]; compact?: boolean }) {
  return (
    <ul className={`flex flex-col ${compact ? 'gap-3' : 'gap-3.5'}`}>
      {changes.map((change, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-0.5">
            <ChangeTag kind={change.kind} />
          </span>
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-slate-700 text-pretty dark:text-slate-200">
              {change.text.en}
            </p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500 text-pretty dark:text-slate-400">
              {change.text.nl}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
