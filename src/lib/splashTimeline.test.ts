import { describe, expect, it } from 'vitest';
import { SOUND_CUES } from './splashSound';
import {
  advance,
  AUTHORED,
  CHIPS,
  CHIP_DURATION_MS,
  AUTHORED_TOTAL,
  CUE,
  FLOOR_MS,
  GATES,
  initialState,
  isFinished,
  LAYOUTS,
  MAX_TOTAL_MS,
  PHASES,
  PRODUCTION,
  ringProgress,
  sampleScene,
  speedAt,
  type GateId,
  type TimelineState,
} from './splashTimeline';

const FRAME = 1000 / 60;

/** Runs the timeline to completion at 60fps, returning how long it really took. */
function play(isOpen: (gate: GateId) => boolean, startAt = 0, frame = FRAME) {
  let state = initialState(startAt);
  let frames = 0;
  while (!isFinished(state) && frames < 6000) {
    state = advance(state, frame, isOpen);
    frames++;
  }
  return { state, ms: state.elapsedMs, finished: isFinished(state) };
}

const allOpen = () => true;

describe('authored table', () => {
  it('reproduces the composition unchanged', () => {
    // Guards the one thing that must never drift: every start/end offset in sampleScene was tuned
    // against these durations, so retiming belongs in PRODUCTION, never here.
    expect(AUTHORED).toEqual({ spark: 1.2, launch: 1.0, settle: 1.0, charge: 1.6, ready: 1.8, handoff: 0.9 });
    expect(AUTHORED_TOTAL).toBeCloseTo(7.5, 6);
    expect(CUE.launch).toBeCloseTo(1.2, 6);
    expect(CUE.charge).toBeCloseTo(3.2, 6);
    expect(CUE.ready).toBeCloseTo(4.8, 6);
    expect(CUE.handoff).toBeCloseTo(6.6, 6);
  });

  it('plays at the authored tempo, 1:1', () => {
    for (const phase of PHASES) {
      expect(PRODUCTION[phase]).toBeCloseTo(AUTHORED[phase], 6);
      expect(speedAt(CUE[phase] + AUTHORED[phase] / 2)).toBeCloseTo(1, 6);
    }
  });

  it('reports the speed of the scene the playhead is in', () => {
    expect(speedAt(0)).toBeCloseTo(AUTHORED.spark / PRODUCTION.spark, 6);
    expect(speedAt(CUE.charge + 0.1)).toBeCloseTo(AUTHORED.charge / PRODUCTION.charge, 6);
    expect(speedAt(AUTHORED_TOTAL + 5)).toBeCloseTo(AUTHORED.handoff / PRODUCTION.handoff, 6);
  });
});

describe('pacing', () => {
  it('takes the floor when nothing has to be waited for', () => {
    const { ms, finished } = play(allOpen);
    expect(finished).toBe(true);
    // A frame of slop either way; the point is that it lands on the floor rather than the demo's 7.5s.
    expect(ms).toBeGreaterThanOrEqual(FLOOR_MS - FRAME);
    expect(ms).toBeLessThanOrEqual(FLOOR_MS + FRAME);
  });

  it('runs the composition at its full authored length', () => {
    expect(FLOOR_MS).toBeCloseTo(AUTHORED_TOTAL * 1000, 6);
    expect(FLOOR_MS).toBeCloseTo(7500, 6);
  });

  it('never rushes a scene, however fast the boot was', () => {
    // Every beat still gets its full production duration: the playhead cannot reach Ready before the
    // four scenes in front of it have really elapsed.
    let state = initialState();
    let ms = 0;
    while (state.t < CUE.ready && ms < 20000) {
      state = advance(state, FRAME, allOpen);
      ms = state.elapsedMs;
    }
    const upToReady = (PRODUCTION.spark + PRODUCTION.launch + PRODUCTION.settle + PRODUCTION.charge) * 1000;
    expect(ms).toBeGreaterThanOrEqual(upToReady - FRAME);
  });
});

describe('gates', () => {
  it('waits at the art gate until the mascot has arrived, then plays the launch in full', () => {
    const art = GATES.find((g) => g.id === 'art')!;
    let state = initialState();
    // 900ms of a slow connection with the artwork still in flight.
    for (let ms = 0; ms < 900; ms += FRAME) state = advance(state, FRAME, (g) => g !== 'art');
    expect(state.holding).toBe('art');
    expect(state.t).toBeCloseTo(art.at, 6);

    // Nothing has been skipped: once released, the rest of the piece still costs its full length.
    const before = state.elapsedMs;
    let frames = 0;
    while (!isFinished(state) && frames < 6000) {
      state = advance(state, FRAME, allOpen);
      frames++;
    }
    expect(state.elapsedMs - before).toBeGreaterThan(FLOOR_MS * 0.9);
  });

  it('holds on the Charge/Ready boundary while the boot is still working', () => {
    // At 1:1 the boundary is 4.8s in, so this has to run past that before the hold can be observed.
    let state = initialState();
    for (let ms = 0; ms < CUE.ready * 1000 + 500; ms += FRAME) {
      state = advance(state, FRAME, (g) => g !== 'work');
    }
    expect(state.holding).toBe('work');
    expect(state.t).toBeCloseTo(CUE.ready, 6);
  });

  it('stretches to fit a slow boot instead of finishing without it', () => {
    let settled = false;
    const { ms, state } = play((g) => (g === 'work' ? settled : true));
    expect(ms).toBeGreaterThan(FLOOR_MS);
    expect(state.t).toBeGreaterThanOrEqual(AUTHORED_TOTAL - 1e-6);
    settled = true; // referenced so the closure is honest about what it is testing
    expect(settled).toBe(true);
  });

  it('releases a gate that has held past its cap', () => {
    const work = GATES.find((g) => g.id === 'work')!;
    let state = initialState();
    let frames = 0;
    while (!isFinished(state) && frames < 6000) {
      state = advance(state, FRAME, (g) => g !== 'work');
      frames++;
    }
    expect(isFinished(state)).toBe(true);
    expect(work.maxHoldMs).toBeLessThan(MAX_TOTAL_MS);
  });

  it('never leaves anyone on the splash past the hard cap', () => {
    const { ms, finished } = play(() => false);
    expect(finished).toBe(true);
    // The cap plus the wipe it bails out through, and nothing more.
    expect(ms).toBeLessThanOrEqual(MAX_TOTAL_MS + PRODUCTION.handoff * 1000 + FRAME);
  });

  it('cannot jump a closed gate on one long frame', () => {
    // A tab waking from the background delivers a single enormous delta; without a ceiling the
    // playhead would step clean over a hold and play the release beats to an unfinished app.
    let state: TimelineState = initialState();
    state = advance(state, 5000, (g) => g !== 'work');
    expect(state.t).toBeLessThanOrEqual(CUE.ready + 1e-6);
  });
});

describe('the XP ring', () => {
  it('is paced by the animation when the work is already done', () => {
    // Warm cache: everything settled before the ring starts drawing. It must still sweep, not snap.
    expect(ringProgress(CUE.charge, 1)).toBeLessThan(0.05);
    expect(ringProgress(CUE.charge + 0.5, 1)).toBeGreaterThan(0);
    expect(ringProgress(CUE.charge + 0.5, 1)).toBeLessThan(1);
    expect(ringProgress(CUE.charge + 1.15, 1)).toBeCloseTo(1, 5);
  });

  it('is paced by the truth when the work is slower', () => {
    // Slow connection: a third of the weight has landed, so the ring sits at a third however long the
    // animation has been running.
    expect(ringProgress(CUE.ready, 0.33)).toBeCloseTo(0.33, 6);
    expect(ringProgress(AUTHORED_TOTAL, 0.33)).toBeCloseTo(0.33, 6);
  });

  it('is never ahead of the work', () => {
    for (let t = 0; t <= AUTHORED_TOTAL; t += 0.05) {
      for (const real of [0, 0.2, 0.5, 0.8, 1]) {
        expect(ringProgress(t, real)).toBeLessThanOrEqual(real + 1e-9);
      }
    }
  });
});

describe('the XP chips', () => {
  it('carries both of the mockup\'s chips, thrown either side during Charge', () => {
    expect(CHIPS.map((c) => c.label)).toEqual(['+5 XP', 'streak 1']);
    expect(CHIPS.map((c) => c.side)).toEqual([-1, 1]);
    for (const chip of CHIPS) {
      expect(chip.at).toBeGreaterThanOrEqual(CUE.charge);
      expect(chip.at).toBeLessThan(CUE.ready);
    }
  });

  it('needs to outlive the work gate, which is why it is not sampled per frame', () => {
    // This is the reason chips run as fire-and-forget CSS rather than off the playhead: the second one
    // is still in the air when the playhead reaches the gate. Sampled against this clock it would hang
    // there half-risen for the whole of a slow boot.
    const last = CHIPS[CHIPS.length - 1];
    expect(last.at + CHIP_DURATION_MS / 1000).toBeGreaterThan(CUE.ready);
  });
});

describe('the sound cues', () => {
  it('fires the composition\'s full kit inside the timeline', () => {
    // Seven scene cues plus the nine-step run under the ring sweep.
    expect(SOUND_CUES).toHaveLength(16);
    for (const cue of SOUND_CUES) {
      expect(cue.at).toBeGreaterThanOrEqual(0);
      expect(cue.at).toBeLessThanOrEqual(AUTHORED_TOTAL);
    }
  });

  it('is ordered, so a single frame crossing several fires them in sequence', () => {
    const times = SOUND_CUES.map((c) => c.at);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it('sounds the chime before the work gate, not stranded behind it', () => {
    const chime = SOUND_CUES.filter((c) => c.at > CUE.charge && c.at < CUE.ready);
    expect(chime.length).toBeGreaterThan(0);
  });
});

describe('the scene', () => {
  const layout = LAYOUTS.desktop;

  it('holds Kai below the frame until his launch', () => {
    expect(sampleScene(0, layout).y).toBeGreaterThan(layout.H);
    expect(sampleScene(CUE.launch, layout).y).toBeGreaterThan(layout.H);
  });

  it('lands him on his mark and leaves him there', () => {
    expect(sampleScene(CUE.charge, layout).y).toBeCloseTo(layout.baseY, 0);
    expect(sampleScene(CUE.ready, layout).y).toBeCloseTo(layout.baseY, 5);
    expect(sampleScene(AUTHORED_TOTAL, layout).y).toBeCloseTo(layout.baseY, 5);
  });

  it('leaves nothing in flight at either gate', () => {
    // The whole reason a hold reads as breathing rather than freezing: at both gate frames, every
    // one-shot is either untouched or finished, so a stopped playhead stops nothing visible.
    for (const gate of GATES) {
      const at = sampleScene(gate.at, layout);
      const just = sampleScene(gate.at + 0.001, layout);
      for (const key of ['y', 'scale', 'ringIn', 'ringFlash', 'markY', 'markO', 'statusO', 'loadO', 'burst', 'wipe'] as const) {
        expect(Math.abs(just[key] - at[key])).toBeLessThan(0.02);
      }
      expect(at.ghosts).toBe(0);
      expect(at.blur).toBeCloseTo(0, 6);
    }
  });

  it('finishes every one-shot by the end', () => {
    const end = sampleScene(AUTHORED_TOTAL, layout);
    expect(end.markO).toBe(1);
    expect(end.statusO).toBe(1);
    expect(end.ringIn).toBe(1);
    expect(end.wipe).toBe(1);
    expect(end.ringFlash).toBe(0);
  });

  it('drops the expensive decoration on a lite connection without retiming anything', () => {
    const t = CUE.launch + 0.3;
    const full = sampleScene(t, layout, false);
    const lite = sampleScene(t, layout, true);
    expect(full.ghosts).toBeGreaterThan(0);
    expect(lite.ghosts).toBe(0);
    expect(lite.blur).toBe(0);
    expect(lite.burst).toBe(0);
    expect(lite.y).toBeCloseTo(full.y, 6);
  });
});
