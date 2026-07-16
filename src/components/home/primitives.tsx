import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

/** Tracked-caps section label. */
export function Eyebrow({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <span className="hp-eyebrow" id={id}>
      {children}
    </span>
  );
}

/**
 * The page's two CTAs, fixed wording per the brief. Primary routes to /register; secondary is an
 * in-page anchor to the system section. `compact` is the nav variant.
 */
export function PrimaryCta({ compact }: { compact?: boolean }) {
  return (
    <Link
      to="/register"
      className={`hp-btn hp-btn--primary${compact ? ' hp-btn--compact' : ''}`}
      aria-label={compact ? 'Start learning for free' : undefined}
    >
      {compact ? (
        <>
          <span className="hp-cta-long">Start learning for free</span>
          <span className="hp-cta-short">Start free</span>
        </>
      ) : (
        'Start learning for free'
      )}
    </Link>
  );
}

export function SecondaryCta() {
  return (
    <a href="#system" className="hp-btn hp-btn--secondary">
      Explore the platform
    </a>
  );
}
