import { LogIn, LogOut, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/authStore';
import { signOut } from '../lib/auth';

/**
 * Sidebar's account entry — an addition, not a gate: guest mode keeps working exactly as before regardless
 * of what this shows. Renders nothing while the session check is resolving (real, brief) rather than
 * flashing a "Sign in" state that would immediately flip to signed-in for returning users.
 */
export function AccountNavItem() {
  const { status, user } = useAuth();

  if (status === 'checking') return null;

  if (status === 'signed-in' && user) {
    return (
      <div className="flex items-center gap-2 rounded-xl px-3.5 py-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 shrink-0">
          <User size={16} aria-hidden="true" />
        </span>
        <span className="flex-1 min-w-0 truncate text-sm text-slate-600 dark:text-slate-300" title={user.email ?? undefined}>
          {user.email}
        </span>
        <button
          type="button"
          onClick={() => signOut()}
          aria-label="Sign out"
          className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <LogOut size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <NavLink
      to="/login"
      className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
    >
      <LogIn size={19} aria-hidden="true" />
      Sign in
    </NavLink>
  );
}
