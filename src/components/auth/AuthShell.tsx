import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SegmentedTabs } from '../SegmentedTabs';
import { Logo } from '../Logo';
import { AuthMascotSplash } from './AuthMascotSplash';
import { TorriiGateScene } from './TorriiGateScene';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type AuthMode = 'login' | 'register';
type ViewState = 'splash' | 'split' | 'exiting';

interface AuthShellProps {
  mode: AuthMode;
}

const SPLASH_SEEN_KEY = 'kotoba-do:auth-splash-seen';
const EXIT_DURATION_MS = 750;

const COPY: Record<AuthMode, { headline: string; sub: string }> = {
  login: {
    headline: 'Continue your path.',
    sub: 'Sign in to pick up your progress on every device.',
  },
  register: {
    headline: 'Begin your path.',
    sub: 'Create an account to keep your progress safe everywhere.',
  },
};

function hasSeenSplash(): boolean {
  try {
    return window.sessionStorage.getItem(SPLASH_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSplashSeen(): void {
  try {
    window.sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
  } catch {
    // Storage unavailable — the splash will just replay next time, harmless.
  }
}

/**
 * The redesigned auth surface: an asymmetric split between an illustrated torii-gate scene (the fox
 * mascot's stage — see TorriiGateScene) and the actual form, on a dark ink canvas with a torii-vermillion
 * signature accent — a deliberate departure from the rest of the app's navy/starfield identity, per the
 * confirmed brief. Owns the whole view lifecycle: the once-per-session entrance splash, the normal
 * split layout, and the exit choreography (mascot walks through the gate, light floods in) that plays
 * right before landing on the Dashboard, so the two screens feel physically connected.
 */
export function AuthShell({ mode }: AuthShellProps) {
  const [view, setView] = useState<ViewState>(() => (hasSeenSplash() ? 'split' : 'splash'));
  const navigate = useNavigate();
  const copy = COPY[mode];

  function handleSplashDone() {
    markSplashSeen();
    setView('split');
  }

  function handleAuthenticated() {
    setView('exiting');
    setTimeout(() => navigate('/dashboard'), EXIT_DURATION_MS);
  }

  if (view === 'splash') {
    return <AuthMascotSplash onDone={handleSplashDone} />;
  }

  if (view === 'exiting') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0f]">
        <TorriiGateScene phase="entering" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] lg:grid lg:grid-cols-2 torii-grain">
      <div className="relative flex flex-col items-center justify-center px-8 pt-12 pb-8 lg:pb-12 lg:border-r lg:border-white/8 overflow-hidden torii-scene-settle">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute select-none text-white"
          style={{
            fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
            fontSize: 'min(48vw, 30rem)',
            fontWeight: 700,
            opacity: 0.035,
            lineHeight: 1,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          道
        </span>
        <div className="relative w-52 h-60 sm:w-64 sm:h-72 lg:w-80 lg:h-[22rem] mb-5 lg:mb-10">
          <TorriiGateScene phase="greeting" />
        </div>
        <h1
          className="relative text-center text-white text-[2.1rem] sm:text-5xl lg:text-6xl leading-[1.03] text-balance"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          {copy.headline}
        </h1>
        <p className="relative mt-3 text-center text-white/50 text-sm lg:text-base max-w-xs">{copy.sub}</p>
      </div>

      <div className="flex flex-col items-center justify-center px-4 pb-12 lg:py-16">
        <div className="w-full max-w-sm torii-form-panel-in">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Logo size={26} />
            <span className="text-lg font-semibold text-white" style={{ fontFamily: "'Fraunces', serif" }}>
              Kotobox
            </span>
          </div>

          <SegmentedTabs
            value={mode}
            onChange={(next) => navigate(next === 'register' ? '/register' : '/login')}
            groupLabel="Log in or register"
            variant="glass"
            className="w-full mb-6 [&>*]:flex-1"
            options={[
              { value: 'login', label: 'Log in' },
              { value: 'register', label: 'Register' },
            ]}
          />

          {mode === 'login' ? (
            <LoginForm onAuthenticated={handleAuthenticated} />
          ) : (
            <RegisterForm onAuthenticated={handleAuthenticated} />
          )}

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full mt-6 text-center text-sm font-medium text-white/40 hover:text-white/70 transition-colors"
          >
            Continue without an account
          </button>
        </div>
      </div>
    </div>
  );
}
