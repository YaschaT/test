import { useEffect, useState } from 'react';
import { TorriiGateScene } from './TorriiGateScene';
import { Logo } from '../Logo';

interface AuthMascotSplashProps {
  onDone: () => void;
}

const FULL_DURATION_MS = 1300;
const REDUCED_MOTION_DURATION_MS = 250;

/**
 * The first-arrival ceremony before the split auth layout appears: the same torii-gate scene that stays
 * on screen afterward (see AuthShell), just shown centered and full-bleed first, then the split layout
 * settles in around it. Plays once per browser session — see AuthShell's hasSeenSplash gating.
 */
export function AuthMascotSplash({ onDone }: AuthMascotSplashProps) {
  const [label, setLabel] = useState('Opening the gate…');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? REDUCED_MOTION_DURATION_MS : FULL_DURATION_MS;
    const labelTimer = setTimeout(() => setLabel('Welcome.'), Math.max(duration - 350, 0));
    const doneTimer = setTimeout(onDone, duration);
    return () => {
      clearTimeout(labelTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#0a0a0f]">
      <div className="w-56 h-64 sm:w-64 sm:h-72">
        <TorriiGateScene phase="greeting" />
      </div>
      <div className="flex items-center gap-2">
        <Logo size={20} />
        <span className="text-base font-semibold text-white/90" style={{ fontFamily: "'Fraunces', serif" }}>
          Kotobox
        </span>
      </div>
      <p role="status" className="text-sm text-white/45">
        {label}
      </p>
    </div>
  );
}
