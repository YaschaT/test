import { useId } from 'react';

export type MascotMood = 'neutral' | 'happy' | 'sleepy';

interface MascotProps {
  size?: number;
  mood?: MascotMood;
  showStreak?: boolean;
  className?: string;
}

const INK = '#4a3524';
const SCARF = 'var(--color-brand-500)';
const SCARF_DEEP = 'var(--color-brand-700)';

/**
 * Original full-body fox-spirit character for Kotobox — no borrowed assets, mascot, or brand identity
 * copied from anywhere (not an owl, not a panda). Warm fur ties to a friendly "kitsune companion" feel;
 * the indigo scarf is the one piece of brand-color wardrobe linking it to the app's own palette.
 */
export function Mascot({ size = 40, mood = 'neutral', showStreak = false, className }: MascotProps) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={(size * 76) / 64}
      viewBox="0 0 64 76"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`Kotobox fox mascot, ${mood}`}
    >
      <defs>
        <radialGradient id={`fur-${uid}`} cx="38%" cy="25%" r="85%">
          <stop offset="0%" stopColor="#ffbb78" />
          <stop offset="100%" stopColor="#f2793d" />
        </radialGradient>
        <radialGradient id={`cream-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff8ec" stopOpacity="0.98" />
          <stop offset="75%" stopColor="#fff8ec" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff8ec" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`shadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`scarf-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SCARF} />
          <stop offset="100%" stopColor={SCARF_DEEP} />
        </linearGradient>
        <linearGradient id={`flame-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5967e" />
          <stop offset="100%" stopColor="var(--color-accent-500)" />
        </linearGradient>
      </defs>

      {/* grounding shadow */}
      <ellipse cx="32" cy="74" rx="17" ry="3" fill={`url(#shadow-${uid})`} />

      {/* tail */}
      <ellipse cx="52" cy="42" rx="10" ry="20" fill={`url(#fur-${uid})`} transform="rotate(25 52 42)" />
      <ellipse cx="56" cy="24" rx="6" ry="9" fill={`url(#cream-${uid})`} transform="rotate(25 56 24)" />

      {/* body */}
      <path d="M17 50 Q32 43 47 50 L47 65 Q47 74 32 74 Q17 74 17 65 Z" fill={`url(#fur-${uid})`} />
      <ellipse cx="32" cy="60" rx="9.5" ry="12.5" fill={`url(#cream-${uid})`} />

      {/* ears (outer) */}
      <path d="M10 26 L18 5 Q19.5 2 21 5 L28 26 Z" fill={`url(#fur-${uid})`} />
      <path d="M36 26 L43 5 Q44.5 2 46 5 L54 26 Z" fill={`url(#fur-${uid})`} />

      {/* head */}
      <circle cx="32" cy="30" r="20" fill={`url(#fur-${uid})`} />
      <ellipse cx="24" cy="14" rx="9" ry="5" fill="#ffffff" opacity="0.3" transform="rotate(-18 24 14)" />

      {/* ears (inner) */}
      <path d="M14 22 L19 10 L24 22 Z" fill="#fff8ec" opacity="0.9" />
      <path d="M40 22 L45 10 L50 22 Z" fill="#fff8ec" opacity="0.9" />

      {/* muzzle */}
      <ellipse cx="32" cy="37" rx="12.5" ry="9.5" fill={`url(#cream-${uid})`} />

      {mood === 'sleepy' ? (
        <>
          <path d="M18 28 Q23 31 27 28" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M37 28 Q41 31 46 28" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M19 22.5 Q22.5 20.5 26 22" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M38 22 Q41.5 20.5 45 22.5" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
          <circle cx="23" cy="28" r="3.3" fill="#fffdf8" />
          <circle cx="41" cy="28" r="3.3" fill="#fffdf8" />
          <circle cx="24.1" cy="28" r="1.7" fill={INK} />
          <circle cx="42.1" cy="28" r="1.7" fill={INK} />
          <circle cx="23.4" cy="27.1" r="0.6" fill="#ffffff" />
          <circle cx="41.4" cy="27.1" r="0.6" fill="#ffffff" />
        </>
      )}

      {/* nose */}
      <path d="M29.7 37 Q32 35.5 34.3 37 Q33.8 38.7 32 38.9 Q30.2 38.7 29.7 37 Z" fill={INK} />

      {/* mouth */}
      {mood === 'happy' ? (
        <path d="M25 41 Q32 47.5 39 41" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ) : mood === 'sleepy' ? (
        <path d="M28.5 41.5 Q32 43 35.5 41.5" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M27 40.5 Q32 44 37 40.5" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      )}

      {/* scarf */}
      <rect x="16" y="46" width="32" height="7" rx="3.5" fill={`url(#scarf-${uid})`} />
      <path d="M29 52 L35 52 L32.5 60 Z" fill={SCARF_DEEP} />

      {/* paws */}
      <ellipse cx="23" cy="70" rx="6" ry="4.5" fill={`url(#cream-${uid})`} />
      <ellipse cx="41" cy="70" rx="6" ry="4.5" fill={`url(#cream-${uid})`} />

      {showStreak && (
        <path
          d="M50 2c0 3-3 4-3 7a3 3 0 0 0 6 0c1 1 1.5 2.2 1.5 3.5A4.5 4.5 0 0 1 50 17a4.5 4.5 0 0 1-4.5-4.5c0-3.5 2.5-5 4.5-10.5Z"
          fill={`url(#flame-${uid})`}
          stroke="#fffdf8"
          strokeWidth="1.4"
        />
      )}
    </svg>
  );
}
