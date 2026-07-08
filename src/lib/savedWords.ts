import { readStorage, writeStorage } from './storage';

const KEY = 'saved-vocab-ids';

export function getSavedWordIds(): string[] {
  return readStorage<string[]>(KEY, []);
}

export function isWordSaved(id: string): boolean {
  return getSavedWordIds().includes(id);
}

export function toggleWordSaved(id: string): boolean {
  const ids = getSavedWordIds();
  const saved = ids.includes(id);
  writeStorage(KEY, saved ? ids.filter((x) => x !== id) : [...ids, id]);
  return !saved;
}
