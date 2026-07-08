import { useEffect, useState } from 'react';
import { readStorage, writeStorage } from './storage';

const KEY = 'dark-mode';

function initialDark(): boolean {
  return readStorage(KEY, window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
}

export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(initialDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    writeStorage(KEY, dark);
  }, [dark]);

  return [dark, () => setDark((d) => !d)];
}
