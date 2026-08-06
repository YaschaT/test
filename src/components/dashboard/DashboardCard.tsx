import type { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  /** Small caption under the title (e.g. "3 activities · 15 min"). */
  subtitle?: ReactNode;
  /** Trailing link-style action in the title row. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

/** The shared section-card shell for the dashboard's main cards — one navy surface, a hairline border,
 * and a title row with a leading icon, an optional caption and an optional trailing action. */
export function DashboardCard({ title, icon, subtitle, action, children, className = '', id }: DashboardCardProps) {
  return (
    <section
      id={id}
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-ink-line dark:bg-ink-900 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 text-fluid-section-title font-bold text-slate-900 dark:text-white">
            {icon}
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** The quiet "View full path" / "View all" link that closes a card's title row. */
export function CardAction({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-my-2 -mr-2 inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-brand-600 hover:underline dark:text-iris-400"
    >
      {children}
    </button>
  );
}
