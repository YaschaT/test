import { CUE } from './splashTimeline';

/**
 * The splash's sound kit, ported verbatim from the Claude Design composition.
 *
 * Every sound is synthesised through WebAudio — there are no audio files to ship or wait on. A master
 * gain feeds both the destination and a convolver loaded with a decaying noise burst, which is the
 * reverb tail; the design's levels (0.55 master, 0.22 wet) are kept as authored.
 *
 * **The browser will usually refuse to play this.** Autoplay policy blocks an AudioContext that has
 * never had a user gesture behind it, and a splash screen runs before the visitor has touched
 * anything — the design worked around that with its "Tap for sound" button, which an app splash has
 * nowhere to put. The context is created suspended, a resume is attempted, and the first pointer or
 * key event resumes it for the rest of the session. In practice that means the splash is silent on a
 * first visit and audible on later ones, in browsers that keep a media-engagement score.
 */

export interface SoundKit {
  ctx: AudioContext;
  master: GainNode;
}

type AudioContextCtor = typeof AudioContext;

export function makeKit(): SoundKit | null {
  const AC: AudioContextCtor | undefined =
    typeof window === 'undefined'
      ? undefined
      : window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!AC) return null;

  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0.55;

  // The reverb impulse: 1.1s of noise under a steep decay curve.
  const verb = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * 1.1);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  verb.buffer = buf;

  const wet = ctx.createGain();
  wet.gain.value = 0.22;
  master.connect(ctx.destination);
  master.connect(verb);
  verb.connect(wet);
  wet.connect(ctx.destination);

  return { ctx, master };
}

interface NoiseOptions {
  dur?: number;
  f0?: number;
  f1?: number;
  gain?: number;
  q?: number;
}

/** A band-passed noise burst whose centre frequency sweeps f0 → f1. */
function noise(kit: SoundKit, { dur = 0.5, f0 = 300, f1 = 2600, gain = 0.5, q = 1.1 }: NoiseOptions) {
  const { ctx, master } = kit;
  const n = Math.floor(ctx.sampleRate * dur);
  const b = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = b;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = q;

  const t = ctx.currentTime;
  bp.frequency.setValueAtTime(f0, t);
  bp.frequency.exponentialRampToValueAtTime(f1, t + dur);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + dur * 0.28);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(t);
  src.stop(t + dur);
}

interface ToneOptions {
  f?: number;
  f2?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  delay?: number;
}

/** A single oscillator, optionally gliding f → f2. */
function tone(kit: SoundKit, { f = 660, f2, dur = 0.3, gain = 0.3, type = 'sine', delay = 0 }: ToneOptions) {
  const { ctx, master } = kit;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const SOUND = {
  /** The field waking up. */
  spark: (k: SoundKit) => noise(k, { dur: 0.9, f0: 180, f1: 1500, gain: 0.22, q: 0.8 }),
  /** Kai leaving the floor. */
  launch: (k: SoundKit) => {
    noise(k, { dur: 0.55, f0: 400, f1: 4200, gain: 0.4, q: 1.4 });
    tone(k, { f: 180, f2: 900, dur: 0.5, gain: 0.16, type: 'triangle' });
  },
  /** Kai landing, with the confetti. */
  land: (k: SoundKit) => {
    tone(k, { f: 220, f2: 60, dur: 0.36, gain: 0.4, type: 'sine' });
    tone(k, { f: 1200, f2: 1900, dur: 0.14, gain: 0.14, type: 'triangle', delay: 0.02 });
    noise(k, { dur: 0.28, f0: 2400, f1: 700, gain: 0.16, q: 0.9 });
  },
  /** The nine-step run under the ring sweep, a semitone apart. */
  tick: (k: SoundKit, i: number) => tone(k, { f: 520 * Math.pow(2, i / 12), dur: 0.11, gain: 0.13, type: 'square' }),
  /** The arpeggio as the ring completes. */
  chime: (k: SoundKit) =>
    [0, 4, 7, 12].forEach((s, i) =>
      tone(k, { f: 523.25 * Math.pow(2, s / 12), dur: 1.1, gain: 0.13, type: 'sine', delay: i * 0.055 }),
    ),
  /** An XP chip popping up. */
  chip: (k: SoundKit) => tone(k, { f: 880, f2: 1320, dur: 0.16, gain: 0.12, type: 'triangle' }),
  /** The wipe. */
  handoff: (k: SoundKit) => {
    noise(k, { dur: 0.6, f0: 2200, f1: 260, gain: 0.2, q: 0.9 });
    tone(k, { f: 392, f2: 196, dur: 0.5, gain: 0.12, type: 'sine' });
  },
};

export interface SoundCue {
  /** Authored time the cue fires at. */
  at: number;
  play: (kit: SoundKit) => void;
}

/**
 * The cue table, in authored seconds — the composition's own list, including the nine ticks that run
 * under the ring sweep.
 */
export const SOUND_CUES: SoundCue[] = [
  { at: CUE.spark + 0.1, play: SOUND.spark },
  { at: CUE.launch + 0.02, play: SOUND.launch },
  { at: CUE.settle + 0.02, play: SOUND.land },
  { at: CUE.charge + 0.25, play: SOUND.chip },
  { at: CUE.charge + 0.72, play: SOUND.chip },
  { at: CUE.ready - 0.12, play: SOUND.chime },
  { at: CUE.handoff + 0.05, play: SOUND.handoff },
  ...Array.from({ length: 9 }, (_, i) => ({
    at: CUE.charge + 0.1 + i * 0.12,
    play: (k: SoundKit) => SOUND.tick(k, i),
  })),
].sort((a, b) => a.at - b.at);

/**
 * Fires every cue the playhead crossed between `prev` and `now`.
 *
 * Guards against both directions of jump: a backwards step (never happens, but cheap to rule out) and
 * a very long frame, which would otherwise dump a whole scene's worth of sound at once when a
 * background tab wakes up. The design used the same 0.5s window.
 */
export function fireSoundCues(kit: SoundKit, prev: number, now: number): void {
  if (now < prev || now - prev > 0.5) return;
  for (const cue of SOUND_CUES) {
    if (prev < cue.at && now >= cue.at) cue.play(kit);
  }
}
