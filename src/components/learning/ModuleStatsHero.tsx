import type { LucideIcon } from 'lucide-react';
import { RingStat } from '../dashboard/RingStat';
import { LearningStatItem } from './LearningStatItem';
import { useCountUp } from '../../lib/useCountUp';

export interface StatChip {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
  helper: string;
  suffix?: string;
}

interface ModuleStatsHeroProps {
  /** 0..1 — fills the progress ring. */
  ringProgress: number;
  ringIcon: LucideIcon;
  /** Big counted-up headline number. */
  headlineValue: number;
  /** Optional denominator shown muted after the headline (omit for open-ended metrics). */
  headlineTotal?: number;
  headlineLabel: string;
  /** Optional unit appended to the headline value, e.g. "%". */
  headlineSuffix?: string;
  mascotSrc: string;
  mascotWidth: number;
  mascotHeight: number;
  stats: StatChip[];
}

/**
 * The single night-sky "banner" shared by every skill module. Same background, ring, mascot slot and
 * stat-chip row on Grammar, Vocabulary, Kanji, Reading and Listening — only the numbers and mascot pose
 * change, so all five pages open to the same panel rather than five one-off designs. Every value is
 * real, derived from actual progress (never a fabricated placeholder).
 */
export function ModuleStatsHero({
  ringProgress,
  ringIcon: RingIcon,
  headlineValue,
  headlineTotal,
  headlineLabel,
  headlineSuffix,
  mascotSrc,
  mascotWidth,
  mascotHeight,
  stats,
}: ModuleStatsHeroProps) {
  const displayValue = useCountUp(headlineValue);

  return (
    <div className="relative flex min-h-[150px] items-center overflow-hidden rounded-3xl bg-slate-950">
      <img
        src="/assets/kotobox-dashboard/generated/hero-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-10 flex w-full flex-wrap items-center gap-x-8 gap-y-5 p-5 sm:p-6">
        <div className="flex shrink-0 items-center gap-4">
          <RingStat progress={ringProgress} color="#8b7cf6" trackColor="#ffffff" size={72} strokeWidth={7}>
            <RingIcon size={22} className="text-white/80" aria-hidden="true" />
          </RingStat>
          <div>
            <p className="text-2xl font-bold leading-tight text-white tabular-nums sm:text-[1.75rem]">
              {displayValue.toLocaleString()}
              {headlineSuffix}
              {headlineTotal != null && (
                <span className="text-base font-medium text-slate-400"> / {headlineTotal.toLocaleString()}</span>
              )}
            </p>
            <p className="text-sm font-semibold leading-tight text-slate-200">{headlineLabel}</p>
          </div>
        </div>

        <img
          src={mascotSrc}
          alt=""
          aria-hidden="true"
          width={mascotWidth}
          height={mascotHeight}
          className="hidden shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] sm:block"
        />

        <div className="grid basis-full grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:basis-auto sm:flex-1 sm:flex-wrap sm:gap-x-8 sm:border-l sm:border-white/10 sm:pl-6">
          {stats.map((s) => (
            <LearningStatItem
              key={s.label}
              icon={s.icon}
              iconBg={s.iconBg}
              iconColor={s.iconColor}
              value={s.value}
              label={s.label}
              helper={s.helper}
              suffix={s.suffix}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
