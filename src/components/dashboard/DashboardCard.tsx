import type { ReactNode } from 'react';
import { Card } from '../Card';

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** The shared "section card" shell used by Study Plan / Today's Path / Achievements — a title row (with
 * an optional leading icon and a trailing action) over free-form content. */
export function DashboardCard({ title, icon, action, children, className = '' }: DashboardCardProps) {
  return (
    <Card className={`p-5 space-y-4 h-full ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-fluid-section-title font-bold text-slate-900 dark:text-white">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  );
}
