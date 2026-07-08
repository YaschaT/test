import { useSyncExternalStore } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AuthUser {
  id: string;
  email: string | null;
}

export type AuthStatus = 'checking' | 'signed-out' | 'signed-in';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
}

let state: AuthState = { status: isSupabaseConfigured ? 'checking' : 'signed-out', user: null };
const listeners = new Set<() => void>();

function setState(next: AuthState) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

/**
 * Resolves once, at module load — whether the browser already has a Supabase session (e.g. a returning
 * signed-in visitor) — then stays live via onAuthStateChange. Runs exactly once regardless of how many
 * components import this module, since module-level state is shared, matching the progressStore pattern.
 */
if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    const user = data.session?.user;
    setState({ status: user ? 'signed-in' : 'signed-out', user: user ? { id: user.id, email: user.email ?? null } : null });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    setState({ status: user ? 'signed-in' : 'signed-out', user: user ? { id: user.id, email: user.email ?? null } : null });
  });
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getAuthSnapshot(): AuthState {
  return state;
}
