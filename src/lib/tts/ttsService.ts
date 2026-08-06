import { useEffect, useRef, useState } from 'react';
import { readStorage, writeStorage } from '../storage';
import { speakJapaneseBrowser } from './browserTts';
import { fetchGoogleTtsAudioUrl, fetchGoogleTtsStatus, GoogleTtsError } from './googleTts';
import { fetchNeuralTtsAudioUrl } from './neuralTts';

export type VoiceMode = 'browser' | 'google' | 'neural';

/** Named for what the learner hears, not for the service behind it. */
export const VOICE_MODE_LABEL: Record<VoiceMode, string> = {
  neural: 'Natural',
  browser: 'On your device',
  google: 'Google Cloud',
};

/** What choosing it means for them — quality against whether it needs a connection. */
export const VOICE_MODE_DESCRIPTION: Record<VoiceMode, string> = {
  neural: 'Closest to a native speaker. Needs an internet connection.',
  browser: 'Works offline. How natural it sounds depends on the Japanese voices installed on your device.',
  google: 'Very close to a native speaker. Needs an internet connection.',
};

const VOICE_MODE_KEY = 'tts-voice-mode';

export function getSavedVoiceMode(): VoiceMode {
  return readStorage<VoiceMode>(VOICE_MODE_KEY, 'browser');
}

export function saveVoiceMode(mode: VoiceMode): void {
  writeStorage(VOICE_MODE_KEY, mode);
}

/** null while checking, then the real availability once the backend responds. */
export function useGoogleTtsAvailability(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGoogleTtsStatus().then((status) => {
      if (!cancelled) setAvailable(status.available);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return available;
}

export type TtsPlaybackStatus = 'idle' | 'loading' | 'playing' | 'error';

interface TtsPlayerState {
  status: TtsPlaybackStatus;
  errorMessage?: string;
}

/** Single entry point pages use to play audio — swapping/adding a provider only means editing this file. */
export function useTtsPlayer(mode: VoiceMode) {
  const [state, setState] = useState<TtsPlayerState>({ status: 'idle' });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Playback fails for three quite different reasons, and "Could not generate audio" was shown for all of
   * them. A learner whose browser blocked autoplay, and one who has simply gone offline, need to be told
   * different things — neither of them needs to hear that generation failed.
   */
  function describePlaybackFailure(err: unknown): string {
    if (err instanceof DOMException && err.name === 'NotAllowedError') {
      return 'Your browser blocked the audio from starting by itself. Press play to hear it.';
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return "You're offline, and this voice needs a connection.";
    }
    if (err instanceof GoogleTtsError) return err.message;
    return 'Could not generate audio.';
  }

  async function play(text: string, rate: number) {
    if (mode === 'browser') {
      speakJapaneseBrowser(text, rate, {
        onStart: () => setState({ status: 'playing' }),
        onEnd: () => setState({ status: 'idle' }),
        onError: () => setState({ status: 'error', errorMessage: 'Audio playback failed.' }),
      });
      return;
    }

    setState({ status: 'loading' });
    try {
      const url = mode === 'neural' ? await fetchNeuralTtsAudioUrl(text, rate) : await fetchGoogleTtsAudioUrl(text, rate);
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = url;
      audio.onended = () => setState({ status: 'idle' });
      audio.onerror = () => setState({ status: 'error', errorMessage: 'Audio playback failed.' });
      setState({ status: 'playing' });
      await audio.play();
    } catch (err) {
      setState({ status: 'error', errorMessage: describePlaybackFailure(err) });
    }
  }

  /** Cuts playback short. Both engines need stopping — one is speech synthesis, the other an <audio>. */
  function stop() {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState({ status: 'idle' });
  }

  return { state, play, stop };
}
