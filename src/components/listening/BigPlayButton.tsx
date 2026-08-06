import { Volume2, Loader2, Square } from 'lucide-react';
import { SoundRipple } from './SoundRipple';
import type { TtsPlaybackStatus } from '../../lib/tts/ttsService';

interface BigPlayButtonProps {
  onClick: () => void;
  /** Cuts playback short. Omitted, the button simply stays a play button while audio runs. */
  onStop?: () => void;
  playbackAvailable: boolean;
  status: TtsPlaybackStatus;
}

/**
 * The Listening page's centerpiece — a large circular play button (upgraded from a small pill-shaped
 * one) with the sound-ripple signature built in, so every call site gets both without re-wrapping.
 * Bigger touch target and more visual weight than the old button, matching a "this is the one thing you
 * do on this page" hierarchy.
 */
export function BigPlayButton({ onClick, onStop, playbackAvailable, status }: BigPlayButtonProps) {
  const loading = status === 'loading';
  // Turns into a stop button while audio runs, so a sentence started in a quiet carriage can be cut short.
  const playing = status === 'playing' && !!onStop;
  return (
    <div className="flex flex-col items-center gap-2">
      <SoundRipple active={status === 'playing'}>
        <button
          type="button"
          onClick={playing ? onStop : onClick}
          disabled={!playbackAvailable || loading}
          aria-label={
            loading ? 'Generating audio' : playing ? 'Stop' : playbackAvailable ? 'Play sentence' : 'Audio unavailable'
          }
          className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-[#6460e5] to-[#5050d5] text-white shadow-[0_4px_0_0_#3d3aa8,inset_0_1.5px_0_rgba(255,255,255,0.35)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none disabled:translate-y-0 transition-all duration-150"
        >
          {loading ? (
            <Loader2 size={30} className="animate-spin" aria-hidden="true" />
          ) : playing ? (
            <Square size={26} fill="currentColor" aria-hidden="true" />
          ) : (
            <Volume2 size={30} aria-hidden="true" />
          )}
        </button>
      </SoundRipple>
      {/* role="status" so "Generating audio…" is announced — otherwise a screen reader user presses play
          and gets silence with no way to tell whether anything is happening. */}
      <p role="status" className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {loading ? 'Generating audio…' : playing ? 'Tap to stop' : playbackAvailable ? 'Tap to play' : 'Audio unavailable'}
      </p>
    </div>
  );
}
