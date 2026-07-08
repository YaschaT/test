import { useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { useAuth } from './authStore';
import { getProgressSnapshot, replaceProgress, subscribeProgress, type ProgressState } from './progressStore';

const TABLE = 'user_progress';
const PUSH_DEBOUNCE_MS = 2000;

async function fetchRemoteProgress(userId: string): Promise<ProgressState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(TABLE).select('progress').eq('user_id', userId).maybeSingle();
  if (error || !data) return null;
  return data.progress as ProgressState;
}

async function pushProgress(userId: string, progress: ProgressState): Promise<void> {
  if (!supabase) return;
  await supabase.from(TABLE).upsert({ user_id: userId, progress, updated_at: new Date().toISOString() });
}

/**
 * Called right after any successful sign-in (including the immediate-session case right after
 * registering). If the account already has cloud progress, pulls it onto this device — the "log in
 * elsewhere, get your progress" half of cross-device sync. If it doesn't yet (a brand-new account, or the
 * first login after confirming a just-created one), seeds the cloud from this device's current progress
 * instead — which is exactly the "migrate my guest progress in" behavior for a fresh sign-up.
 */
export async function syncProgressAfterSignIn(userId: string): Promise<void> {
  const remote = await fetchRemoteProgress(userId);
  if (remote) {
    replaceProgress(remote);
  } else {
    await pushProgress(userId, getProgressSnapshot());
  }
}

/**
 * Mounted once near the app root. While signed in, pushes local progress changes to the cloud (debounced)
 * so the next device that logs in gets the latest — the ongoing half of cross-device sync; sign-up/login
 * handle the one-time seed/pull, this keeps the cloud copy current afterward.
 */
export function useProgressSync(): void {
  const { status, user } = useAuth();
  const userId = user?.id;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== 'signed-in' || !userId) return;

    const unsubscribe = subscribeProgress(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        pushProgress(userId, getProgressSnapshot());
      }, PUSH_DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status, userId]);
}
