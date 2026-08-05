import { useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useAuth } from './authStore';
import { mergeProgress } from './progressMerge';
import { readStorage, writeStorage } from './storage';
import {
  getProgressSnapshot,
  replaceProgress,
  resetAllProgress,
  subscribeProgress,
  type ProgressState,
} from './progressStore';

const TABLE = 'user_progress';
const PUSH_DEBOUNCE_MS = 2000;
/** Don't re-pull more often than this when the tab regains focus. */
const REFRESH_THROTTLE_MS = 30_000;
/** Which account the progress currently in localStorage belongs to (null = guest / never synced). */
const OWNER_KEY = 'progress-owner';

function getProgressOwner(): string | null {
  return readStorage<string | null>(OWNER_KEY, null);
}

function setProgressOwner(userId: string): void {
  writeStorage(OWNER_KEY, userId);
}

/**
 * `missing` means the account genuinely has no saved row yet; `error` means we couldn't tell (offline,
 * RLS, transient failure). The distinction matters: treating an error as "no data" would seed the cloud
 * from this device and wipe whatever was really stored there.
 */
type RemoteResult =
  | { kind: 'found'; progress: ProgressState }
  | { kind: 'missing' }
  | { kind: 'error' };

async function fetchRemoteProgress(userId: string): Promise<RemoteResult> {
  if (!supabase) return { kind: 'error' };
  try {
    const { data, error } = await supabase.from(TABLE).select('progress').eq('user_id', userId).maybeSingle();
    if (error) return { kind: 'error' };
    if (!data?.progress) return { kind: 'missing' };
    return { kind: 'found', progress: data.progress as ProgressState };
  } catch {
    return { kind: 'error' };
  }
}

async function pushProgress(userId: string, progress: ProgressState): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(TABLE).upsert({ user_id: userId, progress, updated_at: new Date().toISOString() });
  } catch {
    // A failed push is not fatal — the next local change (or the next sign-in merge) retries.
  }
}

/**
 * Pulls the account's cloud progress and **merges** it into this device's progress, then writes the
 * merged result back so both sides converge.
 *
 * Previously this replaced local progress with the remote copy outright, and only ran when someone
 * actually submitted the login form. Two devices therefore drifted apart and could overwrite each
 * other. Merging (see progressMerge.ts) is non-destructive and idempotent, so it's safe to run on
 * every sign-in, every session restore, and every refresh.
 */
export async function syncProgressAfterSignIn(userId: string): Promise<void> {
  const remote = await fetchRemoteProgress(userId);
  if (remote.kind === 'error') return; // never clobber the cloud on a failed read

  // Merging is only correct when the local copy belongs to this account (or to a guest who is signing
  // in and should bring their progress with them). If someone else was signed in on this device, their
  // progress must NOT bleed into this account.
  const owner = getProgressOwner();
  const localBelongsToSomeoneElse = owner !== null && owner !== userId;

  if (remote.kind === 'missing') {
    if (localBelongsToSomeoneElse) resetAllProgress();
    await pushProgress(userId, getProgressSnapshot());
    setProgressOwner(userId);
    return;
  }

  const next = localBelongsToSomeoneElse
    ? remote.progress
    : mergeProgress(getProgressSnapshot(), remote.progress);

  replaceProgress(next);
  setProgressOwner(userId);
  await pushProgress(userId, next);
}

/**
 * Mounted once near the app root. Owns the whole sync lifecycle while signed in:
 *
 * 1. **Pull + merge on mount** — this is the fix for the cross-device bug. It runs whenever the app
 *    sees a signed-in user, including a *restored* session, which the old code never did: it only
 *    synced from the login form, so simply reopening an already-signed-in device showed stale local
 *    data and then pushed it over the newer cloud copy.
 * 2. **Push local changes (debounced)** — but only once the merge above has finished, so a stale
 *    device can't overwrite the cloud during the window before it has caught up.
 * 3. **Re-merge when the tab regains focus** (throttled), so a device left open picks up work done
 *    on another one.
 */
export function useProgressSync(): void {
  const { status, user } = useAuth();
  const userId = user?.id;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== 'signed-in' || !userId) return;

    let cancelled = false;
    let hydrated = false;
    let lastRefresh = Date.now();

    // 1. Catch up with the cloud before this device is allowed to push anything.
    syncProgressAfterSignIn(userId).finally(() => {
      if (!cancelled) hydrated = true;
    });

    // 2. Keep the cloud current afterwards.
    const unsubscribe = subscribeProgress(() => {
      if (!hydrated) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => pushProgress(userId, getProgressSnapshot()), PUSH_DEBOUNCE_MS);
    });

    // 3. Pick up other devices' work when returning to this tab.
    function refreshOnFocus() {
      if (cancelled || !hydrated || document.visibilityState === 'hidden') return;
      if (Date.now() - lastRefresh < REFRESH_THROTTLE_MS) return;
      lastRefresh = Date.now();
      void syncProgressAfterSignIn(userId!);
    }

    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status, userId]);
}
