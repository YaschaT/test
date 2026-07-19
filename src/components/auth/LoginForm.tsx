import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthSubmitButton } from './AuthSubmitButton';
import { FormField } from './FormField';
import { GoogleSignInButton } from './GoogleSignInButton';
import { signInWithEmail, sendPasswordReset, isSupabaseConfigured } from '../../lib/auth';
import { validateEmail, validatePassword, friendlyAuthError } from '../../lib/authValidation';
import { syncProgressAfterSignIn } from '../../lib/progressSync';

type Field = 'email' | 'password';

interface LoginFormProps {
  /** Called only once real sign-in succeeds — AuthShell owns what happens next (the route change), not this form. */
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
    <form onSubmit={handleSubmit} noValidate>
      {!isSupabaseConfigured && (
        <p role="status" className="au-notice au-notice--info">
          Accounts are almost ready — check back soon.
        </p>
      )}
      {serverError && (
        <p role="alert" className="au-notice">
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
      <FormField
        id="login-password"
        label="Password"
        revealable
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        onBlur={() => markTouched('password')}
        error={errors.password}
      />
      <div className="au-reset-row">
        {resetState === 'sent' ? (
          <span role="status" className="au-reset-sent">
            Check your email for a reset link.
          </span>
        ) : (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetState === 'sending' || !isSupabaseConfigured}
            className="au-link-sm"
          >
            {resetState === 'sending' ? 'Sending…' : 'Forgot password?'}
          </button>
        )}
      </div>
      <AuthSubmitButton type="submit" disabled={submitting || !isSupabaseConfigured}>
        {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : 'Log in'}
      </AuthSubmitButton>
      <GoogleSignInButton disabled={!isSupabaseConfigured} onError={setServerError} />
    </form>
  );
}
