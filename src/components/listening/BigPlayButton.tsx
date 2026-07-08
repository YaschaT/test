import { Volume2, Loader2 } from 'lucide-react';
import { SoundRipple } from './SoundRipple';
import type { TtsPlaybackStatus } from '../../lib/tts/ttsService';

interface BigPlayButtonProps {
  onClick: () => void;
  playbackAvailable: boolean;
  status: TtsPlaybackStatus;
}

/**
 * The Listening page's centerpiece — a large circular play button (upgraded from a small pill-shaped
 * one) with the sound-ripple signature built in, so every call site gets both without re-wrapping.
 * Bigger touch target and more visual weight than the old button, matching a "this is the one thing you
 * do on this page" hierarchy.
 */
export function BigPlayButton({ onClick, playbackAvailable, status }: BigPlayButtonProps) {
  const loading = status === 'loading';
  return (
    <div className="flex flex-col items-center gap-2">
      <SoundRipple active={status === 'playing'}>
        <button
          type="button"
          onClick={onClick}
          disabled={!playbackAvailable || loading}
          aria-label={loading ? 'Generating audio' : playbackAvailable ? 'Play sentence' : 'Audio unavailable'}
          className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-b from-[#6460e5] to-[#5050d5] text-white shadow-[0_4px_0_0_#3d3aa8,inset_0_1.5px_0_rgba(255,255,255,0.35)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none disabled:translate-y-0 transition-all duration-150"
        >
          {loading ? <Loader2 size={30} className="animate-spin" aria-hidden="true" /> : <Volume2 size={30} aria-hidden="true" />}
        </button>
      </SoundRipple>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
        {loading ? 'Generating audio…' : playbackAvailable ? 'Tap to play' : 'Audio unavailable'}
      </p>
    </div>
  );
}
