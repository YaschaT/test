import { useId } from 'react';
import { Mascot } from '../Mascot';

interface TorriiGateSceneProps {
  /** 'greeting' is the resting/idle scene shown on arrival; 'entering' plays the exit choreography — the
   * mascot stepping through the gate — right before navigating to the Dashboard. */
  phase: 'greeting' | 'entering';
  className?: string;
}

/**
 * The redesign's signature: Kotobox's logo already reads "道" (way/path) into a torii silhouette, but only
 * as a small icon. Here that idea becomes the actual scene — a real gate the fox mascot stands before (and,
 * on sign-in, walks through), with warm vermillion light spilling from the far side. That glow is the
 * "you're about to enter your Dashboard" cue, kept as an atmospheric metaphor rather than a literal
 * dashboard-preview screenshot, which would read as a generic SaaS onboarding cliché.
 */
export function TorriiGateScene({ phase, className = '' }: TorriiGateSceneProps) {
  const uid = useId().replace(/:/g, '');

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
      <svg viewBox="0 0 320 400" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <radialGradient id={`glow-${uid}`} cx="50%" cy="44%" r="52%">
            <stop offset="0%" stopColor="#ff8a5c" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#e34a33" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e34a33" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`pillar-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c73f2b" />
            <stop offset="100%" stopColor="#9c2f1f" />
          </linearGradient>
        </defs>

        <ellipse cx="160" cy="190" rx="115" ry="155" fill={`url(#glow-${uid})`} className="torii-glow" />

        {/* ground shadow */}
        <ellipse cx="160" cy="356" rx="132" ry="13" fill="#000000" opacity="0.35" />

        {/* pillars */}
        <rect x="68" y="118" width="17" height="228" rx="4" fill={`url(#pillar-${uid})`} />
        <rect x="235" y="118" width="17" height="228" rx="4" fill={`url(#pillar-${uid})`} />

        {/* nuki crossbeam */}
        <rect x="68" y="198" width="184" height="13" rx="3" fill="#8a2a1c" />

        {/* kasagi + shimaki top beams (slightly curved) */}
        <path d="M46 122 Q160 94 274 122 L274 138 Q160 112 46 138 Z" fill="#c73f2b" />
        <rect x="58" y="140" width="204" height="11" rx="3" fill="#a8331f" />

        {/* gakuzuka (central support tablet) */}
        <rect x="150" y="151" width="20" height="46" rx="2" fill="#8a2a1c" />
      </svg>

      <div
        className={`relative flex flex-col items-center ${phase === 'entering' ? 'torii-mascot-entering' : 'torii-mascot-greet'}`}
        style={{ marginTop: '8%' }}
      >
        <Mascot size={92} mood="happy" showStreak={false} className="drop-shadow-[0_14px_22px_rgba(0,0,0,0.55)]" />
      </div>

      {phase === 'entering' && (
        <div
          className="absolute inset-0 torii-flood"
          style={{ background: 'radial-gradient(circle at 50% 46%, #fff1e8 0%, #ff8a5c 35%, #e34a33 70%)' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
