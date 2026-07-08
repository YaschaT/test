import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../lib/useCountUp';

interface LearningStatItemProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
  helper: string;
}

export function LearningStatItem({ icon: Icon, iconBg, iconColor, value, label, helper }: LearningStatItemProps) {
  const displayValue = useCountUp(value);

  return (
    <div className="flex items-center gap-3">
      <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${iconBg}`}>
        <Icon size={20} className={iconColor} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white leading-tight">{displayValue}</p>
        <p className="text-sm font-semibold text-slate-200 leading-snug">{label}</p>
        <p className="text-xs text-slate-400 leading-snug">{helper}</p>
      </div>
    </div>
  );
}
