import { Plus } from 'lucide-react';

interface GrammarFormulaCardProps {
  structure: string;
}

/**
 * A visual "formula" treatment for the grammar point's structure string. Splitting on " + " is safe
 * here — verified against every structure string in src/data/grammar.ts, all of which follow the same
 * "input + marker" shape — with a plain-text fallback if a future entry doesn't match, so nothing breaks
 * on content this hasn't been checked against.
 */
export function GrammarFormulaCard({ structure }: GrammarFormulaCardProps) {
  const parts = structure.split(' + ');

  return (
    <div className="rounded-2xl border border-brand-100 dark:border-brand-900/50 bg-brand-50/60 dark:bg-brand-950/30 p-5">
      <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">How to use it</h2>
      {parts.length === 2 ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="jp-text text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2">
            {parts[0]}
          </span>
          <Plus size={16} className="text-brand-400 shrink-0" aria-hidden="true" />
          <span className="jp-text text-lg sm:text-xl font-bold text-brand-700 dark:text-brand-200 bg-brand-100 dark:bg-brand-900/50 rounded-xl border border-brand-200 dark:border-brand-800 px-4 py-2">
            {parts[1]}
          </span>
        </div>
      ) : (
        <p className="jp-text text-lg text-slate-700 dark:text-slate-200">{structure}</p>
      )}
    </div>
  );
}
