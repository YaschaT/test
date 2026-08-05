import { useState } from 'react';
import { ChevronDown, PenTool } from 'lucide-react';
import { WritingPractice } from '../WritingPractice';
import { ExampleSentenceCard } from '../../ExampleSentenceCard';
import type { DisplayPrefs } from '../../DisplayToggles';
import type { KanjiEntry } from '../../../types';

interface KanjiStudyPanelProps {
  kanji: KanjiEntry;
  prefs: DisplayPrefs;
}

/**
 * The deeper material for the kanji on screen — example words, the example sentence, and the full
 * See → Trace → Copy → Recall writing practice — tucked under the flashcard.
 *
 * Collapsed by default and on every new card: reviewing is the primary task, and an always-open
 * stroke-order canvas would push the grading buttons off screen and slow the session down. Opening it
 * in place is what removes the old "go back to the list, open the detail page, come back" round trip.
 */
export function KanjiStudyPanel({ kanji, prefs }: KanjiStudyPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-slate-900/70">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <PenTool size={16} className="text-brand-500" aria-hidden="true" />
          Stroke order, examples &amp; writing practice
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 px-5 py-5 dark:border-white/[0.06]">
          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Example words</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {kanji.exampleWords.map((w, i) => (
                <div key={i}>
                  <p className="jp-text font-medium text-slate-900 dark:text-white">
                    {w.word} <span className="text-xs text-slate-400">{w.kana}</span>
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{w.meaning.en}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Example sentence</h3>
            <ExampleSentenceCard example={kanji.exampleSentence} prefs={prefs} />
          </section>

          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Writing practice</h3>
            {/* Keyed by character so the 4-stage stepper resets when the session moves to a new kanji. */}
            <WritingPractice
              key={kanji.character}
              character={kanji.character}
              meaning={kanji.meaning}
              reading={[...kanji.kunyomi, ...kanji.onyomi][0] ?? ''}
            />
          </section>
        </div>
      )}
    </div>
  );
}
