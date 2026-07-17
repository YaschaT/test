import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import './auth.css';

type AuthMode = 'login' | 'register';

interface AuthShellProps {
  mode: AuthMode;
}

const COPY: Record<AuthMode, { eyebrow: string; heading: string; sub: string }> = {
  login: {
    eyebrow: 'Log in',
    heading: 'Welcome back',
    sub: 'Continue your Japanese learning journey.',
  },
  register: {
    eyebrow: 'Create account',
    heading: 'Start your Japanese journey',
    sub: 'Create your account and build a learning path that fits your day.',
  },
};

/**
 * The auth surface as a direct continuation of the "Living Ink" homepage: warm paper, Newsreader
 * display type, restrained vermilion, hairline rules (auth.css). An asymmetric editorial split —
 * the form is the primary column, the stone-garden artwork (genuine alpha PNG/WebP in
 * public/assets/auth/) balances it on the right and drops below the actions on small screens.
 * All auth behavior lives in LoginForm / RegisterForm; this shell only owns layout and the
 * post-auth navigation.
 */
export function AuthShell({ mode }: AuthShellProps) {
  const navigate = useNavigate();
  const copy = COPY[mode];

  return (
    <div className="au-surface">
      <header className="au-topbar">
        <Link to="/" className="au-wordmark">
          Kotobox
        </Link>
        <Link to="/" className="au-back">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </header>

      <main className="au-main">
        <section className="au-form-col au-anim" aria-labelledby="au-heading">
          <p className="au-eyebrow">{copy.eyebrow}</p>
          <h1 id="au-heading" className="au-h1">
            {copy.heading}
          </h1>
          <p className="au-lede">{copy.sub}</p>

          {mode === 'login' ? (
            <LoginForm onAuthenticated={() => navigate('/dashboard')} />
          ) : (
            <RegisterForm onAuthenticated={() => navigate('/dashboard')} />
          )}

          <p className="au-alt">
            {mode === 'login' ? (
              <>
                New to Kotobox?{' '}
                <Link to="/register" className="au-link">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="au-link">
                  Log in
                </Link>
              </>
            )}
          </p>
          <button type="button" onClick={() => navigate('/dashboard')} className="au-quiet">
            Continue without an account
          </button>
        </section>

        <div className="au-art-col au-anim" style={{ '--d': '120ms' } as React.CSSProperties} aria-hidden="true">
          <picture>
            <source srcSet="/assets/auth/kotobox-auth-hero.webp" type="image/webp" />
            <img src="/assets/auth/kotobox-auth-hero.png" alt="" width={1536} height={1024} decoding="async" />
          </picture>
        </div>
      </main>
    </div>
  );
}
