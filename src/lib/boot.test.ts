import { describe, it, expect, vi } from 'vitest';

vi.mock('./supabase', () => ({
  isSupabaseConfigured: false,
  supabase: {
    // authStore resolves a session at module load; these keep that import side-effect inert.
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
  },
}));

const { BOOT_STEPS, getSplashRun, isSplashRequested, markScreenReady, requestSplash, subscribeSplashRun } =
  await import('./boot');

const screenStep = BOOT_STEPS.find((step) => step.id === 'screen')!;

/** Whether `promise` has already settled — false if it is still outstanding a turn later. */
async function isSettled(promise: Promise<unknown>): Promise<boolean> {
  let settled = false;
  void promise.then(() => {
    settled = true;
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  return settled;
}

describe('the splash run', () => {
  it('starts at 0 — a cold load, which the splash decides from the URL rather than from a request', () => {
    expect(getSplashRun()).toBe(0);
    expect(isSplashRequested()).toBe(false);
  });

  it('bumps and notifies on a handoff into the app, so the splash remounts on a fresh run', () => {
    const seen: number[] = [];
    const unsubscribe = subscribeSplashRun(() => seen.push(getSplashRun()));

    requestSplash();
    requestSplash();
    unsubscribe();
    requestSplash();

    expect(seen).toEqual([1, 2]);
    expect(getSplashRun()).toBe(3);
    expect(isSplashRequested()).toBe(true);
  });
});

describe('the screen boot step', () => {
  it('re-arms on a requested splash, so the second run waits for the dashboard chunk too', async () => {
    // The cold-load run: outstanding until the route's chunk has rendered.
    expect(await isSettled(screenStep.settled())).toBe(false);
    markScreenReady();
    expect(await isSettled(screenStep.settled())).toBe(true);

    // The handoff out of the auth screens is a real second boot: the dashboard has never been loaded
    // in this tab, so the step is outstanding again until it mounts.
    requestSplash();
    expect(await isSettled(screenStep.settled())).toBe(false);
    markScreenReady();
    expect(await isSettled(screenStep.settled())).toBe(true);
  });
});
