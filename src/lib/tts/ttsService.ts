import { useEffect, useRef, useState } from 'react';
import { readStorage, writeStorage } from '../storage';
import { speakJapaneseBrowser } from './browserTts';
import { fetchGoogleTtsAudioUrl, fetchGoogleTtsStatus, GoogleTtsError } from './googleTts';

export type VoiceMode = 'browser' | 'google';

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
      const url = await fetchGoogleTtsAudioUrl(text, rate);
      if (!audioRef.current) audioRef.current = new Audio();
      const audio = audioRef.current;
      audio.src = url;
      audio.onended = () => setState({ status: 'idle' });
      audio.onerror = () => setState({ status: 'error', errorMessage: 'Audio playback failed.' });
      setState({ status: 'playing' });
      await audio.play();
    } catch (err) {
      setState({
        status: 'error',
        errorMessage: err instanceof GoogleTtsError ? err.message : 'Could not generate audio.',
      });
    }
  }

  return { state, play };
}
