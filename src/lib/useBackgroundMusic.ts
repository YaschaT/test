import { useEffect, useState } from 'react';
import { isMusicEnabled, setMusicEnabled, startBackgroundMusic, stopBackgroundMusic } from './music';

export function useBackgroundMusic(): [boolean, () => void] {
  const [enabled, setEnabled] = useState(() => isMusicEnabled());

  useEffect(() => {
    if (enabled) startBackgroundMusic();
    else stopBackgroundMusic();
    return () => stopBackgroundMusic();
  }, [enabled]);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      setMusicEnabled(next);
      return next;
    });
  }

  return [enabled, toggle];
}
