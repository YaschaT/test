import { Link } from 'react-router-dom';

/**
 * Minimal footer — rendered outside <main> so it's a real contentinfo landmark. Visually it
 * continues the final section's plate (hp-final has no bottom padding of its own).
 */
export function HomeFooter() {
  return (
    <footer className="hp-footer">
      <div className="hp-container">
        <div className="hp-footer-row">
          <span className="hp-footer-tag">
            <strong>Kotobox</strong> — JLPT N5→N4, in one piece.
          </span>
          <ul className="hp-footer-links">
            <li>
              <Link to="/login" className="hp-link">
                Log in
              </Link>
            </li>
            <li>
              <Link to="/register" className="hp-link">
                Create account
              </Link>
            </li>
            <li>
              <a href="#system" className="hp-link">
                The system
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
