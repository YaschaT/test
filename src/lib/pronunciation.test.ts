import { describe, expect, it } from 'vitest';
import { scoreAttempt, scoreBand, similarity, toComparable } from './pronunciation';

describe('toComparable', () => {
  it('folds katakana onto hiragana', () => {
    expect(toComparable('コーヒー')).toBe(toComparable('こーひー'));
  });

  it('drops punctuation, spaces and stray latin', () => {
    expect(toComparable('「あたためますか。」 ok')).toBe('あたためますか');
  });

  it('keeps kanji, so a recognised 大丈夫です still carries its characters', () => {
    expect(toComparable('大丈夫です')).toBe('大丈夫です');
  });
});

describe('similarity', () => {
  it('scores an exact match 100', () => {
    expect(similarity('こんにちは', 'こんにちは')).toBe(100);
  });

  it('ignores the recogniser adding a trailing particle', () => {
    expect(similarity('ふくろはいりますか ね', 'ふくろはいりますか')).toBe(100);
  });

  it('scores a near miss below a match but well above zero', () => {
    const score = similarity('あたためます', 'あたためますか');
    expect(score).toBeGreaterThan(60);
    expect(score).toBeLessThan(100);
  });

  it('scores an unrelated line low', () => {
    expect(similarity('おはようございます', 'カードでおねがいします')).toBeLessThan(40);
  });

  it('scores nothing heard as zero', () => {
    expect(similarity('', 'こんにちは')).toBe(0);
  });
});

describe('scoreAttempt', () => {
  it('takes the best hypothesis, not the first', () => {
    const result = scoreAttempt(['ありがとう', 'ありがとうございます'], ['ありがとうございます']);
    expect(result).toEqual({ score: 100, heard: 'ありがとうございます' });
  });

  it('matches the kana reading when the recogniser wrote kanji', () => {
    const result = scoreAttempt(['大丈夫です'], ['大丈夫です', 'だいじょうぶです']);
    expect(result.score).toBe(100);
  });

  it('reports what was heard even when nothing matched', () => {
    const result = scoreAttempt(['ぜんぜんちがう'], ['こんにちは']);
    expect(result.heard).toBe('ぜんぜんちがう');
  });

  it('returns an empty attempt when the mic picked nothing up', () => {
    expect(scoreAttempt([' ', ''], ['こんにちは'])).toEqual({ score: 0, heard: '' });
  });
});

describe('scoreBand', () => {
  it('bands scores for the bar colour', () => {
    expect(scoreBand(92)).toBe('good');
    expect(scoreBand(78)).toBe('close');
    expect(scoreBand(41)).toBe('off');
  });
});
