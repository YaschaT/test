import { Volume2 } from 'lucide-react';
import { JapaneseText } from '../../JapaneseText';
import { Bilingual } from '../../Bilingual';
import { Kbd } from './Kbd';
import { speakJapaneseBrowser } from '../../../lib/tts/browserTts';
import type { DisplayPrefs } from '../../DisplayToggles';
import type { VocabWord } from '../../../types';

interface ReviewCardProps {
  word: VocabWord;
  revealed: boolean;
  prefs: DisplayPrefs;
  onReveal: () => void;
}

/**
 * The active flashcard. Before reveal only the word + reading show (the whole card is clickable);
 * after reveal the meaning and example fade in below — a vertical opacity transition, deliberately
 * not a 3D flip. Surface gradient lives in index.css (.review-card-surface) so light/dark variants
 * stay together.
 */
export function ReviewCard({ word, revealed, prefs, onReveal }: ReviewCardProps) {
  return (
    <div
      onClick={revealed ? undefined : onReveal}
      className={`review-card-surface relative w-full min-h-[460px] md:min-h-[500px] xl:h-full rounded-[26px] p-6 md:p-8 flex flex-col ${
        revealed ? '' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300/90">
          Vocabulary
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            speakJapaneseBrowser(word.japanese);
          }}
          aria-label={`Play pronunciation of ${word.japanese}`}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white/70 text-slate-500 hover:text-brand-600 hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:text-brand-300 dark:hover:bg-white/10 transition-colors"
        >
          <Volume2 size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5 py-6">
        <p className="jp-text text-5xl sm:text-6xl leading-tight font-semibold text-slate-900 dark:text-white">
          {word.japanese}
        </p>
        {word.kana !== word.japanese && (
          <p className="jp-text text-xl md:text-2xl text-brand-600 dark:text-brand-300">{word.kana}</p>
        )}

        {revealed && (
          <div className="animate-review-reveal-in mt-4 space-y-1">
            <p className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">{word.meaning.en}</p>
            <p className="text-base text-slate-500 dark:text-slate-400">{word.meaning.nl}</p>
            {prefs.romaji && (
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 pt-1">
                {word.romaji}
              </p>
            )}
          </div>
        )}
      </div>

      {revealed ? (
        <div className="animate-review-reveal-in rounded-2xl border border-slate-200/70 bg-slate-100/80 dark:border-white/[0.06] dark:bg-[#0a1122]/70 p-4 md:p-5 text-left">
          <JapaneseText
            segments={word.example.segments}
            showFurigana={prefs.furigana}
            className="text-lg md:text-xl text-slate-800 dark:text-slate-100"
          />
          {prefs.romaji && (
            <p className="text-sm text-brand-600 dark:text-brand-300 mt-1.5">{word.example.romaji}</p>
          )}
          <Bilingual text={{ en: word.example.en, nl: word.example.nl }} className="mt-2 text-sm" />
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReveal();
          }}
          className="mx-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
        >
          <span className="hidden sm:inline-flex">
            <Kbd>Space</Kbd>
          </span>
          <span className="sm:hidden">Tap to reveal</span>
          <span className="hidden sm:inline">Reveal answer</span>
        </button>
      )}
    </div>
  );
}
