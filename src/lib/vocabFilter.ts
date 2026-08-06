import { readStorage, writeStorage } from './storage';
import type { JlptLevel, VocabWord } from '../types';

export interface VocabFilters {
  level: JlptLevel | 'all';
  category: string;
  query: string;
}

export const DEFAULT_VOCAB_FILTERS: VocabFilters = { level: 'all', category: 'all', query: '' };

const STORAGE_KEY = 'vocab-filters';

/**
 * Filters are persisted so the card session opened from the grid can rebuild the *same* deck. Without
 * that, narrowing to (say) Food and tapping a word would page you through all 1000, which makes the
 * filter feel broken. The query is deliberately not persisted — a stale search term silently hiding most
 * of the deck on the next visit would be confusing. Mirrors kanjiFilter so both modules behave alike.
 */
export function loadVocabFilters(): VocabFilters {
  const stored = readStorage<Partial<VocabFilters>>(STORAGE_KEY, {});
  return { ...DEFAULT_VOCAB_FILTERS, ...stored, query: '' };
}

export function saveVocabFilters(filters: VocabFilters): void {
  writeStorage(STORAGE_KEY, { level: filters.level, category: filters.category });
}

function matchesQuery(word: VocabWord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    word.japanese.toLowerCase().includes(q) ||
    word.kana.toLowerCase().includes(q) ||
    word.romaji.toLowerCase().includes(q) ||
    word.meaning.en.toLowerCase().includes(q) ||
    word.meaning.nl.toLowerCase().includes(q)
  );
}

/** Single source of truth for "which words are showing" — used by both the grid and the card session. */
export function filterVocabulary(list: VocabWord[], filters: VocabFilters): VocabWord[] {
  return list.filter(
    (w) =>
      (filters.level === 'all' || w.level === filters.level) &&
      (filters.category === 'all' || w.category === filters.category) &&
      matchesQuery(w, filters.query),
  );
}
