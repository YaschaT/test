import { Link } from 'react-router-dom';
import { Eyebrow, PrimaryCta } from './primitives';
import { GoGlyph } from './stage/GoGlyph';

/** §9 Access — money and accounts answered in prose, like a letter. No tiers, no invented prices. */
export function AccessSection() {
  return (
    <section className="hp-section" id="access" aria-labelledby="hp-access-title">
      <div className="hp-container hp-grid">
        <div className="hp-access-copy">
          <Eyebrow>Free access</Eyebrow>
          <div className="hp-access-head">
            <GoGlyph className="hp-seal" />
            <h2 className="hp-h2" id="hp-access-title" data-hp-reveal="mask">
              Free now. Honest later.
            </h2>
          </div>
          <p data-hp-reveal="rise" style={{ marginTop: 32 }}>
            Kotobox is free while it grows. All of it — every word, character, lesson and listening
            session.
          </p>
          <p data-hp-reveal="rise">
            You don’t even need an account: progress saves in your browser and you can start in
            seconds. Create a free account when you want your progress to follow you across
            devices.
          </p>
          <p data-hp-reveal="rise">
            Paid plans may exist one day, once there’s clearly more here worth paying for. No
            prices to show you yet, and no surprises planned — learning you’ve already done stays
            yours.
          </p>
          <div className="hp-access-cta" data-hp-reveal="rise">
            <PrimaryCta />
            <span className="hp-caption">
              or{' '}
              <Link to="/login" className="hp-link">
                log in
              </Link>{' '}
              if you’ve been here before
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
