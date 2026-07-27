import { useId } from 'react';

interface AiCoreProps {
  size?: number;
  /** Brighter, faster pulse while Kai is speaking or thinking. */
  active?: boolean;
  className?: string;
}

/**
 * Kai's avatar — a glowing "AI core": concentric rings, a slowly rotating HUD arc, and a pulsing
 * centre. A deliberate JARVIS-style assistant look (requested), built from the app's own brand blue
 * with a cyan highlight. All motion is CSS and disabled under `prefers-reduced-motion`.
 */
export function AiCore({ size = 40, active = false, className = '' }: AiCoreProps) {
  const uid = useId().replace(/:/g, '');
  const glow = `glow-${uid}`;
  const ring = `ring-${uid}`;

  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <style>{`
        .core-${uid} { animation: pulse-${uid} ${active ? '1.4s' : '3s'} ease-in-out infinite; transform-origin: 50% 50%; }
        .arc-${uid} { animation: spin-${uid} ${active ? '4s' : '9s'} linear infinite; transform-origin: 50% 50%; }
        .arc2-${uid} { animation: spin-${uid} ${active ? '6s' : '14s'} linear infinite reverse; transform-origin: 50% 50%; }
        @keyframes pulse-${uid} { 0%,100% { opacity: .55; transform: scale(.9); } 50% { opacity: 1; transform: scale(1.06); } }
        @keyframes spin-${uid} { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .core-${uid}, .arc-${uid}, .arc2-${uid} { animation: none; }
        }
      `}</style>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={glow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.9" />
            <stop offset="55%" stopColor="var(--color-brand-500)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-brand-600)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="var(--color-brand-400)" />
          </linearGradient>
        </defs>

        {/* ambient glow */}
        <circle cx="50" cy="50" r="46" fill={`url(#${glow})`} />

        {/* rotating HUD arcs */}
        <g className={`arc-${uid}`}>
          <circle cx="50" cy="50" r="38" fill="none" stroke={`url(#${ring})`} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 60" opacity="0.9" />
        </g>
        <g className={`arc2-${uid}`}>
          <circle cx="50" cy="50" r="30" fill="none" stroke="var(--color-brand-300)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="14 26" opacity="0.7" />
        </g>

        {/* static inner ring */}
        <circle cx="50" cy="50" r="22" fill="none" stroke="var(--color-brand-400)" strokeWidth="1.2" opacity="0.5" />

        {/* pulsing core */}
        <g className={`core-${uid}`}>
          <circle cx="50" cy="50" r="13" fill="var(--color-brand-500)" opacity="0.35" />
          <circle cx="50" cy="50" r="7" fill="#e0f7ff" />
          <circle cx="50" cy="50" r="7" fill={`url(#${ring})`} opacity="0.6" />
        </g>
      </svg>
    </span>
  );
}
