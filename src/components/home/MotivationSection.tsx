import { Eyebrow } from './primitives';

/* Each instrument describes a real product mechanic (streak.ts, xp.ts, dashboardStats.ts). */
const INSTRUMENTS = [
  { term: 'Streak', desc: 'Consecutive study days, with today counted the moment you study.' },
  { term: 'Level', desc: 'Earned from everything you complete — reviews, lessons, listening sessions. Titles run from Beginner up to Master.' },
  { term: 'Weekly goal', desc: 'Days studied this week, out of seven.' },
];

/** §8 Motivation — instrumentation, not a carnival; ledger rows, deliberately undesigned. */
export function MotivationSection() {
  return (
    <section className="hp-section" aria-labelledby="hp-motivation-title">
      <div className="hp-container hp-grid">
        <div className="hp-motivation-copy">
          <Eyebrow>Staying with it</Eyebrow>
          <h2 className="hp-h2" id="hp-motivation-title" data-hp-reveal="mask">
            Built for adults who want progress, not applause.
          </h2>
          <p className="hp-body" data-hp-reveal="rise" style={{ marginTop: 24 }}>
            Streaks, levels and badges exist in Kotobox — as instruments, not fireworks. A streak
            tells you the habit is holding. A level tells you the work is accumulating. A weekly
            goal tells you the truth about your week. Quiet numbers, honestly earned — you saw them
            on the dashboard above.
          </p>
        </div>
        <dl className="hp-instruments">
          {INSTRUMENTS.map((i) => (
            <div key={i.term} className="hp-instrument" data-hp-reveal="rise">
              <dt>{i.term}</dt>
              <dd>{i.desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
