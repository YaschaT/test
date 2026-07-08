import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export class AuthNotConfiguredError extends Error {
  constructor() {
    super('Accounts aren’t set up yet — ask the developer to finish connecting the account service.');
    this.name = 'AuthNotConfiguredError';
  }
}

function requireSupabase() {
  if (!supabase) throw new AuthNotConfiguredError();
  return supabase;
}

export interface RegisterResult {
  user: User | null;
  /** False when the project requires email confirmation — Supabase still returns a `user` in that case, so callers must check this, not just `user`, to know whether the visitor is actually signed in yet. */
  hasSession: boolean;
}

export async function registerWithEmail(email: string, password: string): Promise<RegisterResult> {
  const { data, error } = await requireSupabase().auth.signUp({ email, password });
  if (error) throw error;
  return { user: data.user, hasSession: Boolean(data.session) };
}

export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export { isSupabaseConfigured };
