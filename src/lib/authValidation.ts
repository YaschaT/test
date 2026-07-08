import { AuthNotConfiguredError } from './auth';

export function validateEmail(email: string): string | undefined {
  if (!email) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Enter a password.';
  if (password.length < 8) return 'Use at least 8 characters.';
  return undefined;
}

export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Confirm your password.';
  if (confirm !== password) return 'Passwords don’t match.';
  return undefined;
}

const KNOWN_MESSAGES: Record<string, string> = {
  'invalid login credentials': 'That email or password isn’t right.',
  'user already registered': 'An account with this email already exists — try logging in instead.',
  'email not confirmed': 'Confirm your email first — check your inbox for the link we sent.',
};

/** Maps raw Supabase/network errors to plain-language copy, per clarify.md's error voice guidance. */
export function friendlyAuthError(error: unknown): string {
  if (error instanceof AuthNotConfiguredError) return error.message;
  if (error instanceof Error) {
    const known = KNOWN_MESSAGES[error.message.toLowerCase()];
    if (known) return known;
    if (error.message) return error.message;
  }
  return 'Something went wrong. Try again in a moment.';
}
