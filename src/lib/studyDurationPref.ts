import { readStorage, writeStorage } from './storage';

const KEY = 'study-duration-minutes';
const DEFAULT_MINUTES = 60;

export function getSavedStudyMinutes(): number {
  return readStorage<number>(KEY, DEFAULT_MINUTES);
}

export function saveStudyMinutes(minutes: number): void {
  writeStorage(KEY, minutes);
}
