import { readStorage, writeStorage } from './storage';

const KEY = 'listening-autoplay';

export function getAutoPlayEnabled(): boolean {
  return readStorage<boolean>(KEY, false);
}

export function setAutoPlayEnabled(enabled: boolean): void {
  writeStorage(KEY, enabled);
}
