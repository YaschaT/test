import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ProgressState } from './progressStore';

/** In-memory stand-in for the `user_progress` row, driven per test. */
const remote: { row: { progress: ProgressState } | null; error: unknown } = { row: null, error: null };
const upserts: { user_id: string; progress: ProgressState }[] = [];

vi.mock('./supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    // authStore resolves a session at module load; these keep that import side-effect inert.
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: remote.row, error: remote.error }),
        }),
      }),
      upsert: async (row: { user_id: string; progress: ProgressState }) => {
        upserts.push(row);
        return { error: null };
      },
    }),
  },
}));

const { syncProgressAfterSignIn } = await import('./progressSync');
const { getProgressSnapshot, replaceProgress, resetAllProgress } = await import('./progressStore');

function localStorageStub() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  };
}

function withProgress(over: Partial<ProgressState>): ProgressState {
  return { ...getProgressSnapshot(), ...over };
}

describe('syncProgressAfterSignIn', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { localStorage: localStorageStub() });
    remote.row = null;
    remote.error = null;
    upserts.length = 0;
    resetAllProgress();
  });

  it('MERGES cloud progress into this device instead of replacing it (the cross-device bug)', async () => {
    // This device (e.g. the desktop) has its own work…
    replaceProgress(withProgress({ completedGrammarIds: ['desu'], learnedKanjiIds: ['k-hi'] }));
    // …and the account's cloud copy has work done on another device (the iPad).
    remote.row = { progress: withProgress({ completedGrammarIds: ['masu-masen'], learnedKanjiIds: [] }) };

    await syncProgressAfterSignIn('user-1');

    const after = getProgressSnapshot();
    expect(after.completedGrammarIds.sort()).toEqual(['desu', 'masu-masen']);
    expect(after.learnedKanjiIds).toEqual(['k-hi']);
    // The merged result is written back so the other device converges too.
    expect(upserts.at(-1)?.progress.completedGrammarIds.sort()).toEqual(['desu', 'masu-masen']);
  });

  it('does NOT overwrite the cloud when the read fails (offline / transient error)', async () => {
    replaceProgress(withProgress({ completedGrammarIds: ['only-local'] }));
    remote.error = { message: 'network down' };

    await syncProgressAfterSignIn('user-1');

    expect(upserts).toHaveLength(0);
    expect(getProgressSnapshot().completedGrammarIds).toEqual(['only-local']);
  });

  it('seeds the cloud from this device when the account has no saved progress yet', async () => {
    replaceProgress(withProgress({ completedGrammarIds: ['guest-work'] }));
    remote.row = null;

    await syncProgressAfterSignIn('user-1');

    expect(upserts).toHaveLength(1);
    expect(upserts[0].progress.completedGrammarIds).toEqual(['guest-work']);
  });

  it('does NOT bleed a previous account’s progress into a different account on the same device', async () => {
    // User A signs in and their progress becomes the local copy.
    remote.row = { progress: withProgress({ completedGrammarIds: ['a-only'] }) };
    await syncProgressAfterSignIn('user-a');
    expect(getProgressSnapshot().completedGrammarIds).toEqual(['a-only']);

    // User B now signs in on the same device — they must get only their own progress.
    remote.row = { progress: withProgress({ completedGrammarIds: ['b-only'] }) };
    await syncProgressAfterSignIn('user-b');

    expect(getProgressSnapshot().completedGrammarIds).toEqual(['b-only']);
    expect(upserts.at(-1)?.progress.completedGrammarIds).toEqual(['b-only']);
  });

  it('starts a different account clean rather than inheriting the previous user’s local data', async () => {
    remote.row = { progress: withProgress({ completedGrammarIds: ['a-only'] }) };
    await syncProgressAfterSignIn('user-a');

    // Brand-new account with nothing stored yet.
    remote.row = null;
    await syncProgressAfterSignIn('user-b');

    expect(getProgressSnapshot().completedGrammarIds).toEqual([]);
    expect(upserts.at(-1)?.progress.completedGrammarIds).toEqual([]);
  });
});
