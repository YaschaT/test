import { useState } from 'react';
import { Volume2, Eye } from 'lucide-react';
import { PHRASES, PHRASE_CATEGORIES, type Phrase } from '../../data/phrases';
import { getSavedVoiceMode, useTtsPlayer } from '../../lib/tts/ttsService';

/**
 * Offline speaking practice: shadow real set phrases (tap to hear via browser TTS) or turn on
 * "Say it first" to hide the Japanese and produce it from the English before revealing. Needs no
 * AI provider — works everywhere.
 */
export function Phrasebook() {
  const tts = useTtsPlayer(getSavedVoiceMode());
  const [cat, setCat] = useState<string>('All');
  const [drill, setDrill] = useState(false);
  const [showRomaji, setShowRomaji] = useState(true);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const list = cat === 'All' ? PHRASES : PHRASES.filter((p) => p.category === cat);
  const isShown = (p: Phrase) => !drill || revealed[p.id];

  function reveal(p: Phrase) {
    setRevealed((r) => ({ ...r, [p.id]: true }));
  }
  function play(p: Phrase) {
    reveal(p);
    void tts.play(p.ja, 1);
  }

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      active
        ? 'bg-brand-500 text-white'
        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-brand-400'
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setCat('All')} className={chip(cat === 'All')}>
          All
        </button>
        {PHRASE_CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)} className={chip(cat === c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={drill}
            onChange={(e) => {
              setDrill(e.target.checked);
              setRevealed({});
            }}
            className="accent-brand-500 h-4 w-4"
          />
          Say it first (hide Japanese)
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showRomaji}
            onChange={(e) => setShowRomaji(e.target.checked)}
            className="accent-brand-500 h-4 w-4"
          />
          Show romaji
        </label>
      </div>

      <ul className="grid gap-2.5 sm:grid-cols-2">
        {list.map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-start justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-slate-500 dark:text-slate-400">{p.meaning.en}</p>
              {isShown(p) ? (
                <>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white leading-snug">{p.ja}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {p.kana}
                    {showRomaji ? ` · ${p.romaji}` : ''}
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => reveal(p)}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Eye size={15} /> Show answer
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => play(p)}
              aria-label={`Play ${p.romaji}`}
              className="shrink-0 rounded-full p-2 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Volume2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
