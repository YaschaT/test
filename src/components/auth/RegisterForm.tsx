import { useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { AuthSubmitButton } from './AuthSubmitButton';
import { FormField } from './FormField';
import { GoogleButton } from './GoogleButton';
import { registerWithEmail, isSupabaseConfigured } from '../../lib/auth';
import { validateEmail, validatePassword, validateConfirmPassword, friendlyAuthError } from '../../lib/authValidation';
import { syncProgressAfterSignIn } from '../../lib/progressSync';

type Field = 'email' | 'password' | 'confirmPassword';

interface RegisterFormProps {
  /** Called only when registration grants an immediate session (no email confirmation pending) — AuthShell owns the gate exit transition + route change from there. */
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
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#e34a33]/15 text-[#ff8a5c]">
          <MailCheck size={22} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-white">Check your email</p>
        <p className="text-sm text-white/55">
          We sent a confirmation link to <span className="font-medium text-white/80">{email}</span>. Confirm it, then log in
          to pick up right where you left off.
        </p>
      </div>
    );
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
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        onBlur={() => markTouched('password')}
        error={errors.password}
      />
      <FormField
        id="register-confirm-password"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        onBlur={() => markTouched('confirmPassword')}
        error={errors.confirmPassword}
      />
      <AuthSubmitButton type="submit" disabled={submitting || !isSupabaseConfigured}>
        {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : 'Create account'}
      </AuthSubmitButton>
      <div className="relative py-1 text-center">
        <span className="relative bg-[#0e0e14] px-2 text-xs text-white/35">or</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-white/10" aria-hidden="true" />
      </div>
      <GoogleButton />
    </form>
  );
}
