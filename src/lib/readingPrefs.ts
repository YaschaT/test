import { useCallback, useState } from 'react';
import { readStorage, writeStorage } from './storage';

/**
 * How much of the meaning is on screen while you read.
 *
 * `hidden` is the default, and it is the whole point: the library teaches the three rules of extensive
 * reading — no dictionary, guess from context, skip what slows you down — and a reader that prints the
 * answer under every line argues against all three. Opening a line is one tap, and the reader counts how
 * many you needed, which turns the crutch into a measurement.
 *
 * `dim` keeps the translation on screen but quiet, for a learner who is not ready to work without it.
 * `shown` is the old behaviour, kept because some people are studying rather than reading.
 */
export type MeaningMode = 'hidden' | 'dim' | 'shown';

export interface ReadingPrefs {
  furigana: boolean;
  romaji: boolean;
  meaning: MeaningMode;
  /** Tategaki — the text set vertically, right to left, the way a Japanese book is. */
  vertical: boolean;
}

const KEY = 'reading-prefs';

const DEFAULTS: ReadingPrefs = {
  furigana: true,
  romaji: false,
  meaning: 'hidden',
  vertical: false,
};

export function getReadingPrefs(): ReadingPrefs {
  // Spread over the defaults so a stored object written by an older build (which had `english` and
  // `dutch` booleans and no `meaning`) still resolves to a complete, valid set.
  return { ...DEFAULTS, ...readStorage<Partial<ReadingPrefs>>(KEY, {}) };
}

export function setReadingPrefs(prefs: ReadingPrefs): void {
  writeStorage(KEY, prefs);
}

/** Reader preferences, remembered between books and between visits. */
export function useReadingPrefs(): [ReadingPrefs, (patch: Partial<ReadingPrefs>) => void] {
  const [prefs, setPrefs] = useState<ReadingPrefs>(getReadingPrefs);

  const update = useCallback((patch: Partial<ReadingPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      setReadingPrefs(next);
      return next;
    });
  }, []);

  return [prefs, update];
}
