import { useId } from 'react';

interface Milestone {
  step: number;
  title: string;
  copy: string;
  jp: string;
}

const MILESTONES: Milestone[] = [
  { step: 1, title: 'Start with N5 basics', copy: 'Kana-friendly first words and your first grammar patterns — no prior knowledge assumed.', jp: 'はじめる' },
  { step: 2, title: 'Build vocabulary', copy: 'A growing flashcard deck with daily spaced-repetition reviews that keep words from fading.', jp: 'ことば' },
  { step: 3, title: 'Learn grammar patterns', copy: 'A guided N5 path — each point with formulas, examples, and the mistakes everyone makes.', jp: 'ぶんぽう' },
  { step: 4, title: 'Practice kanji', copy: 'Readings, meanings, example words, and stroke-by-stroke writing practice.', jp: 'かんじ' },
  { step: 5, title: 'Listen and review', copy: 'Spoken Japanese at your pace, plus mixed reviews that keep older material alive.', jp: 'きく' },
  { step: 6, title: 'Move toward N4', copy: 'The same loop, deeper material — your N5 foundation keeps getting reviewed along the way.', jp: 'つぎへ' },
];

/** Simple origami crane silhouette — the journey's patience-and-progress motif, in brand lavender. */
function OrigamiCrane({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden="true">
      <g className="fill-brand-300">
        <path d="M8 34 L30 26 L26 38 Z" opacity="0.7" />
        <path d="M30 26 L44 8 L38 28 Z" opacity="0.9" />
        <path d="M30 26 L56 20 L38 30 Z" opacity="0.55" />
        <path d="M26 38 L38 30 L34 44 Z" opacity="0.8" />
      </g>
    </svg>
  );
}

/**
 * The N5→N4 journey as a literal path: numbered milestones along a center thread (numbers are earned here —
 * this genuinely is a sequence), each with a small kana waypoint marker, the reading-pose mascot walking
 * the route, and an origami crane landing at the end. Mirrors the same "path" language the Grammar module
 * already uses in-app, so the marketing story matches the product's own metaphor.
 */
export function JourneySection() {
  const uid = useId().replace(/:/g, '');

  return (
    <section id="journey" className="relative py-20 sm:py-28 scroll-mt-16 overflow-hidden">
      {/* ghost 道 (path/way) — the same motif the logo's torii already encodes, here as a barely-there
          backdrop plane that gives the section depth without competing with the content */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute select-none text-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          fontFamily: "'Hiragino Sans', 'Noto Sans JP', sans-serif",
          fontSize: 'min(70vw, 44rem)',
          fontWeight: 700,
          opacity: 0.025,
          lineHeight: 1,
        }}
      >
        道
      </span>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 data-reveal className="text-3xl sm:text-4xl font-extrabold text-white text-balance max-w-2xl">
              One path, six stages, zero guessing.
            </h2>
            <p data-reveal className="mt-4 text-white/60 max-w-2xl">
              You never have to design your own curriculum. The path is the product.
            </p>
          </div>
          <img
            data-reveal
            src="/assets/dashboard/mascots/mascot-reading-map.png"
            alt="The Kotobox mascot reading a map"
            width={120}
            height={113}
            loading="lazy"
            decoding="async"
            className="hidden sm:block w-28 h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
          />
        </div>

        <div className="relative mt-12">
          {/* the path thread */}
          <div
            aria-hidden="true"
            className="absolute left-5 sm:left-1/2 top-2 bottom-2 w-px sm:-translate-x-px bg-gradient-to-b from-brand-500/60 via-brand-400/30 to-emerald-400/50"
          />
          <ol className="space-y-8">
            {MILESTONES.map((m, i) => (
              <li
                key={m.step}
                data-reveal
                className={`relative flex items-start gap-5 sm:w-[calc(50%+2.5rem)] ${
                  i % 2 === 1 ? 'sm:ml-auto sm:flex-row-reverse sm:text-right' : ''
                }`}
              >
                <span
                  className={`relative z-10 flex items-center justify-center shrink-0 w-10 h-10 rounded-full font-bold text-sm ${
                    m.step === 6
                      ? 'bg-emerald-500 text-white shadow-[0_0_20px_-4px_rgba(16,185,129,0.8)]'
                      : 'bg-brand-600 text-white shadow-[0_0_16px_-4px_rgba(76,110,240,0.8)]'
                  }`}
                >
                  {m.step}
                </span>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-5 flex-1">
                  <p className="text-xs font-bold text-brand-300 mb-1" lang="ja">
                    {m.jp}
                  </p>
                  <h3 className="text-base font-bold text-white">{m.title}</h3>
                  <p className="mt-1 text-sm text-white/60 leading-relaxed">{m.copy}</p>
                </div>
              </li>
            ))}
          </ol>
          <OrigamiCrane className="absolute -bottom-6 right-0 w-16 h-12 opacity-70" />
          <span className="sr-only" id={`journey-end-${uid}`}>
            End of the six-stage learning path.
          </span>
        </div>
      </div>
    </section>
  );
}
