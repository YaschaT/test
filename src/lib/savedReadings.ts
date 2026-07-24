import { readStorage, writeStorage } from './storage';

const KEY = 'saved-reading-ids';

export function getSavedReadingIds(): string[] {
  return readStorage<string[]>(KEY, []);
}

export function isReadingSaved(id: string): boolean {
  return getSavedReadingIds().includes(id);
}

export function toggleReadingSaved(id: string): boolean {
  const ids = getSavedReadingIds();
  const saved = ids.includes(id);
  writeStorage(KEY, saved ? ids.filter((x) => x !== id) : [...ids, id]);
  return !saved;
}
