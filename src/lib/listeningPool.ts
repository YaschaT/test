import { VOCABULARY, VOCABULARY_VERIFIED_ROMAJI } from '../data/vocabulary';
import { GRAMMAR_POINTS } from '../data/grammar';
import type { JlptLevel } from '../types';

export interface ListeningItem {
  id: string;
  japanese: string;
  kana: string;
  romaji: string;
  en: string;
}

function joinText(segments: { text: string }[]): string {
  return segments.map((s) => s.text).join('');
}

function vocabItems(words: typeof VOCABULARY, level?: JlptLevel): ListeningItem[] {
  return words
    .filter((w) => !level || w.level === level)
    .map((w) => ({
      id: `lv-${w.id}`,
      japanese: joinText(w.example.segments),
      kana: w.example.kana,
      romaji: w.example.romaji,
      en: w.example.en,
    }));
}

function grammarItems(level?: JlptLevel): ListeningItem[] {
  return GRAMMAR_POINTS.filter((g) => !level || g.level === level).flatMap((g) =>
    g.examples.map((ex, i) => ({
      id: `lg-${g.id}-${i}`,
      japanese: joinText(ex.segments),
      kana: ex.kana,
      romaji: ex.romaji,
      en: ex.en,
    })),
  );
}

/**
 * Reuses the same original sentences already authored for vocab/grammar — no separate content to keep in
 * sync. Scoped to one JLPT level: the exercise previously drew from every level at once, so an N5 learner
 * could be handed an N3 sentence and have the result filed against N5, which made the accuracy figure
 * measure something other than what it claimed. Omitting `level` returns everything.
 */
export function buildListeningPool(level?: JlptLevel): ListeningItem[] {
  return [...vocabItems(VOCABULARY, level), ...grammarItems(level)];
}

/**
 * The narrower pool dictation draws from: only sentences whose romaji was written by hand.
 *
 * Listen & Select can use everything, because it only ever compares English meanings. Dictation grades
 * the learner's typing against `romaji`, so it can only use sentences where that field is a real
 * transcription — see VOCABULARY_VERIFIED_ROMAJI for why the bulk-imported sets are excluded.
 */
export function buildDictationPool(level?: JlptLevel): ListeningItem[] {
  return [...vocabItems(VOCABULARY_VERIFIED_ROMAJI, level), ...grammarItems(level)];
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Hepburn macrons written the way this app's data spells long vowels. */
const LONG_VOWELS: Record<string, string> = {
  ā: 'aa',
  ī: 'ii',
  ū: 'uu',
  ē: 'ee',
  ō: 'ou',
};

/**
 * Normalises a romaji answer down to the things that actually differ between a right and a wrong
 * transcription, so the exercise tests listening rather than spelling convention.
 *
 * Three conventions vary between textbooks and are all accepted: long vowels written with a macron or
 * doubled (ō / ou), word spacing (Japanese is unspaced, so "watashi wa" and "watashiwa" are equally
 * defensible), and the particles は・へ・を, whose written reading differs from how they are said. The
 * app's data spells those particles as they are written; a learner transcribing what they *heard* types
 * the spoken form, and both are correct.
 *
 * Doubled vowels are deliberately *not* collapsed: おばさん (aunt) and おばあさん (grandmother) differ by
 * exactly that, and treating them as equal would mark a real mistake correct.
 */
export function normalizeForCompare(text: string): string {
  return text
    .toLowerCase()
    .replace(/[āīūēō]/g, (c) => LONG_VOWELS[c] ?? c)
    .replace(/[.,!?'’\-–—。、！？]/g, '')
    .replace(/\bwo\b/g, 'o')
    .replace(/\bha\b/g, 'wa')
    .replace(/\bhe\b/g, 'e')
    .replace(/\s+/g, '')
    .trim();
}

/** Kana answers only need punctuation and spacing removed — the reading itself is unambiguous. */
function normalizeKana(text: string): string {
  return text.replace(/[\s。、！？.,!?]/g, '').trim();
}

/**
 * Whether a typed answer matches the sentence. Kana is accepted alongside romaji: a learner far enough
 * along to type かな should not be forced back through the romaji they are trying to leave behind.
 */
export function matchesDictation(input: string, item: Pick<ListeningItem, 'romaji' | 'kana'>): boolean {
  return (
    normalizeForCompare(input) === normalizeForCompare(item.romaji) ||
    normalizeKana(input) === normalizeKana(item.kana)
  );
}
