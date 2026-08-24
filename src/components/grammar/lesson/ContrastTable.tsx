import { GrammarBilingual } from '../GrammarBilingual';
import type { GrammarContrast } from '../../../types';

/** The lookalikes this pattern gets confused with, and the one thing you must never do with them. */
export function ContrastTable({ contrast }: { contrast: GrammarContrast }) {
  return (
    <div>
      <ul className="divide-y divide-white/[0.06]">
        {contrast.rows.map((row) => (
          <li
            key={row.form}
            className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-x-4 gap-y-1 py-3.5 sm:grid-cols-[64px_minmax(0,1fr)_120px]"
          >
            <span className="jp-text text-lg text-brand-300">{row.form}</span>
            <GrammarBilingual text={row.usedFor} size="sm" />
            <span className="jp-text col-start-2 text-sm text-slate-400 sm:col-start-3 sm:text-right">
              {row.example}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-300">
        <span>{contrast.warning.en}</span>
        {contrast.warningJapanese && (
          <span className="jp-text font-medium text-rose-400 line-through decoration-rose-400/60">
            {contrast.warningJapanese}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{contrast.warning.nl}</p>
    </div>
  );
}
