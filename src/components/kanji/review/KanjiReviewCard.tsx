import { Kbd } from '../../vocabulary/review/Kbd';
import type { KanjiEntry } from '../../../types';

interface KanjiReviewCardProps {
  kanji: KanjiEntry;
  revealed: boolean;
  onReveal: () => void;
}

/**
 * The active kanji flashcard — the same surface, proportions and reveal motion as the vocabulary card
 * so both decks feel like one product.
 *
 * Front is the character alone: the recall task is "what does this mean, and how is it read?", which is
 * what the JLPT actually asks of you. Revealing shows meaning + on/kun readings and one example word;
 * the heavier material (stroke order, writing practice, full examples) lives in the panel below the
 * card rather than on it, so the card stays a card.
 */
export function KanjiReviewCard({ kanji, revealed, onReveal }: KanjiReviewCardProps) {
  return (
    <div
      onClick={revealed ? undefined : onReveal}
      className={`review-card-surface relative w-full min-h-[460px] md:min-h-[500px] xl:h-full rounded-[26px] p-6 md:p-8 flex flex-col ${
        revealed ? '' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300/90">
          Kanji
        </span>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          {kanji.strokeCount} strokes · {kanji.level}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5 py-6">
        <p className="jp-text text-[7rem] sm:text-[8.5rem] leading-none font-semibold text-slate-900 dark:text-white">
          {kanji.character}
        </p>

        {revealed && (
          <div className="animate-review-reveal-in mt-5 space-y-1">
            <p className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">{kanji.meaning.en}</p>
            <p className="text-base text-slate-500 dark:text-slate-400">{kanji.meaning.nl}</p>
          </div>
        )}
      </div>

      {revealed ? (
        <div className="animate-review-reveal-in rounded-2xl border border-slate-200/70 bg-slate-100/80 dark:border-white/[0.06] dark:bg-[#0a1122]/70 p-4 md:p-5">
          <div className="grid grid-cols-2 gap-4 text-left">
            <Readings label="On'yomi" values={kanji.onyomi} />
            <Readings label="Kun'yomi" values={kanji.kunyomi} />
          </div>
          {kanji.exampleWords[0] && (
            <div className="mt-4 border-t border-slate-200/70 pt-3 text-left dark:border-white/[0.06]">
              <p className="jp-text text-base text-slate-800 dark:text-slate-100">
                {kanji.exampleWords[0].word}
                <span className="ml-2 text-sm text-slate-400 dark:text-slate-500">{kanji.exampleWords[0].kana}</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{kanji.exampleWords[0].meaning.en}</p>
            </div>
          )}
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

function Readings({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</h3>
      <p className="jp-text mt-1 text-slate-800 dark:text-slate-100">{values.length > 0 ? values.join('、 ') : '—'}</p>
    </div>
  );
}
