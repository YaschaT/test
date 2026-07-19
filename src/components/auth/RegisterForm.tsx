import { useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { AuthSubmitButton } from './AuthSubmitButton';
import { FormField } from './FormField';
import { GoogleSignInButton } from './GoogleSignInButton';
import { registerWithEmail, isSupabaseConfigured } from '../../lib/auth';
import { validateEmail, validatePassword, validateConfirmPassword, friendlyAuthError } from '../../lib/authValidation';
import { syncProgressAfterSignIn } from '../../lib/progressSync';

type Field = 'email' | 'password' | 'confirmPassword';

interface RegisterFormProps {
  /** Called only when registration grants an immediate session (no email confirmation pending) — AuthShell owns the route change from there. */
  onAuthenticated: () => void;
}

export function RegisterForm({ onAuthenticated }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState<Record<Field, boolean>>({ email: false, password: false, confirmPassword: false });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const errors: Record<Field, string | undefined> = {
    email: touched.email ? validateEmail(email) : undefined,
    password: touched.password ? validatePassword(password) : undefined,
    confirmPassword: touched.confirmPassword ? validateConfirmPassword(password, confirmPassword) : undefined,
  };

  function markTouched(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true, confirmPassword: true });
    setServerError(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (emailError || passwordError || confirmError) return;

    setSubmitting(true);
    try {
      const { user, hasSession } = await registerWithEmail(email, password);
      if (hasSession && user) {
        await syncProgressAfterSignIn(user.id);
        onAuthenticated();
      } else {
        setAwaitingConfirmation(true);
        setSubmitting(false);
      }
    } catch (err) {
      setServerError(friendlyAuthError(err));
      setSubmitting(false);
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="au-confirm">
        <span className="au-confirm-badge">
          <MailCheck size={20} aria-hidden="true" />
        </span>
        <h2>Check your email</h2>
        <p>
          We sent a confirmation link to <strong>{email}</strong>. Confirm it, then log in to pick up right where you
          left off.
        </p>
      </div>
    );
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
        id="register-email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        onBlur={() => markTouched('email')}
        error={errors.email}
      />
      <FormField
        id="register-password"
        label="Password"
        hint="At least 8 characters."
        revealable
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        onBlur={() => markTouched('password')}
        error={errors.password}
      />
      <FormField
        id="register-confirm-password"
        label="Confirm password"
        revealable
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        onBlur={() => markTouched('confirmPassword')}
        error={errors.confirmPassword}
      />
      <AuthSubmitButton type="submit" disabled={submitting || !isSupabaseConfigured}>
        {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : 'Create your account'}
      </AuthSubmitButton>
      <GoogleSignInButton disabled={!isSupabaseConfigured} onError={setServerError} />
    </form>
  );
}
