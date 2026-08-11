import { describe, expect, it } from 'vitest';
import { buildSession, segmentWords, type SessionMode } from './listeningRounds';
import { findSoundTrap } from '../data/soundTraps';
import { JLPT_LEVELS } from '../types';

const s = (text: string, reading?: string) => ({ text, reading });

describe('segmentWords', () => {
  it('merges okurigana into the word it belongs to, and its reading with it', () => {
    expect(segmentWords([s('手伝', 'てつだ'), s('って')])).toEqual([{ text: '手伝って', reading: 'てつだって' }]);
  });

  it('keeps a standalone particle as its own word', () => {
    expect(segmentWords([s('映画', 'えいが'), s('を'), s('見', 'み'), s('ました')])).toEqual([
      { text: '映画', reading: 'えいが' },
      { text: 'を', reading: '' },
      { text: '見ました', reading: 'みました' },
    ]);
  });

  it('drops punctuation, which is never a word you rebuild or hear', () => {
    expect(segmentWords([s('こんにちは'), s('、'), s('元気', 'げんき'), s('です'), s('か'), s('。')])).toEqual([
      { text: 'こんにちは', reading: '' },
      { text: '元気です', reading: 'げんきです' },
      { text: 'か', reading: '' },
    ]);
  });

  it('strips punctuation that the data attached to a word, not just punctuation-only segments', () => {
    // 「軽」+「い。」 — the full stop rides along inside a kana segment, and used to end up on the word.
    expect(segmentWords([s('この'), s('椅子', 'いす'), s('は'), s('軽', 'かる'), s('い。')])).toEqual([
      { text: 'この', reading: '' },
      { text: '椅子', reading: 'いす' },
      { text: 'は', reading: '' },
      { text: '軽い', reading: 'かるい' },
    ]);
  });

  it('keeps the boundary a dropped comma marked instead of fusing the words around it', () => {
    // 「トム、そこの醤油取って。」 — dropping the comma used to glue トム and そこ into one tile.
    expect(segmentWords([s('トム'), s('、'), s('そこ'), s('の'), s('醤油', 'しょうゆ'), s('取', 'と'), s('って。')])).toEqual([
      { text: 'トム', reading: '' },
      { text: 'そこ', reading: '' },
      { text: 'の', reading: '' },
      { text: '醤油', reading: 'しょうゆ' },
      { text: '取って', reading: 'とって' },
    ]);
  });

  it('leaves a kana-only word without furigana rather than half a reading', () => {
    expect(segmentWords([s('ここ'), s('から')])).toEqual([
      { text: 'ここ', reading: '' },
      { text: 'から', reading: '' },
    ]);
  });
});

describe('findSoundTrap', () => {
  const ctx = (japanese: string, kana: string, words: string[]) => ({
    japanese,
    kana,
    words,
    particles: new Set(words.filter((w) => ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'から', 'まで'].includes(w))),
  });

  it('matches a particle only when it stands alone as a word', () => {
    expect(findSoundTrap(ctx('本を読みます', 'ほんをよみます', ['本', 'を', '読みます']))?.id).toBe('wo-particle');

    // はな contains は, but no は particle was spoken — a substring match would wrongly claim one.
    expect(findSoundTrap(ctx('花', 'はな', ['花']))?.id).not.toBe('wa-particle');
  });

  it('does not mistake a verb ending in います for the existence verb', () => {
    // 会います contains います. Matching the kana as a substring used to claim the あります・います trap on a
    // sentence with no existence verb anywhere in it.
    const trap = findSoundTrap(ctx('駅で友達に会います', 'えきでともだちにあいます', ['駅', 'で', '友達', 'に', '会います']));
    expect(trap?.id).not.toBe('aru-iru');

    expect(findSoundTrap(ctx('猫がいます', 'ねこがいます', ['猫', 'が', 'います']))?.id).toBe('aru-iru');
  });

  it('prefers the most specific trap over a general one', () => {
    // The sentence also carries a を particle and a ます ending; the 着る/来る confusion is the sharper note.
    const trap = findSoundTrap(ctx('コートを着ます', 'こーとをきます', ['コート', 'を', '着ます']));
    expect(trap?.id).toBe('kiru-kuru');
  });

  it('returns null when a sentence contains nothing worth warning about', () => {
    expect(findSoundTrap(ctx('ねこ', 'ねこ', ['ねこ']))).toBeNull();
  });
});

describe('buildSession', () => {
  const modes: SessionMode[] = ['full', 'select', 'dictation'];

  it.each(JLPT_LEVELS)('fills a full session at %s in every mode', (level) => {
    for (const mode of modes) {
      const rounds = buildSession(mode, level, 8);
      expect(rounds).toHaveLength(8);
    }
  });

  it('never repeats a sentence within one session', () => {
    const rounds = buildSession('full', 'N5', 8);
    expect(new Set(rounds.map((r) => r.item.id)).size).toBe(rounds.length);
  });

  it('mixes the formats a mode covers rather than dealing one of them repeatedly', () => {
    expect(new Set(buildSession('full', 'N5', 8).map((r) => r.kind)).size).toBeGreaterThan(1);
    expect(new Set(buildSession('select', 'N5', 8).map((r) => r.kind))).toEqual(new Set(['meaning', 'gap']));
    expect(new Set(buildSession('dictation', 'N5', 8).map((r) => r.kind))).toEqual(new Set(['dictation', 'order']));
  });

  it('gives every multiple-choice round four options with exactly one right answer', () => {
    for (const round of buildSession('select', 'N5', 8)) {
      expect(round.choices).toHaveLength(4);
      expect(round.correctIndex).toBeGreaterThanOrEqual(0);
      if (round.kind === 'gap') expect(new Set(round.choices).size).toBe(4);
    }
  });

  it('blanks a real particle out of the sentence it tests', () => {
    for (const round of buildSession('select', 'N5', 8).filter((r) => r.kind === 'gap')) {
      const answer = round.choices[round.correctIndex];
      expect(round.words[round.focusIndex].text).toBe(answer);
      expect(round.gapPrompt).toContain('◯');
      expect(round.gapPrompt).toBe(round.words.map((w, i) => (i === round.focusIndex ? '◯' : w.text)).join(''));
    }
  });

  it('offers a sentence-order bank holding every word exactly once, not already in order', () => {
    for (const round of buildSession('dictation', 'N5', 8).filter((r) => r.kind === 'order')) {
      expect([...round.bank].sort()).toEqual(round.words.map((_, i) => i).sort());
      expect(round.bank.every((value, i) => value === i)).toBe(false);
      expect(round.words.length).toBeGreaterThanOrEqual(3);
      expect(round.words.length).toBeLessThanOrEqual(7);
    }
  });
});
