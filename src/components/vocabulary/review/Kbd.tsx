import type { ReactNode } from 'react';

/** Small keyboard-key chip used for the review screen's shortcut hints (Space, 1–4). */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.4rem] h-6 px-1.5 rounded-md border border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.06] text-[11px] font-semibold text-slate-500 dark:text-slate-300 font-sans">
      {children}
    </kbd>
  );
}
