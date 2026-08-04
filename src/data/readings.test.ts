import { describe, it, expect } from 'vitest';
import { READINGS } from './readings';
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
