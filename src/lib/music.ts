import { readStorage, writeStorage } from './storage';

const MUSIC_ENABLED_KEY = 'music-enabled';

/** Defaults to off — background music is opt-in, never autoplays on load. */
export function isMusicEnabled(): boolean {
  return readStorage<boolean>(MUSIC_ENABLED_KEY, false);
}

export function setMusicEnabled(enabled: boolean): void {
  writeStorage(MUSIC_ENABLED_KEY, enabled);
}

let musicContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let intervalId: number | null = null;
let stepIndex = 2;
let resumeListenerAttached = false;

function getMusicContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!musicContext) {
    musicContext = new AudioCtor();
    masterGain = musicContext.createGain();
    masterGain.gain.value = 0.045;
    masterGain.connect(musicContext.destination);
  }
  return musicContext;
}

/** iOS/Chrome suspend new AudioContexts until a real user gesture. A returning user who left music on
 * will have `isMusicEnabled()` true from their very first render, before any gesture in *this* session —
 * this one-time listener resumes playback the moment they click/tap/press anything, so it doesn't just
 * silently fail to start. */
function attachResumeOnGesture(): void {
  if (resumeListenerAttached || typeof document === 'undefined') return;
  resumeListenerAttached = true;
  const resume = () => {
    if (musicContext && musicContext.state === 'suspended') void musicContext.resume();
    document.removeEventListener('pointerdown', resume);
    document.removeEventListener('keydown', resume);
  };
  document.addEventListener('pointerdown', resume);
  document.addEventListener('keydown', resume);
}

// Hirajoshi (Japanese "In" scale) built from D4 — semitone offsets 0, 1, 5, 7, 8 — a genuinely
// Japanese-sounding pentatonic rather than a generic major scale, kept small and consonant so a random
// walk across it never hits a harsh interval.
const ROOT = 293.66;
const SEMITONE = Math.pow(2, 1 / 12);
const SCALE = [0, 1, 5, 7, 8].map((n) => ROOT * Math.pow(SEMITONE, n));
const SCALE_HIGH = SCALE.map((f) => f * 2);
const STEP_MS = 1500;

function playTone(freq: number, duration: number, delay: number, peakGain: number): void {
  const ctx = getMusicContext();
  if (!ctx || !masterGain) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  const start = ctx.currentTime + delay;
  const end = start + duration;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peakGain, start + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(start);
  osc.stop(end + 0.05);
}

/** One step of a slow, wandering melody — a soft pad note from the scale (never jumping more than one
 * scale step, so it always sounds like a coherent phrase rather than random notes), with an occasional
 * brighter high chime layered on top for a light "gamified" sparkle. */
function step(): void {
  stepIndex = Math.max(0, Math.min(SCALE.length - 1, stepIndex + (Math.floor(Math.random() * 3) - 1)));
  playTone(SCALE[stepIndex], 1.7, 0, 1);
  if (Math.random() < 0.3) {
    const chimeIndex = Math.floor(Math.random() * SCALE_HIGH.length);
    playTone(SCALE_HIGH[chimeIndex], 0.5, 0.55, 0.5);
  }
}

export function startBackgroundMusic(): void {
  if (intervalId !== null) return;
  const ctx = getMusicContext();
  if (!ctx) return;
  attachResumeOnGesture();
  step();
  intervalId = window.setInterval(step, STEP_MS);
}

export function stopBackgroundMusic(): void {
  if (intervalId !== null) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}
