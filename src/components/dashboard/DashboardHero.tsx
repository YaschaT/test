import { useId, useRef, type ChangeEvent } from 'react';
import { ChevronDown, Play, Target } from 'lucide-react';
import { SegmentedTabs } from '../SegmentedTabs';
import { SESSION_CTA_CLASSES } from '../../lib/buttonStyles';
import { formatDuration, STUDY_DURATION_PRESETS } from '../../lib/studyPlanCalculator';
import { JLPT_LEVELS } from '../../types';
import type { JlptLevel } from '../../types';

interface DashboardHeroProps {
  greetingJa: string;
  greetingEmoji: string;
  supportingText: string;
  ctaLabel: string;
  onStart: () => void;
  durationMinutes: number;
  onDurationChange: (minutes: number) => void;
  level: JlptLevel;
  onLevelChange: (level: JlptLevel) => void;
}

/**
 * The dashboard's night-scene hero: supplied scenery artwork behind the greeting, supplied mascot
 * artwork on the right, and the screen's one and only primary CTA. Everything else on the page is a
 * quiet, secondary action by design.
 */
export function DashboardHero({
  greetingJa,
  greetingEmoji,
  supportingText,
  ctaLabel,
  onStart,
  durationMinutes,
  onDurationChange,
  level,
  onLevelChange,
}: DashboardHeroProps) {
  const durationRef = useRef<HTMLSelectElement>(null);
  const durationId = useId();

  // A duration saved by an older build's 5-minute slider need not be one of the presets — keep it in the
  // list so the control still shows the learner's real, saved goal instead of silently snapping.
  const durationOptions = STUDY_DURATION_PRESETS.includes(durationMinutes as (typeof STUDY_DURATION_PRESETS)[number])
    ? [...STUDY_DURATION_PRESETS]
    : [...STUDY_DURATION_PRESETS, durationMinutes].sort((a, b) => a - b);

  return (
    <section className="relative isolate flex min-h-[280px] flex-col overflow-hidden rounded-3xl border border-ink-line bg-[radial-gradient(115%_150%_at_50%_38%,#0a1040_0%,#010723_72%)] sm:min-h-[300px]">
      {/* The scenery artwork is 3:2 with a soft alpha-masked edge, and the wide hero band is ~4:1 —
          stretching it to cover would crop the scene down to one flat strip. From `sm` it is sized off the
          hero's *height* instead, which keeps the moon, ridge, lanterns and torii together as one island
          exactly as in the reference, with the artwork's own faded edges dissolving into the navy either
          side; the -30% offset puts the composition's horizon, not its empty sky, in the visible band.
          On a phone the hero is taller than it is wide, so that same rule would blow the scene up to
          several times the card — there it simply covers. */}
      <img
        src="/assets/dashboard/redesign/hero-scenery.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[64%_58%] sm:inset-auto sm:left-[43%] sm:top-[-30%] sm:h-[170%] sm:w-auto sm:max-w-none sm:-translate-x-1/2 sm:object-contain"
      />
      {/* Keeps the greeting and CTA legible where the scenery's left edge reaches under them. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#010723] via-[#010723]/55 to-transparent"
        aria-hidden="true"
      />

      <img
        src="/assets/dashboard/redesign/hero-mascot.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-6 hidden h-[68%] w-auto max-w-[34%] object-contain object-bottom lg:block"
      />

      <div className="relative flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="jp-text text-fluid-hero-title font-extrabold text-white">
              {greetingJa} {greetingEmoji}
            </h1>
            <p className="mt-2 text-fluid-hero-sub text-slate-300">{supportingText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SegmentedTabs
              value={level}
              onChange={onLevelChange}
              variant="glass"
              size="md"
              groupLabel="JLPT level"
              options={JLPT_LEVELS.map((l) => ({ value: l, label: l }))}
            />
            <button
              type="button"
              onClick={() => durationRef.current?.focus()}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Target size={16} aria-hidden="true" />
              Edit Goals
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onStart} className={`${SESSION_CTA_CLASSES} min-h-13`}>
            <Play size={18} aria-hidden="true" />
            {ctaLabel}
          </button>

          <div className="relative">
            <label htmlFor={durationId} className="sr-only">
              Daily session length
            </label>
            <select
              id={durationId}
              ref={durationRef}
              value={durationMinutes}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onDurationChange(Number(e.target.value))}
              className="min-h-13 appearance-none rounded-2xl border border-white/15 bg-slate-950/60 py-3 pl-5 pr-11 text-base font-semibold text-white transition-colors hover:bg-slate-950/80"
            >
              {durationOptions.map((minutes) => (
                <option key={minutes} value={minutes} className="bg-slate-900 text-white">
                  {formatDuration(minutes)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
