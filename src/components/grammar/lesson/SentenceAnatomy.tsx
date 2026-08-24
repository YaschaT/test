import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { GrammarBilingual } from '../GrammarBilingual';
import { speakJapaneseBrowser } from '../../../lib/tts/browserTts';
import type { GrammarAnatomyToken } from '../../../types';

interface SentenceAnatomyProps {
  sentence: string;
  /** Kana for the whole sentence — what the voice is given, so no reading is guessed. */
  kana: string;
  tokens: GrammarAnatomyToken[];
}

/**
 * The lesson's headline sentence, taken apart.
 *
 * Each chunk is a real button: tapping one explains the job that chunk does. The panel below is a fixed
 * minimum height so switching chunks doesn't make the rest of the lesson jump up and down.
 */
export function SentenceAnatomy({ sentence, kana, tokens }: SentenceAnatomyProps) {
  // Opens on the last chunk — the one the lesson is actually about (です in 私は学生です).
  const [active, setActive] = useState(tokens.length - 1);
  const token = tokens[active];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {tokens.map((t, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(i)}
              className={`rounded-2xl border px-5 py-3 text-center transition-colors ${
                on
                  ? 'border-brand-400/60 bg-brand-500/20 text-white'
                  : 'border-white/10 bg-white/[0.035] text-slate-300 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              <span className="jp-text block text-2xl font-medium leading-none">{t.text}</span>
              <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.08em] opacity-80">
                {t.role.en}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => speakJapaneseBrowser(kana)}
          aria-label={`Play the sentence ${sentence}`}
          className="ml-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition-colors hover:bg-white/10 hover:text-brand-300"
        >
          <Volume2 size={17} aria-hidden="true" />
        </button>
      </div>

      {/* aria-live so a screen-reader user hears the explanation change when they pick a new chunk. */}
      <div
        aria-live="polite"
        className="mt-4 min-h-[112px] rounded-2xl border border-white/10 border-l-[3px] border-l-brand-500 bg-white/[0.03] px-5 py-4"
      >
        <p className="jp-text text-[15px] font-bold text-white">{token.title}</p>
        <GrammarBilingual text={token.body} className="mt-1.5" />
      </div>
    </div>
  );
}
