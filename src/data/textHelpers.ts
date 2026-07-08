import type { ExampleSentence, FuriganaSegment } from '../types';

export function s(text: string, reading?: string): FuriganaSegment {
  return reading ? { text, reading } : { text };
}

export function sentence(
  segments: FuriganaSegment[],
  kana: string,
  romaji: string,
  en: string,
  nl: string,
): ExampleSentence {
  return { segments, kana, romaji, en, nl };
}
