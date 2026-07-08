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

export async function registerWithEmail(email: string, password: string): Promise<User | null> {
  const { data, error } = await requireSupabase().auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
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
