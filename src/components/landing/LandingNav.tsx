import { Link } from 'react-router-dom';
import { Logo } from '../Logo';

const PILL_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#preview', label: 'Preview' },
  { href: '#journey', label: 'Journey' },
  { href: '#pricing', label: 'Pricing' },
];

/**
 * Template-structure nav: fixed over the hero, logo + italic-serif wordmark left, a frosted center pill
 * of section anchors (desktop), and a solid white Sign Up action right. Deviations from the template,
 * both deliberate: the pill links are this page's real sections (no fake "active" state on a scrolling
 * page), and mobile shows Log in + Sign Up directly instead of a hamburger — every control stays real
 * and one tap deep.
 */
export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5" aria-label="Landing navigation">
      <a href="#top" className="flex items-center gap-2.5 min-h-11">
        <Logo size={26} />
        <span className="text-white text-2xl font-playfair italic">Kotobox</span>
      </a>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {PILL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-inter px-4 py-1.5 rounded-full text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="font-inter text-white/85 hover:text-white text-sm font-medium px-4 py-2.5 min-h-11 inline-flex items-center transition-colors"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="font-inter bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 min-h-11 inline-flex items-center rounded-full hover:bg-gray-100 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
