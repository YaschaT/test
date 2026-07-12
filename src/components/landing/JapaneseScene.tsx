import { useId } from 'react';

/**
 * The hero's cinematic night backdrop, built as stacked depth planes rather than one flat illustration:
 * a hazy aurora of brand glow, a moon with a real halo, a distant ridge fading into atmosphere, Mount
 * Fuji, and a backlit torii on the near ridge — each group carrying its own `data-parallax` speed so
 * scrolling separates the planes (GSAP reads these in LandingPage; static under reduced motion). All in
 * the app's indigo night palette — deliberately NOT the auth page's vermillion.
 */
export function JapaneseScene() {
  const uid = useId().replace(/:/g, '');

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 star-field" />

      {/* deep aurora — two overlapping soft brand glows that give the sky volume */}
      <div
        data-parallax="0.04"
        className="absolute -top-[10%] left-[8%] w-[55%] h-[55%] rounded-full bg-brand-600/15 blur-3xl"
      />
      <div
        data-parallax="0.05"
        className="absolute top-[12%] right-[4%] w-[45%] h-[50%] rounded-full bg-violet-600/10 blur-3xl"
      />

      {/* moon with halo */}
      <div data-parallax="0.1" className="absolute top-[8%] right-[12%]">
        <div className="absolute -inset-8 rounded-full bg-slate-200/10 blur-2xl" />
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200/90 shadow-[0_0_70px_22px_rgba(226,232,240,0.28)]" />
      </div>

      {/* far ridge — atmospheric perspective: lighter, hazier than Fuji in front of it */}
      <svg
        data-parallax="0.05"
        className="absolute bottom-[6%] left-0 w-full h-[30%] opacity-50"
        viewBox="0 0 1200 300"
        preserveAspectRatio="xMidYMax slice"
      >
        <path d="M-40 300 L260 130 L430 240 L640 90 L880 300 Z" className="fill-indigo-950" opacity="0.55" />
      </svg>

      {/* Fuji */}
      <svg
        data-parallax="0.08"
        className="absolute bottom-0 left-0 w-full h-[46%]"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id={`fuji-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-900)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <radialGradient id={`horizon-${uid}`} cx="50%" cy="100%" r="65%">
            <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1200" height="400" fill={`url(#horizon-${uid})`} />
        <path d="M240 400 L520 96 Q600 30 680 96 L960 400 Z" fill={`url(#fuji-${uid})`} />
        <path
          d="M520 96 Q600 30 680 96 L648 132 Q636 118 620 130 Q604 142 588 128 Q572 114 552 130 Z"
          className="fill-slate-300"
          opacity="0.28"
        />
      </svg>

      {/* horizon haze band — separates the mountain planes from the foreground */}
      <div
        data-parallax="0.1"
        className="absolute bottom-[10%] inset-x-0 h-24 bg-gradient-to-t from-brand-500/10 to-transparent blur-md"
      />

      {/* near plane: backlit torii */}
      <svg
        data-parallax="0.16"
        className="absolute bottom-0 right-[6%] w-40 sm:w-56 h-48 sm:h-64"
        viewBox="0 0 200 240"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <radialGradient id={`torii-glow-${uid}`} cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-brand-400)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="130" rx="95" ry="100" fill={`url(#torii-glow-${uid})`} />
        <g className="fill-indigo-950">
          <path d="M18 66 Q100 46 182 66 L182 80 Q100 62 18 80 Z" />
          <rect x="28" y="84" width="144" height="9" rx="2" />
          <rect x="44" y="70" width="12" height="170" rx="3" />
          <rect x="144" y="70" width="12" height="170" rx="3" />
          <rect x="93" y="93" width="14" height="30" rx="2" />
        </g>
      </svg>

      {/* vignette — darkened edges pull the eye to the center and add cinema depth */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 52%, rgba(2, 6, 23, 0.6) 100%)' }}
      />

      {/* bottom fade into the next section */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-slate-950" />
    </div>
  );
}
