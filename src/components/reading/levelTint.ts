/**
 * One hue per Tadoku level, shared by a shelf's heading dot and the field a typographic cover sits on,
 * so a book is placeable at a glance and the shelf it belongs to is obvious from the cover alone.
 */
export const LEVEL_DOT: Record<number, string> = {
  0: 'bg-sky-500',
  1: 'bg-emerald-500',
  2: 'bg-indigo-500',
  3: 'bg-amber-500',
  4: 'bg-rose-500',
  5: 'bg-violet-500',
};

/** The solid field behind a typographic cover — deep enough in dark mode to carry white serif type. */
export const LEVEL_WASH: Record<number, string> = {
  0: 'bg-sky-100 dark:bg-sky-950',
  1: 'bg-emerald-100 dark:bg-emerald-950',
  2: 'bg-indigo-100 dark:bg-indigo-950',
  3: 'bg-amber-100 dark:bg-amber-950',
  4: 'bg-rose-100 dark:bg-rose-950',
  5: 'bg-violet-100 dark:bg-violet-950',
};
