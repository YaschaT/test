import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthSubmitButton } from './AuthSubmitButton';
import { FormField } from './FormField';
import { GoogleButton } from './GoogleButton';
import { signInWithEmail, sendPasswordReset, isSupabaseConfigured } from '../../lib/auth';
import { validateEmail, validatePassword, friendlyAuthError } from '../../lib/authValidation';
import { syncProgressAfterSignIn } from '../../lib/progressSync';

type Field = 'email' | 'password';

interface LoginFormProps {
  /** Called only once real sign-in succeeds — AuthShell owns what happens next (the gate exit transition, then the route change), not this form. */
  onAuthenticated: () => void;
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<Field, boolean>>({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetState, setResetState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const errors: Record<Field, string | undefined> = {
    email: touched.email ? validateEmail(email) : undefined,
    password: touched.password ? validatePassword(password) : undefined,
  };

  function markTouched(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setServerError(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) return;

    setSubmitting(true);
    try {
      const user = await signInWithEmail(email, password);
      if (user) await syncProgressAfterSignIn(user.id);
      onAuthenticated();
    } catch (err) {
      setServerError(friendlyAuthError(err));
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    const emailError = validateEmail(email);
    if (emailError) {
      markTouched('email');
      return;
    }
    setResetState('sending');
    setServerError(null);
    try {
      await sendPasswordReset(email);
      setResetState('sent');
    } catch (err) {
      setServerError(friendlyAuthError(err));
      setResetState('idle');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {!isSupabaseConfigured && (
        <p role="status" className="text-xs font-medium text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-md px-3 py-2">
          Accounts are almost ready — check back soon.
        </p>
      )}
      {serverError && (
        <p role="alert" className="text-sm font-medium text-red-300 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}
      <FormField
        id="login-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        onBlur={() => markTouched('email')}
        error={errors.email}
      />
      <div className="space-y-1.5">
        <FormField
          id="login-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          onBlur={() => markTouched('password')}
          error={errors.password}
        />
        <div className="flex justify-end">
          {resetState === 'sent' ? (
            <span className="text-xs font-medium text-emerald-400">Check your email for a reset link.</span>
          ) : (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetState === 'sending' || !isSupabaseConfigured}
              className="text-xs font-medium text-[#ff8a5c] hover:text-[#ffab85] hover:underline disabled:opacity-50"
            >
              {resetState === 'sending' ? 'Sending…' : 'Forgot password?'}
            </button>
          )}
        </div>
      </div>
      <AuthSubmitButton type="submit" disabled={submitting || !isSupabaseConfigured}>
        {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : 'Log in'}
      </AuthSubmitButton>
      <div className="relative py-1 text-center">
        <span className="relative bg-[#0e0e14] px-2 text-xs text-white/35">or</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-white/10" aria-hidden="true" />
      </div>
      <GoogleButton />
    </form>
  );
}
