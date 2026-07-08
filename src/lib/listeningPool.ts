import { VOCABULARY } from '../data/vocabulary';
import { GRAMMAR_POINTS } from '../data/grammar';

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

/** Reuses the same original sentences already authored for vocab/grammar — no separate content to keep in sync. */
export function buildListeningPool(): ListeningItem[] {
  const fromVocab = VOCABULARY.map((w) => ({
    id: `lv-${w.id}`,
    japanese: joinText(w.example.segments),
    kana: w.example.kana,
    romaji: w.example.romaji,
    en: w.example.en,
  }));
  const fromGrammar = GRAMMAR_POINTS.flatMap((g) =>
    g.examples.map((ex, i) => ({
      id: `lg-${g.id}-${i}`,
      japanese: joinText(ex.segments),
      kana: ex.kana,
      romaji: ex.romaji,
      en: ex.en,
    })),
  );
  return [...fromVocab, ...fromGrammar];
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Loose match: case/space/punctuation-insensitive, forgiving for a romaji-typing dictation exercise. */
export function normalizeForCompare(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?。、]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
