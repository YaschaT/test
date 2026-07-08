import { useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from '../storage';

export function getJapaneseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ja'));
}

/** Browsers don't expose a "quality" field, so this is a best-effort heuristic, not a guarantee. */
const PREFERRED_NAME_HINTS = ['google', 'kyoko', 'enhanced', 'premium', 'neural'];

export function pickBestJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;
  const byHint = voices.find((v) => PREFERRED_NAME_HINTS.some((hint) => v.name.toLowerCase().includes(hint)));
  if (byHint) return byHint;
  const remote = voices.find((v) => !v.localService);
  if (remote) return remote;
  return voices[0];
}

const VOICE_PREF_KEY = 'browser-voice-uri';

export function getSavedVoiceUri(): string | null {
  return readStorage<string | null>(VOICE_PREF_KEY, null);
}

export function saveVoiceUri(uri: string | null): void {
  writeStorage(VOICE_PREF_KEY, uri);
}

export function resolveSelectedVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const savedUri = getSavedVoiceUri();
  if (savedUri) {
    const found = voices.find((v) => v.voiceURI === savedUri);
    if (found) return found;
  }
  return pickBestJapaneseVoice(voices);
}

interface SpeakCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export function speakJapaneseBrowser(text: string, rate = 1, callbacks?: SpeakCallbacks): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = resolveSelectedVoice(getJapaneseVoices());
  if (voice) utterance.voice = voice;
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
  if (callbacks?.onStart) utterance.onstart = callbacks.onStart;
  if (callbacks?.onEnd) utterance.onend = callbacks.onEnd;
  if (callbacks?.onError) utterance.onerror = callbacks.onError;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// Cached so useSyncExternalStore gets a referentially stable snapshot between 'voiceschanged' events —
// getJapaneseVoices() itself allocates a new array every call via .filter(), which would otherwise
// trigger an infinite render loop.
let cachedVoices: SpeechSynthesisVoice[] = [];
let hasComputed = false;

function refreshCache(): SpeechSynthesisVoice[] {
  cachedVoices = getJapaneseVoices();
  hasComputed = true;
  return cachedVoices;
}

/** Only replaces the cached array (and reports a change) if the voice list actually differs. */
function refreshCacheIfChanged(): boolean {
  const next = getJapaneseVoices();
  const changed = next.length !== cachedVoices.length || next.some((v, i) => v.voiceURI !== cachedVoices[i]?.voiceURI);
  if (changed) cachedVoices = next;
  hasComputed = true;
  return changed;
}

function getVoiceListSnapshot(): SpeechSynthesisVoice[] {
  return hasComputed ? cachedVoices : refreshCache();
}

// The Web Speech API's voice loading is notoriously inconsistent: getVoices() often returns an empty
// array on the very first synchronous call right after page load, and 'voiceschanged' doesn't fire
// reliably in every browser. Listening for the event AND polling briefly covers both cases.
const POLL_DELAYS_MS = [0, 150, 500, 1500];

function subscribeToVoices(callback: () => void): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return () => {};
  const handler = () => {
    if (refreshCacheIfChanged()) callback();
  };
  window.speechSynthesis.addEventListener('voiceschanged', handler);
  const pollIds = POLL_DELAYS_MS.map((delay) => setTimeout(handler, delay));
  return () => {
    window.speechSynthesis.removeEventListener('voiceschanged', handler);
    pollIds.forEach(clearTimeout);
  };
}

const EMPTY_VOICES: SpeechSynthesisVoice[] = [];

/** Live list of installed Japanese voices — updates automatically if the OS loads them after mount. */
export function useJapaneseVoices(): SpeechSynthesisVoice[] {
  return useSyncExternalStore(subscribeToVoices, getVoiceListSnapshot, () => EMPTY_VOICES);
}

export function useJapaneseVoiceAvailable(): boolean {
  return useJapaneseVoices().length > 0;
}
