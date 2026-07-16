import { Link } from 'react-router-dom';

/**
 * Temporary stand-in for the public homepage while it is redesigned. Deliberately unstyled beyond
 * legibility — no design decisions belong here. The new homepage's design direction lives in
 * docs/kotobox-homepage-brief.md; teardown notes in docs/kotobox-homepage-state.md.
 */
export function HomePlaceholder() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl">Kotobox</h1>
      <p className="text-slate-600 dark:text-slate-400">Homepage redesign in progress</p>
      <nav aria-label="Account" className="flex gap-6">
        <Link to="/login" className="underline text-brand-600 dark:text-brand-300">
          Log in
        </Link>
        <Link to="/register" className="underline text-brand-600 dark:text-brand-300">
          Create account
        </Link>
      </nav>
    </main>
  );
}
