import { Link } from 'react-router-dom';
import { Logo } from '../Logo';

const FOOTER_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vocabulary', label: 'Vocabulary' },
  { to: '/kanji', label: 'Kanji' },
  { to: '/grammar', label: 'Grammar' },
  { to: '/login', label: 'Log in' },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <div>
            <p className="text-sm font-bold text-white leading-tight">Kotobox</p>
            <p className="text-xs text-white/45 leading-tight">Your daily path from Japanese N5 to N4.</p>
          </div>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2.5 min-h-11 inline-flex items-center rounded-lg text-sm font-medium text-white/55 hover:text-white hover:bg-white/5 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-white/35">© 2026 Kotobox</p>
      </div>
    </footer>
  );
}
