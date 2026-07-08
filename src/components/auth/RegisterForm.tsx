import { useState } from 'react';
import { Loader2, MailCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../PrimaryButton';
import { FormField } from './FormField';
import { GoogleButton } from './GoogleButton';
import { registerWithEmail, isSupabaseConfigured } from '../../lib/auth';
import { validateEmail, validatePassword, validateConfirmPassword, friendlyAuthError } from '../../lib/authValidation';
import { syncProgressAfterSignIn } from '../../lib/progressSync';

type Field = 'email' | 'password' | 'confirmPassword';

export function RegisterForm() {
  const navigate = useNavigate();
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
      const user = await registerWithEmail(email, password);
      if (user) {
        await syncProgressAfterSignIn(user.id);
        navigate('/');
      } else {
        setAwaitingConfirmation(true);
      }
    } catch (err) {
      setServerError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-300">
          <MailCheck size={22} aria-hidden="true" />
        </span>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Check your email</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We sent a confirmation link to <span className="font-medium text-slate-700 dark:text-slate-200">{email}</span>. Confirm
          it, then log in to pick up right where you left off.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {!isSupabaseConfigured && (
        <p role="status" className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-lg px-3 py-2">
          Accounts are almost ready — check back soon.
        </p>
      )}
      {serverError && (
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">
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
      <PrimaryButton type="submit" disabled={submitting || !isSupabaseConfigured} className="w-full justify-center">
        {submitting ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : 'Create account'}
      </PrimaryButton>
      <div className="relative py-1 text-center">
        <span className="relative bg-white dark:bg-slate-900 px-2 text-xs text-slate-400">or</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
      </div>
      <GoogleButton />
    </form>
  );
}
