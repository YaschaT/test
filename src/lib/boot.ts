import { getAuthSnapshot, subscribeAuth } from './authStore';
import { whenFirstSyncSettled } from './progressSync';

/**
 * What "loading" actually consists of when the app cold-starts, so the boot screen can report real
 * progress instead of counting to a hundred on a timer.
 *
 * Each step is a promise over work the app genuinely has to finish before the first screen is honest:
 * the route's code chunk, the webfonts, the Supabase session check, and the first cloud merge. The
 * percentage is the share of the weight that has actually settled — which is why it stalls where the
 * work stalls (a slow sync parks it at ~80%) rather than gliding at a constant rate to a number that
 * means nothing.
 */

export type BootStepId = 'shell' | 'fonts' | 'screen' | 'account' | 'progress';

export interface BootStep {
  id: BootStepId;
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
  { id: 'shell', weight: 1, status: 'Booting', settled: () => Promise.resolve() },
  { id: 'fonts', weight: 2, status: 'Booting', settled: whenFontsReady },
  { id: 'screen', weight: 3, status: 'Loading your world', settled: () => screenReady.promise },
  { id: 'account', weight: 2, status: 'Syncing progress', settled: whenAccountReady },
  { id: 'progress', weight: 2, status: 'Syncing progress', settled: whenProgressReady },
];

export const BOOT_TOTAL_WEIGHT = BOOT_STEPS.reduce((sum, step) => sum + step.weight, 0);

/** Shown once every step has settled and the bar is still catching up to it. */
export const BOOT_FINAL_STATUS = 'Almost there';

/**
 * The routes the boot screen belongs to: the app shell behind the sidebar.
 *
 * The marketing homepage and the auth screens are their own worlds with their own paper-coloured
 * canvas — dropping a dark boot screen over them would be a second brand appearing for a second and
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
