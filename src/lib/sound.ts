import { readStorage, writeStorage } from './storage';

const SOUND_ENABLED_KEY = 'sound-enabled';

export function isSoundEnabled(): boolean {
  return readStorage<boolean>(SOUND_ENABLED_KEY, true);
}

export function setSoundEnabled(enabled: boolean): void {
  writeStorage(SOUND_ENABLED_KEY, enabled);
}

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioContext) audioContext = new AudioCtor();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

interface Tone {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  peakGain?: number;
}

/** Every sound here is synthesized with the Web Audio API — no external audio files. */
function playTones(tones: Tone[]): void {
  if (!isSoundEnabled()) return;
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  for (const tone of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.value = tone.freq;

    const startAt = now + tone.start;
    const endAt = startAt + tone.duration;
    const peak = tone.peakGain ?? 0.12;

    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(peak, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(endAt + 0.02);
  }
}

export function playCorrect(): void {
  playTones([
    { freq: 880, start: 0, duration: 0.11, type: 'triangle' },
    { freq: 1175, start: 0.09, duration: 0.14, type: 'triangle' },
  ]);
}

export function playWrong(): void {
  playTones([{ freq: 220, start: 0, duration: 0.22, type: 'sine', peakGain: 0.1 }]);
}

export function playComplete(): void {
  playTones([
    { freq: 523, start: 0, duration: 0.13, type: 'triangle' },
    { freq: 659, start: 0.1, duration: 0.13, type: 'triangle' },
    { freq: 784, start: 0.2, duration: 0.22, type: 'triangle' },
  ]);
}

export function playMilestone(): void {
  playTones([
    { freq: 523, start: 0, duration: 0.11, type: 'triangle' },
    { freq: 659, start: 0.08, duration: 0.11, type: 'triangle' },
    { freq: 784, start: 0.16, duration: 0.11, type: 'triangle' },
    { freq: 1047, start: 0.24, duration: 0.28, type: 'triangle' },
  ]);
}

/** Light UI tick — tabs, filters, view toggles. Deliberately the quietest/shortest sound in this file
 * since it fires on routine, frequent interactions. */
export function playSoftClick(): void {
  playTones([{ freq: 740, start: 0, duration: 0.05, type: 'sine', peakGain: 0.05 }]);
}

/** A touch deeper/rounder than softClick so picking a card reads differently from flipping a tab. */
export function playCardTap(): void {
  playTones([{ freq: 392, start: 0, duration: 0.08, type: 'triangle', peakGain: 0.07 }]);
}

/** The main "Learn" CTA — a small rising two-note phrase, more rewarding than a plain click but shorter
 * than playComplete (which marks finishing a whole review session, not just starting one). */
export function playPrimaryAction(): void {
  playTones([
    { freq: 587, start: 0, duration: 0.09, type: 'triangle', peakGain: 0.09 },
    { freq: 880, start: 0.07, duration: 0.16, type: 'triangle', peakGain: 0.09 },
  ]);
}

/** A brighter, punchier pop for reaching "Mastered" — distinct from playComplete's longer 3-note phrase
 * so it doesn't feel like it's announcing the end of a whole session. */
export function playSuccessPop(): void {
  playTones([
    { freq: 784, start: 0, duration: 0.07, type: 'triangle', peakGain: 0.1 },
    { freq: 1175, start: 0.05, duration: 0.16, type: 'triangle', peakGain: 0.1 },
  ]);
}

/** A slightly sharper, higher two-note ping for review-related actions — attention-grabbing without being
 * harsh, matching Review's amber "needs attention" tone. */
export function playReviewPing(): void {
  playTones([
    { freq: 1046, start: 0, duration: 0.06, type: 'sine', peakGain: 0.07 },
    { freq: 831, start: 0.05, duration: 0.09, type: 'sine', peakGain: 0.06 },
  ]);
}
