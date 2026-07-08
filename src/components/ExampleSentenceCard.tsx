import type { ExampleSentence } from '../types';
import { JapaneseText } from './JapaneseText';
import { Bilingual } from './Bilingual';
import type { DisplayPrefs } from './DisplayToggles';

/** Shared between Grammar and Kanji's lesson detail pages — a subtle brand-tinted glow (not a gray
 * shadow, per DESIGN.md's elevation rule) and a larger Japanese sentence size, since the sentence is the
 * actual thing being studied here and deserves more visual weight than its translation. */
export function ExampleSentenceCard({ example, prefs }: { example: ExampleSentence; prefs: DisplayPrefs }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-[0_4px_16px_-8px_rgba(58,84,214,0.35)] dark:shadow-[0_4px_16px_-6px_rgba(58,84,214,0.25)]">
      <JapaneseText segments={example.segments} showFurigana={prefs.furigana} className="text-xl sm:text-2xl" />
      {prefs.romaji && <p className="text-sm text-brand-600 dark:text-brand-300 mt-1.5">{example.romaji}</p>}
      <div className="mt-3">
        <Bilingual text={{ en: example.en, nl: example.nl }} />
      </div>
    </div>
  );
}
