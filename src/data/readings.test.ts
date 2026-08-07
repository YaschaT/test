import { describe, it, expect } from 'vitest';
import { READINGS, readingMinutes } from './readings';
import { getVocabWord } from './vocabulary';
import { getGrammarPoint } from './grammar';
import { TADOKU_LEVELS } from '../types';

describe('reading library (Tadoku graded readers)', () => {
  it('gives every book a valid Tadoku level 0–5', () => {
    for (const r of READINGS) {
      expect(TADOKU_LEVELS, `${r.id}: tadokuLevel ${r.tadokuLevel} out of range`).toContain(
        r.tadokuLevel,
      );
    }
  });

  it('gives every book a positive word count and a cover', () => {
    for (const r of READINGS) {
      expect(r.wordCount, `${r.id}: wordCount must be > 0`).toBeGreaterThan(0);
      expect(r.coverEmoji.length, `${r.id}: coverEmoji missing`).toBeGreaterThan(0);
    }
  });

  it('gives every book a Japanese title', () => {
    for (const r of READINGS) {
      expect(r.titleJa.trim().length, `${r.id}: titleJa missing`).toBeGreaterThan(0);
      // The shelf leads with this, so it has to actually be Japanese — a romaji or English string
      // slipping in would show up as a book whose "Japanese" title is its English one.
      expect(r.titleJa, `${r.id}: titleJa "${r.titleJa}" has no kana or kanji`).toMatch(
        /[぀-ゟ゠-ヿ一-鿿]/,
      );
    }
  });

  it('points every painted cover at a file that exists', () => {
    // Globbed off disk rather than hardcoded, so a renamed or deleted artwork file fails here
    // instead of silently becoming a broken image on the shelf.
    const onDisk = new Set(
      Object.keys(import.meta.glob('../../public/assets/reading/covers/*.webp')).map(
        (path) => path.split('/').pop()!,
      ),
    );
    expect(onDisk.size, 'no cover artwork found on disk').toBeGreaterThan(0);

    for (const r of READINGS) {
      if (!r.cover) continue;
      expect(r.cover, `${r.id}: cover must live under /assets/reading/covers/`).toMatch(
        /^\/assets\/reading\/covers\/[\w-]+\.webp$/,
      );
      expect(onDisk, `${r.id}: cover file ${r.cover} is missing from public/`).toContain(
        r.cover.split('/').pop()!,
      );
    }
  });

  it('estimates reading time from word count, never below a minute', () => {
    expect(readingMinutes(11)).toBe(1);
    expect(readingMinutes(1)).toBe(1);
    expect(readingMinutes(60)).toBe(3);
  });

  it('has unique book ids and unique question ids', () => {
    const bookIds = READINGS.map((r) => r.id);
    expect(new Set(bookIds).size, 'duplicate book id').toBe(bookIds.length);
    const qIds = READINGS.flatMap((r) => r.questions.map((q) => q.id));
    expect(new Set(qIds).size, 'duplicate question id').toBe(qIds.length);
  });

  it('gives every question a correctIndex that points at a real option', () => {
    for (const r of READINGS) {
      for (const q of r.questions) {
        expect(q.correctIndex, `${q.id}: correctIndex out of range`).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex, `${q.id}: correctIndex out of range`).toBeLessThan(q.options.length);
      }
    }
  });

  it('resolves every vocab and grammar highlight id', () => {
    for (const r of READINGS) {
      for (const vid of r.vocabHighlightIds) {
        expect(getVocabWord(vid), `${r.id}: vocab highlight ${vid} does not resolve`).toBeTruthy();
      }
      for (const gid of r.grammarHighlightIds) {
        expect(getGrammarPoint(gid), `${r.id}: grammar highlight ${gid} does not resolve`).toBeTruthy();
      }
    }
  });
});
