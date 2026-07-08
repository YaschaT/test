import type { Translatable } from '../types';

/** Always shows English + Dutch together, per the app's bilingual-explanation requirement. */
export function Bilingual({ text, className }: { text: Translatable; className?: string }) {
  return (
    <div className={className}>
      <p className="text-slate-800 dark:text-slate-100">{text.en}</p>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{text.nl}</p>
    </div>
  );
}
