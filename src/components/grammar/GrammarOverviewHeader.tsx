interface GrammarOverviewHeaderProps {
  completedCount: number;
  totalCount: number;
}

/** Page title + overall completion meter, matching the Grammar overview mockup. Completion is global
 * across every level (not the currently-filtered tab), so it reflects true progress through the course. */
export function GrammarOverviewHeader({ completedCount, totalCount }: GrammarOverviewHeaderProps) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Grammar</h1>
        <p className="mt-1.5 text-slate-500 dark:text-slate-400">Master Japanese sentence patterns step by step.</p>
      </div>

      <div className="sm:w-72 shrink-0">
        <p className="text-sm mb-2">
          <span className="font-bold text-brand-600 dark:text-brand-400">{completedCount}</span>
          <span className="text-slate-500 dark:text-slate-400"> of {totalCount} completed</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{pct}%</span>
        </div>
      </div>
    </header>
  );
}
