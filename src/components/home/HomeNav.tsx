import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryCta } from './primitives';

const SECTION_LINKS = [
  { href: '#system', label: 'The system' },
  { href: '#session', label: 'A study day' },
  { href: '#inside', label: 'Inside the app' },
  { href: '#access', label: 'Free access' },
];

/**
 * Quiet masthead: transparent over the hero, paper-backed after 80px, slides away on scroll-down
 * and returns on scroll-up. Hiding is suppressed while keyboard focus is inside the nav and under
 * prefers-reduced-motion (the bar then simply stays put).
 */
export function HomeNav() {
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setCondensed(y > 80);
        const focusInside = navRef.current?.contains(document.activeElement) ?? false;
        if (reduce.matches || focusInside) {
          setHidden(false);
        } else {
          const delta = y - lastY.current;
          if (y < 160) setHidden(false);
          else if (delta > 4) setHidden(true);
          else if (delta < -4) setHidden(false);
        }
        lastY.current = y;
        ticking.current = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Overlay: ESC closes, focus is trapped while open, and focus returns to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const focusables = overlay.querySelectorAll<HTMLElement>('a, button');
    focusables[0]?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  function closeOverlay() {
    setOpen(false);
    burgerRef.current?.focus();
  }

  return (
    <header>
      <nav
        ref={navRef}
        aria-label="Main"
        className={`hp-nav${condensed ? ' is-condensed' : ''}${hidden && !open ? ' is-hidden' : ''}`}
      >
        <div className="hp-container hp-container--wide hp-nav-row">
          <Link to="/" className="hp-wordmark">
            Kotobox
          </Link>
          <ul className="hp-nav-links">
            {SECTION_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hp-nav-link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <Link to="/login" className="hp-nav-login">
            Log in
          </Link>
          <PrimaryCta compact />
          <button
            ref={burgerRef}
            type="button"
            className="hp-nav-burger"
            aria-expanded={open}
            aria-controls="hp-nav-overlay"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </nav>

      {open && (
        <div ref={overlayRef} id="hp-nav-overlay" className="hp-nav-overlay" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="hp-nav-overlay-head">
            <span className="hp-wordmark" aria-hidden="true">
              Kotobox
            </span>
            <button type="button" className="hp-nav-burger" onClick={closeOverlay}>
              Close
            </button>
          </div>
          <ul className="hp-nav-overlay-list">
            {SECTION_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="hp-nav-overlay-link" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/login" className="hp-nav-overlay-link">
                Log in
              </Link>
            </li>
          </ul>
          <div className="hp-nav-overlay-ctas">
            <PrimaryCta />
            <a href="#system" className="hp-btn hp-btn--secondary" onClick={() => setOpen(false)}>
              Explore the platform
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
