import type { LucideIcon } from 'lucide-react';
import { RingStat } from '../dashboard/RingStat';
import { useCountUp } from '../../lib/useCountUp';
import { MASCOTS, MASCOT_BANNER_SIZE, type MascotName } from '../../lib/mascots';

/** A quiet supporting number. Deliberately just a value + a short label — no icon, no helper line. */
export interface HeroFact {
  value: number;
  label: string;
  suffix?: string;
  /** Highlights the number amber when there's something waiting to be done. */
  actionable?: boolean;
}

interface ModuleStatsHeroProps {
  /** 0..1 — fills the progress ring. */
  ringProgress: number;
  ringIcon: LucideIcon;
  /** The one number this page is about. */
  headlineValue: number;
  /** Optional denominator shown muted after the headline (omit for open-ended metrics). */
  headlineTotal?: number;
  headlineLabel: string;
  /** Optional unit appended to the headline value, e.g. "%". */
  headlineSuffix?: string;
  /** Which mascot to show. Size is fixed by the component so every module banner matches. */
  mascot: MascotName;
  /**
   * Up to two supporting facts. Optional on purpose — a page with nothing else worth saying (or whose
   * breakdown already appears elsewhere on screen) passes none rather than padding the banner out.
   */
  facts?: HeroFact[];
}

/**
 * The single night-sky banner shared by every skill module.
 *
 * Built around ONE primary number (ring + headline), with at most two quiet supporting facts. An
 * earlier version carried three icon-chips each with a value, a label AND a helper line, which read as
 * information overload and buried the number that actually mattered. Helper copy ("Ready to start",
 * "Keep your streak") was filler and is gone; anything already shown elsewhere on the page (e.g.
 * Grammar's per-level counts, which the level tabs below repeat) is not restated here.
 *
 * Every value is real, derived from actual progress — never a fabricated placeholder.
 */
export function ModuleStatsHero({
  ringProgress,
  ringIcon: RingIcon,
  headlineValue,
  headlineTotal,
  headlineLabel,
  headlineSuffix,
  mascot,
  facts = [],
}: ModuleStatsHeroProps) {
  const displayValue = useCountUp(headlineValue);

  return (
    <div className="relative flex min-h-[132px] items-center overflow-hidden rounded-3xl bg-slate-950">
      <img
        src="/assets/kotobox-dashboard/generated/hero-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-10 flex w-full items-center gap-5 p-5 sm:gap-6 sm:p-6">
        {/* Primary: the one number this page is about */}
        <RingStat progress={ringProgress} color="#8b7cf6" trackColor="#ffffff" size={72} strokeWidth={7}>
          <RingIcon size={22} className="text-white/80" aria-hidden="true" />
        </RingStat>

        <div className="min-w-0 flex-1">
          <p className="text-[1.75rem] font-bold leading-none text-white tabular-nums sm:text-4xl">
            {displayValue.toLocaleString()}
            {headlineSuffix}
            {headlineTotal != null && (
              <span className="text-base font-medium text-slate-400"> / {headlineTotal.toLocaleString()}</span>
            )}
          </p>
          <p className="mt-1.5 text-sm font-medium text-slate-300">{headlineLabel}</p>
        </div>

        {/* Secondary: quiet supporting facts */}
        {facts.length > 0 && (
          <div className="flex shrink-0 items-center gap-5 border-l border-white/10 pl-5 sm:gap-7 sm:pl-7">
            {facts.map((f) => (
              <div key={f.label}>
                <p
                  className={`text-lg font-bold leading-none tabular-nums sm:text-xl ${
                    f.actionable && f.value > 0 ? 'text-amber-300' : 'text-white'
                  }`}
                >
                  {f.value.toLocaleString()}
                  {f.suffix}
                </p>
                <p className="mt-1 text-xs text-slate-400">{f.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Fixed square box + object-contain: identical footprint on every module page. */}
        <img
          src={MASCOTS[mascot]}
          alt=""
          aria-hidden="true"
          width={MASCOT_BANNER_SIZE}
          height={MASCOT_BANNER_SIZE}
          style={{ width: MASCOT_BANNER_SIZE, height: MASCOT_BANNER_SIZE }}
          className="hidden shrink-0 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] md:block"
        />
      </div>
    </div>
  );
}
