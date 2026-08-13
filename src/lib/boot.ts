import { getAuthSnapshot, subscribeAuth } from './authStore';
import { whenFirstSyncSettled } from './progressSync';

/**
 * What "loading" actually consists of when the app cold-starts, so the splash screen can report real
 * progress instead of counting to a hundred on a timer.
 *
 * Each step is a promise over work the app genuinely has to finish before the first screen is honest:
 * the route's code chunk, the webfonts, the splash's own artwork, the Supabase session check, and the
 * first cloud merge. The percentage is the share of the weight that has actually settled — which is
 * why it stalls where the work stalls (a slow sync parks it at ~80%) rather than gliding at a constant
 * rate to a number that means nothing.
 *
 * Steps are grouped into three *fronts* because they progress independently: the app itself, the
 * screen you asked for, and your data. The splash draws one segment per front, so a slow connection
 * doesn't just take longer — it visibly shows you which of the three is the one holding things up.
 */

export type BootStepId = 'shell' | 'fonts' | 'art' | 'screen' | 'account' | 'progress';

/** The three independent things a cold start is waiting on. Order is the on-screen order. */
export type BootFrontId = 'app' | 'screen' | 'data';

export const BOOT_FRONTS: BootFrontId[] = ['app', 'screen', 'data'];

export interface BootStep {
  id: BootStepId;
  front: BootFrontId;
  /** Relative share of the bar. Weights are arbitrary units; only their ratio matters. */
  weight: number;
  /** Shown while this step is the furthest-along one still outstanding. */
  status: string;
  settled: () => Promise<void>;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const screenReady = deferred();

/**
 * Called from inside the app's route Suspense boundary, so it fires when the route's lazily-loaded
 * chunk has both downloaded and rendered. Module-level, so it doesn't matter whether the chunk lands
 * before or after the loader mounts.
 */
export function markScreenReady(): void {
  screenReady.resolve();
}

function whenFontsReady(): Promise<void> {
  // Missing in older Safari; there, fonts simply aren't a step we can wait on.
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve();
  return document.fonts.ready.then(() => undefined);
}

/**
 * Kai's avatar — the face mark, cut from `navigation-image.png` (the artwork the composition's own
 * `avatar.png` is, which the design transport cannot deliver: its 256 KiB cap is spent on a C2PA block
 * and the stream ends with zero image rows). Keyed on chroma rather than circle-masked, so the crest
 * above the disc survives, then padded square so the splash can scale and rotate it about its centre.
 *
 * Replacing this with the design's own export is a drop-in: same path, square canvas, transparent
 * outside the mark.
 */
export const SPLASH_MASCOT_SRC = '/assets/brand/splash-mascot.webp';

let artPromise: Promise<void> | null = null;

/**
 * The splash launches Kai up through the frame in its second beat, so it has to know he has actually
 * arrived — otherwise a slow connection gets a rocket with nothing in it. `decode()` rather than
 * `onload` because a decoded-but-not-yet-rasterised image still costs a frame at exactly the moment
 * the animation starts moving.
 *
 * A failure resolves like a success: a missing mascot is a splash with a hole in it, not a splash that
 * never leaves.
 */
export function whenSplashArtReady(): Promise<void> {
  if (artPromise) return artPromise;
  if (typeof Image === 'undefined') {
    artPromise = Promise.resolve();
    return artPromise;
  }
  artPromise = new Promise<void>((resolve) => {
    const img = new Image();
    img.src = SPLASH_MASCOT_SRC;
    const done = () => resolve();
    if (typeof img.decode === 'function') {
      img.decode().then(done, done);
    } else {
      img.onload = done;
      img.onerror = done;
    }
  });
  return artPromise;
}

function whenAccountReady(): Promise<void> {
  if (getAuthSnapshot().status !== 'checking') return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = subscribeAuth(() => {
      if (getAuthSnapshot().status === 'checking') return;
      unsubscribe();
      resolve();
    });
  });
}

async function whenProgressReady(): Promise<void> {
  await whenAccountReady();
  // A guest has no cloud copy to reconcile with, so this step is already done for them.
  if (getAuthSnapshot().status !== 'signed-in') return;
  await whenFirstSyncSettled();
}

export const BOOT_STEPS: BootStep[] = [
  // The app's own JavaScript is parsed and running by the time anything reads this — the one part of
  // the bar that is honestly complete the moment it appears.
  { id: 'shell', front: 'app', weight: 1, status: 'Booting', settled: () => Promise.resolve() },
  { id: 'fonts', front: 'app', weight: 2, status: 'Booting', settled: whenFontsReady },
  { id: 'art', front: 'app', weight: 1, status: 'Booting', settled: whenSplashArtReady },
  { id: 'screen', front: 'screen', weight: 3, status: 'Loading your world', settled: () => screenReady.promise },
  { id: 'account', front: 'data', weight: 2, status: 'Syncing progress', settled: whenAccountReady },
  { id: 'progress', front: 'data', weight: 2, status: 'Syncing progress', settled: whenProgressReady },
];

export const BOOT_TOTAL_WEIGHT = BOOT_STEPS.reduce((sum, step) => sum + step.weight, 0);

const FRONT_WEIGHT: Record<BootFrontId, number> = {
  app: BOOT_STEPS.filter((s) => s.front === 'app').reduce((sum, s) => sum + s.weight, 0),
  screen: BOOT_STEPS.filter((s) => s.front === 'screen').reduce((sum, s) => sum + s.weight, 0),
  data: BOOT_STEPS.filter((s) => s.front === 'data').reduce((sum, s) => sum + s.weight, 0),
};

/** Shown once every step has settled and the bar is still catching up to it. */
export const BOOT_FINAL_STATUS = 'Almost there';

export interface BootSnapshot {
  /** Share of the total weight that has settled, 0–1. */
  overall: number;
  /** Per-front share, 0–1 each. */
  fronts: Record<BootFrontId, number>;
  /** The furthest-along step still outstanding — what the app is waiting on right now. */
  status: string;
  settled: boolean;
}

/**
 * Watches every boot step and reports the picture after each one lands.
 *
 * A step that *rejects* still counts as settled — the app carries on without it (an offline sync, a
 * font that never arrives), so the bar must too, or a failed step would hold the splash open until its
 * cap and then jump.
 */
export function observeBoot(onChange: (snapshot: BootSnapshot) => void): () => void {
  const done = new Set<BootStepId>();
  let cancelled = false;

  function publish() {
    if (cancelled) return;
    const settledWeight = (predicate: (step: BootStep) => boolean) =>
      BOOT_STEPS.filter((s) => predicate(s) && done.has(s.id)).reduce((sum, s) => sum + s.weight, 0);

    const pending = BOOT_STEPS.find((s) => !done.has(s.id));
    onChange({
      overall: settledWeight(() => true) / BOOT_TOTAL_WEIGHT,
      fronts: {
        app: settledWeight((s) => s.front === 'app') / FRONT_WEIGHT.app,
        screen: settledWeight((s) => s.front === 'screen') / FRONT_WEIGHT.screen,
        data: settledWeight((s) => s.front === 'data') / FRONT_WEIGHT.data,
      },
      status: pending ? pending.status : BOOT_FINAL_STATUS,
      settled: !pending,
    });
  }

  for (const step of BOOT_STEPS) {
    const land = () => {
      done.add(step.id);
      publish();
    };
    step.settled().then(land, land);
  }
  publish();

  return () => {
    cancelled = true;
  };
}

/**
 * How much animation this visitor's connection can afford.
 *
 * `lite` drops the expensive decoration (motion-blur ghosts, the confetti burst, most of the mote
 * field) but never shortens the choreography — the beats still play at their authored length. The
 * reasoning is that a Save-Data or 2G session is usually also a modest device, and the splash covering
 * a slow boot is the last thing that should be competing with it for the main thread.
 *
 * `navigator.connection` is Chromium-only; everywhere else this returns `normal` and the real
 * adaptation comes from the boot steps themselves, which every browser reports honestly.
 */
export type ConnectionGrade = 'normal' | 'lite';

interface NetworkInformationish {
  saveData?: boolean;
  effectiveType?: string;
}

export function getConnectionGrade(): ConnectionGrade {
  if (typeof navigator === 'undefined') return 'normal';
  const connection = (navigator as Navigator & { connection?: NetworkInformationish }).connection;
  if (!connection) return 'normal';
  if (connection.saveData) return 'lite';
  if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') return 'lite';
  return 'normal';
}

/**
 * The routes the splash screen belongs to: the app shell behind the sidebar.
 *
 * The marketing homepage and the auth screens are their own worlds with their own paper-coloured
 * canvas — dropping a dark splash over them would be a second brand appearing for a second and
 * a half. They also have nothing to boot: no sync, no learning data, no heavy chunk.
 */
const APP_PATHS = [
  '/dashboard',
  '/path',
  '/grammar',
  '/vocabulary',
  '/kanji',
  '/reading',
  '/listening',
  '/speaking',
  '/mock',
];

export function isAppRoute(pathname: string): boolean {
  return APP_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
