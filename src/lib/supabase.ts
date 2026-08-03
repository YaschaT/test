import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Public project config. These are safe to ship in the browser bundle: the URL is public and the
// key is Supabase's *publishable* (anon) key, which is designed to be exposed client-side and is
// gated by row-level security — it ends up in the deployed JS either way. We keep them as the
// fallback so the production build works even when the host (Vercel) has no VITE_SUPABASE_* env
// vars set; a real `.env` still overrides them for local dev / other environments.
const FALLBACK_SUPABASE_URL = 'https://rrbebdowcgrlryraxkad.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_BFOvpHkwmbXLEy6nYF4Nmw_KvHNtgLQ';

const url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

/** True only when real project keys are present — gates every account feature honestly instead of failing silently. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url, anonKey) : null;
