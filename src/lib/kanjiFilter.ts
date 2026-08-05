import { getLearningState } from './learningState';
import type { ProgressState } from './progressStore';
import { readStorage, writeStorage } from './storage';
import type { JlptLevel, KanjiEntry } from '../types';

/**
 * Study status a kanji can be filtered by. Every option maps to a real SRS state — nothing here is a
 * label without data behind it.
 */
export type KanjiStatus = 'all' | 'new' | 'learning' | 'due' | 'mastered';

export const KANJI_STATUS_OPTIONS: { value: KanjiStatus; label: string }[] = [
  { value: 'all', label: 'All status' },
  { value: 'new', label: 'Not started' },
  { value: 'learning', label: 'Learning' },
  { value: 'due', label: 'Due for review' },
  { value: 'mastered', label: 'Mastered' },
];

export interface KanjiFilters {
  level: JlptLevel | 'all';
  status: KanjiStatus;
  query: string;
}

export const DEFAULT_KANJI_FILTERS: KanjiFilters = { level: 'all', status: 'all', query: '' };

const STORAGE_KEY = 'kanji-filters';

/**
 * Filters are persisted so the card session opened from the grid can rebuild the *same* deck. Without
 * that, narrowing to (say) N5 and tapping a kanji would page you through all 130 anyway, which makes
 * the filter feel broken. The query is deliberately not persisted — a stale search term silently
 * hiding most of the deck on the next visit would be confusing.
 */
export function loadKanjiFilters(): KanjiFilters {
  const stored = readStorage<Partial<KanjiFilters>>(STORAGE_KEY, {});
  return { ...DEFAULT_KANJI_FILTERS, ...stored, query: '' };
}

export function saveKanjiFilters(filters: KanjiFilters): void {
  writeStorage(STORAGE_KEY, { level: filters.level, status: filters.status });
}

function matchesStatus(id: string, status: KanjiStatus, progress: ProgressState): boolean {
  if (status === 'all') return true;
  const state = getLearningState('kanji', id, progress);
  if (status === 'new') return state === 'new';
  if (status === 'due') return state === 'review';
  if (status === 'mastered') return state === 'mastered';
  // "Learning" is anything started but not yet mature — practice cards, plus ones due again.
  return state === 'practice' || state === 'review';
}

function matchesQuery(kanji: KanjiEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    kanji.character.includes(q) ||
    kanji.onyomi.some((r) => r.toLowerCase().includes(q)) ||
    kanji.kunyomi.some((r) => r.toLowerCase().includes(q)) ||
    kanji.meaning.en.toLowerCase().includes(q) ||
    kanji.meaning.nl.toLowerCase().includes(q)
  );
}

/** Single source of truth for "which kanji are showing" — used by both the grid and the card session. */
export function filterKanji(list: KanjiEntry[], filters: KanjiFilters, progress: ProgressState): KanjiEntry[] {
  return list.filter(
    (k) =>
      (filters.level === 'all' || k.level === filters.level) &&
      matchesStatus(k.id, filters.status, progress) &&
      matchesQuery(k, filters.query),
  );
}
