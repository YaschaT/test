/**
 * The splash screen's clock.
 *
 * The composition (see SplashScreen.tsx) is authored as a pure function of one time axis, exactly as it
 * came out of Claude Design: six named scenes with fixed durations, and every piece of choreography
 * keyed to absolute offsets inside them. That authored table is reproduced here **verbatim** — nothing
 * in it is retimed — because every start/end pair in the scene was tuned against it.
 *
 * What this module changes is only how fast the playhead moves through it, in two ways:
 *
 * 1. **Warp.** The design plays at demo pace: 7.5 seconds, on a loop, with nothing else going on. That
 *    is far too long for something a person sees every time they open the app. Each scene therefore
 *    gets a production duration, and the playhead runs through that scene at `authored / production`.
 *    Retiming this way rather than by rewriting the cue offsets means the *shape* of every move — the
 *    overshoot, the elastic settle, the stagger — survives intact; only the tempo changes.
 *
 * 2. **Gates.** At two points the playhead simply stops until the real boot work catches up. This is
 *    what keeps the animation from being rushed *or* from lying: the beats always play in full at
 *    their authored shape, and the waiting all happens at two frames chosen because nothing is in
 *    flight there, so a hold reads as the screen breathing rather than as a freeze.
 *
 * Everything here is pure, so the pacing can be tested without a DOM or a clock.
 */

export type PhaseId = 'spark' | 'launch' | 'settle' | 'charge' | 'ready' | 'handoff';

export const PHASES: PhaseId[] = ['spark', 'launch', 'settle', 'charge', 'ready', 'handoff'];

/** The composition's own scene lengths, in authored seconds. Do not retime — warp instead. */
export const AUTHORED: Record<PhaseId, number> = {
  spark: 1.2,
  launch: 1.0,
  settle: 1.0,
  charge: 1.6,
  ready: 1.8,
  handoff: 0.9,
};

/**
 * What each scene is actually given, in real seconds, on a boot with nothing to wait for.
 *
 * **These are the authored durations, 1:1** — the composition plays at exactly the tempo it was
 * designed at, for a 7.5s floor. An earlier revision warped this to a 2.86s floor on the reasoning
 * that a splash is seen on every load; that was overruled, and the design's own pacing is the
 * requirement. The warp machinery below is kept because it is what makes the table adjustable at all,
 * but at 1:1 every `speedAt` returns 1 and the playhead simply runs the scene.
 */
export const PRODUCTION: Record<PhaseId, number> = { ...AUTHORED };

function cueTable(): Record<PhaseId, number> & { end: number } {
  let at = 0;
  const cues = {} as Record<PhaseId, number> & { end: number };
  for (const phase of PHASES) {
    cues[phase] = at;
    at += AUTHORED[phase];
  }
  cues.end = at;
  return cues;
}

/** Authored start of each scene. `C.Charge` etc. read the same way they did in the design source. */
export const CUE = cueTable();

/** Total authored length of the composition, in authored seconds. */
export const AUTHORED_TOTAL = CUE.end;

/** The fastest the splash can possibly be, in real milliseconds. */
export const FLOOR_MS = PHASES.reduce((sum, phase) => sum + PRODUCTION[phase], 0) * 1000;

export type GateId = 'art' | 'work';

export interface Gate {
  id: GateId;
  /** Authored time the playhead waits at. */
  at: number;
  /** Longest this gate may hold, in real milliseconds, before it is forced open. */
  maxHoldMs: number;
}

/**
 * The two places the playhead is allowed to wait, and why each one is safe to stop on.
 *
 * `art` sits at 0.14 — one frame before the first spark streak launches at 0.15, so the held frame is
 * a bare violet field with nothing yet in motion. Kai's artwork has to be decoded before the scene can
 * throw him up through the frame, and on a slow link that is the first thing worth waiting for.
 *
 * `work` sits on the Charge/Ready boundary, the frame where the ring has finished sweeping, the
 * wordmark has finished rising, and the confetti has finished clearing — the one moment in the piece
 * where every one-shot move has landed and only the ambient loops (bob, bloom, motes, all of them CSS
 * and none of them keyed to this clock) are still running. The screen can sit here indefinitely and
 * still look alive, which is precisely what a slow connection needs it to do.
 */
export const GATES: Gate[] = [
  { id: 'art', at: 0.14, maxHoldMs: 1800 },
  { id: 'work', at: CUE.ready, maxHoldMs: 5200 },
];

/**
 * The bail-out. Past this the playhead jumps straight to the handoff wipe, whether or not the boot
 * ever finished — so the very worst case anyone can see is this plus the length of the wipe.
 *
 * This is the one place the splash is allowed to rush itself, and it should be: the composition itself
 * only costs 7.5s, so reaching fourteen means something is genuinely wrong, the app underneath is
 * already rendered and usable, and a loader that can trap someone is worse than one that hands off a
 * screen still filling in its last card.
 */
export const MAX_TOTAL_MS = 14000;

/** How fast the playhead moves through the scene containing `t`, in authored seconds per real second. */
export function speedAt(t: number): number {
  let at = 0;
  for (const phase of PHASES) {
    at += AUTHORED[phase];
    if (t < at) return AUTHORED[phase] / PRODUCTION[phase];
  }
  return AUTHORED.handoff / PRODUCTION.handoff;
}

export interface TimelineState {
  /** Authored seconds. All choreography is keyed to this, never to wall-clock. */
  t: number;
  /** The gate currently holding the playhead, if any. */
  holding: GateId | null;
  /** How long the current hold has lasted, in real milliseconds. */
  heldMs: number;
  /** Real milliseconds since the splash started. */
  elapsedMs: number;
}

export function initialState(startAt = 0): TimelineState {
  return { t: startAt, holding: null, heldMs: 0, elapsedMs: 0 };
}

/**
 * Advances the playhead by one frame.
 *
 * `isOpen` is asked only about the gate immediately ahead, and only when the playhead has actually
 * reached it — so the caller is never obliged to know the timeline's shape. A gate that has been held
 * past its cap, or a splash that has been on screen past {@link MAX_TOTAL_MS}, opens regardless.
 */
export function advance(
  state: TimelineState,
  dtMs: number,
  isOpen: (gate: GateId) => boolean,
): TimelineState {
  const elapsedMs = state.elapsedMs + dtMs;
  const overBudget = elapsedMs >= MAX_TOTAL_MS;

  // Out of budget: stop waiting, stop performing, and go straight to the wipe.
  if (overBudget && state.t < CUE.handoff) {
    return { t: CUE.handoff, holding: null, heldMs: 0, elapsedMs };
  }

  const gate = GATES.find((g) => state.t < g.at + 1e-9 && !isOpen(g.id));
  if (gate && state.t >= gate.at - 1e-9) {
    const heldMs = state.holding === gate.id ? state.heldMs + dtMs : dtMs;
    if (heldMs < gate.maxHoldMs && !overBudget) {
      return { t: gate.at, holding: gate.id, heldMs, elapsedMs };
    }
  }

  // Never step past a gate that is still closed within this same frame, or a long frame (a background
  // tab waking up, a slow first paint) could jump the playhead clean over a hold.
  const blocker = GATES.find((g) => g.at > state.t && !isOpen(g.id) && !overBudget);
  const ceiling = blocker ? blocker.at : AUTHORED_TOTAL;

  const t = Math.min(ceiling, state.t + (dtMs / 1000) * speedAt(state.t));
  return { t, holding: null, heldMs: 0, elapsedMs };
}

export function isFinished(state: TimelineState): boolean {
  return state.t >= AUTHORED_TOTAL - 1e-9;
}

/* ── Easing, verbatim from the composition's engine ─────────────────────────────────────────────── */

export const Easing = {
  linear: (t: number) => t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

interface AnimateOptions {
  from: number;
  to: number;
  start: number;
  end: number;
  ease?: (t: number) => number;
}

export function animate({ from, to, start, end, ease = Easing.linear }: AnimateOptions) {
  return (t: number) => {
    if (t <= start) return from;
    if (t >= end) return to;
    return from + (to - from) * ease((t - start) / (end - start));
  };
}

export function interpolate(input: number[], output: number[], ease = Easing.linear) {
  return (t: number) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        return output[i] + (output[i + 1] - output[i]) * ease(local);
      }
    }
    return output[output.length - 1];
  };
}

/** The three eases the composition uses, and nothing else. */
const rise = (o: Omit<AnimateOptions, 'ease'>) => animate({ ...o, ease: Easing.easeOutQuart });
const enter = (o: Omit<AnimateOptions, 'ease'>) => animate({ ...o, ease: Easing.easeOutCubic });
const pop = (o: Omit<AnimateOptions, 'ease'>) => animate({ ...o, ease: Easing.easeOutElastic });

/* ── The scene, sampled ─────────────────────────────────────────────────────────────────────────── */

export interface Layout {
  /** Authored composition size. */
  W: number;
  H: number;
  /** Kai's resting centre, and his size. */
  baseY: number;
  av: number;
  /** XP ring radius and stroke. */
  ring: number;
  stroke: number;
  markTop: number;
  markSize: number;
  statusTop: number;
  statusSize: number;
  loadTop: number;
  loadW: number;
  /** XP chip geometry: horizontal throw from centre, pill width, label size. */
  chipX: number;
  chipW: number;
  chipFs: number;
  /** Mote field spread. */
  radBase: number;
  radSpan: number;
  radX: number;
  radY: number;
  streakGap: number;
}

/**
 * The composition's two authored formats, unchanged. Which one is used is chosen by viewport aspect,
 * and the whole thing is then scaled to fit — so these numbers stay a fixed drawing rather than
 * becoming a responsive layout with its own rounding to argue with.
 *
 * The design's `tagTop`/`tagSize` slot is named `status` here: it carries the live boot status line
 * rather than a tagline (see SplashScreen.tsx).
 */
export const LAYOUTS: Record<'mobile' | 'desktop', Layout> = {
  mobile: {
    W: 1080, H: 1920, baseY: 700, av: 560, ring: 342, stroke: 16,
    markTop: 1268, markSize: 148, statusTop: 1452, statusSize: 44,
    loadTop: 1650, loadW: 420, chipX: 288, chipW: 180, chipFs: 34,
    radBase: 210, radSpan: 620, radX: 1, radY: 0.92, streakGap: 132,
  },
  desktop: {
    W: 1920, H: 1080, baseY: 404, av: 396, ring: 244, stroke: 13,
    markTop: 700, markSize: 118, statusTop: 852, statusSize: 36,
    loadTop: 946, loadW: 360, chipX: 300, chipW: 156, chipFs: 28,
    radBase: 200, radSpan: 900, radX: 1.6, radY: 0.62, streakGap: 210,
  },
};

export interface ChipCue {
  /** Authored time the chip is thrown. */
  at: number;
  /** Horizontal offset from the composition's centre line, as a multiple of `layout.chipX`. */
  side: -1 | 1;
  /** Extra horizontal nudge in composition pixels, as authored. */
  nudge: number;
  label: string;
}

/**
 * The two XP chips that float up past Kai while the ring charges.
 *
 * Unlike everything in {@link Scene} these are *not* sampled per frame. They are fired as one-shot CSS
 * animations the moment the playhead crosses their cue and then run on their own clock, because the
 * second one is still in the air when the playhead reaches the work gate — sampled against this clock
 * it would hang there, half-risen, for the whole of a slow boot.
 */
export const CHIP_DURATION_MS = 1250;

export const CHIPS: ChipCue[] = [
  { at: CUE.charge + 0.25, side: -1, nudge: 0, label: '+5 XP' },
  { at: CUE.charge + 0.72, side: 1, nudge: -20, label: 'streak 1' },
];

/** How far a chip travels upward from its start, in composition pixels. */
export const CHIP_RISE = 240;

export interface Scene {
  /** Kai's centre, in authored composition pixels. */
  y: number;
  /** Squash/stretch, signed: positive is stretched along the direction of travel. */
  stretch: number;
  scale: number;
  /** Number of motion-blur copies trailing behind him, and how far apart. */
  ghosts: number;
  ghostStep: number;
  blur: number;
  ringIn: number;
  ringFlash: number;
  markY: number;
  markO: number;
  statusY: number;
  statusO: number;
  loadO: number;
  /** Authored fill of each loader segment, 0–1. One per segment, in on-screen order. */
  segs: number[];
  streaks: number[];
  burst: number;
  wipe: number;
}

/**
 * The whole composition at authored time `t`, as plain numbers.
 *
 * Everything that is a *one-shot* lives here and is written to the DOM each frame. Everything that
 * *loops* — Kai's idle bob, the bloom's breathing, the drifting motes — is deliberately absent: those
 * run as CSS animations off their own clock. That split is what makes a gate hold look alive instead
 * of frozen, and it keeps the per-frame JS on a cold boot down to a handful of style writes at the one
 * moment the main thread is busiest.
 */
export function sampleScene(t: number, layout: Layout, lite = false): Scene {
  const { H, baseY } = layout;

  const launch = rise({ from: H + 380, to: baseY - 150, start: CUE.launch + 0.06, end: CUE.launch + 0.6 });
  const settle = pop({ from: baseY - 150, to: baseY, start: CUE.launch + 0.6, end: CUE.settle + 0.75 });
  const posAt = (at: number) => (at < CUE.launch + 0.6 ? launch(at) : settle(at));

  const y = posAt(t);
  // Velocity is sampled against the authored axis, so a gate hold reads as a genuine stop: no
  // velocity, no motion blur, no ghosts. Exactly right — nothing is moving.
  const vel = (y - posAt(t - 0.032)) / 0.032;
  const stretch = clamp(-vel / 9000, -0.14, 0.3);

  return {
    y,
    stretch,
    scale: 1 + pop({ from: 0.12, to: 0, start: CUE.settle, end: CUE.settle + 0.9 })(t),
    ghosts: lite ? 0 : Math.min(6, Math.round(Math.abs(vel) / 900)),
    ghostStep: -vel * 0.019,
    blur: lite ? 0 : Math.min(9, Math.abs(vel) / 1100),
    ringIn: enter({ from: 0, to: 1, start: CUE.settle + 0.25, end: CUE.settle + 0.7 })(t),
    // The design fires this at `Ready - 0.15`, which would leave a half-drawn white flash frozen on
    // the ring for the whole of the work gate. Moved a hair later so it fires on release instead —
    // which is also when it means something: the ring flashes because the boot just finished.
    ringFlash: interpolate(
      [CUE.ready + 0.02, CUE.ready + 0.27, CUE.ready + 0.87],
      [0, 0.85, 0],
      Easing.easeOutQuad,
    )(t),
    markY: rise({ from: 70, to: 0, start: CUE.charge + 0.35, end: CUE.charge + 1.1 })(t),
    markO: enter({ from: 0, to: 1, start: CUE.charge + 0.35, end: CUE.charge + 0.9 })(t),
    statusY: enter({ from: 26, to: 0, start: CUE.charge + 0.55, end: CUE.charge + 1.3 })(t),
    statusO: enter({ from: 0, to: 1, start: CUE.charge + 0.55, end: CUE.charge + 1.1 })(t),
    // The loader is the composition's closing beat, in its authored slot: the row fades up once the
    // ring has finished sweeping, and then the three segments fill one after another, 0.42s apart.
    loadO: enter({ from: 0, to: 1, start: CUE.ready + 0.2, end: CUE.ready + 0.7 })(t),
    segs: [0, 1, 2].map((i) =>
      enter({ from: 0, to: 1, start: CUE.ready + 0.35 + i * 0.42, end: CUE.ready + 0.95 + i * 0.42 })(t),
    ),
    // The design's `fieldO` is not sampled here on purpose. It fades in over authored 0.02–0.9, which
    // straddles the art gate at 0.14 — keyed to this clock it would freeze the screen at 13% lit, a
    // near-black hold. It runs as a CSS fade instead, off its own wall-clock, so the field finishes
    // waking up whether or not the playhead is waiting for Kai to arrive.
    streaks: [0, 1, 2, 3, 4].map((i) =>
      rise({ from: 0, to: 1, start: CUE.spark + 0.15 + i * 0.09, end: CUE.launch + 0.5 + i * 0.09 })(t),
    ),
    burst: lite ? 0 : enter({ from: 0, to: 1, start: CUE.settle + 0.02, end: CUE.settle + 0.85 })(t),
    wipe: enter({ from: 0, to: 1, start: CUE.handoff + 0.05, end: AUTHORED_TOTAL })(t),
  };
}

/**
 * How full the XP ring is: **whichever is slower**, the animation's own sweep or the truth.
 *
 * This one expression is the whole adaptive story. On a warm cache the real work is done before the
 * ring has drawn anything, so the authored sweep paces it and the ring fills at the speed it was
 * choreographed to fill — no snapping to 100%, no rush. On a slow connection the truth is the slower
 * of the two, so the ring fills at the speed the network is actually delivering, stalling exactly
 * where the network stalls. It is never ahead of the work, and never faster than it looks good.
 */
export function ringProgress(t: number, real: number): number {
  const swept = enter({ from: 0, to: 1, start: CUE.charge + 0.05, end: CUE.charge + 1.15 })(t);
  return Math.min(swept, real);
}
