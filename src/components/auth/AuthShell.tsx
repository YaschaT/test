import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { SegmentedTabs } from '../SegmentedTabs';
import { Logo } from '../Logo';
import { AuthMascotSplash } from './AuthMascotSplash';

type AuthMode = 'login' | 'register';

interface AuthShellProps {
  mode: AuthMode;
  tagline: string;
  children: ReactNode;
}

const SPLASH_SEEN_KEY = 'kotoba-do:auth-splash-seen';

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
 * Shared shell for /login and /register: the mascot splash (shown once per browser session, not on every
 * toggle between the two routes — see hasSeenSplash), then the dark starfield card with the Log in/Register
 * segmented toggle. The toggle drives real route navigation rather than local tab state, so the URL, back
 * button, and direct links to /register all work correctly.
 */
export function AuthShell({ mode, tagline, children }: AuthShellProps) {
  const [showSplash, setShowSplash] = useState(() => !hasSeenSplash());
  const navigate = useNavigate();

  function handleSplashDone() {
    markSplashSeen();
    setShowSplash(false);
  }

  if (showSplash) {
    return <AuthMascotSplash onDone={handleSplashDone} />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 star-field" aria-hidden="true" />
      <div className="relative w-full max-w-sm animate-celebrate">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Logo size={40} />
          <h1 className="text-xl font-extrabold text-white">Kotobox</h1>
          <p className="text-sm text-white/60 text-center">{tagline}</p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 shadow-2xl p-6 sm:p-7">
          <SegmentedTabs
            value={mode}
            onChange={(next) => navigate(next === 'register' ? '/register' : '/login')}
            groupLabel="Log in or register"
            className="w-full mb-6 [&>*]:flex-1"
            options={[
              { value: 'login', label: 'Log in' },
              { value: 'register', label: 'Register' },
            ]}
          />
          {children}
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full mt-5 text-center text-sm font-medium text-white/50 hover:text-white/80 transition-colors"
        >
          Continue without an account
        </button>
      </div>
    </div>
  );
}
