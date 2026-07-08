import type { ReactNode } from 'react';

interface SoundRippleProps {
  /** Drives the ripple from the real TTS playback state (`status === 'playing'`) — never decorative or
   * always-on. The rippling elements only exist in the DOM while audio is genuinely playing, so the
   * "infinite" CSS animation is bounded by a real, temporary state that always ends on its own. */
  active: boolean;
  children: ReactNode;
}

/**
 * Listening's signature moment: concentric rings pulsing outward from the Play button while audio is
 * actually playing — sound visualized as light rippling out into the same night sky every other page
 * already lives in, rather than a generic waveform bar-chart. Ties the page's real subject (audio) to the
 * app's existing "Night Lantern" identity instead of introducing an unrelated aesthetic.
 */
export function SoundRipple({ active, children }: SoundRippleProps) {
  return (
    <span className="relative inline-flex">
      {active && (
        <>
          <span className="absolute inset-0 rounded-2xl bg-brand-500/50 animate-sound-ripple" aria-hidden="true" />
          <span className="absolute inset-0 rounded-2xl bg-brand-500/50 animate-sound-ripple [animation-delay:0.7s]" aria-hidden="true" />
        </>
      )}
      <span className="relative z-10">{children}</span>
    </span>
  );
}
