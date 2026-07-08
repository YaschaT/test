import { useEffect, useState } from 'react';
import { Mascot } from '../Mascot';
import { Logo } from '../Logo';

interface AuthMascotSplashProps {
  onDone: () => void;
}

const FULL_DURATION_MS = 1300;
const REDUCED_MOTION_DURATION_MS = 250;

/**
 * The one deliberate page-load choreography on this surface (see index.css's auth-mascot-* keyframes for
 * why that's an intentional exception to the product register's "no page-load choreography" default): the
 * mascot visibly wakes up and greets the visitor before the login/register card appears. Plays once per
 * browser session (gated by the caller via sessionStorage) so returning visitors who flip between /login
 * and /register don't sit through it repeatedly.
 */
export function AuthMascotSplash({ onDone }: AuthMascotSplashProps) {
  const [label, setLabel] = useState('Getting things ready…');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? REDUCED_MOTION_DURATION_MS : FULL_DURATION_MS;
    const labelTimer = setTimeout(() => setLabel('Ready!'), Math.max(duration - 350, 0));
    const doneTimer = setTimeout(onDone, duration);
    return () => {
      clearTimeout(labelTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-slate-950">
      <div className="absolute inset-0 star-field" aria-hidden="true" />
      <div className="relative auth-mascot-splash-container flex flex-col items-center gap-5">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40" aria-hidden="true">
          <Mascot size={128} mood="sleepy" className="auth-mascot-sleepy-layer absolute inset-0 m-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]" />
          <Mascot size={128} mood="happy" className="auth-mascot-happy-layer absolute inset-0 m-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]" />
        </div>
        <div className="flex items-center gap-2">
          <Logo size={22} />
          <span className="text-lg font-semibold text-white">Kotobox</span>
        </div>
        <p role="status" className="text-sm text-white/50">
          {label}
        </p>
      </div>
    </div>
  );
}
