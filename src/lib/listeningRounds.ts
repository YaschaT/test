import { findSoundTrap, type SoundTrap } from '../data/soundTraps';
import { buildDictationPool, buildListeningPool, shuffle, type ListeningItem } from './listeningPool';
import type { FuriganaSegment, JlptLevel } from '../types';

/**
 * The four things a listening round can ask for. Each one tests a different part of hearing: the meaning
 * as a whole, one grammatical particle inside it, the exact sounds, and the order they arrived in.
 *
 * The mockup this page was built from also carried a short-dialogue round and a picture-match round.
 * Neither exists here: the app has no two-speaker audio and no illustrated vocabulary set, and inventing
 * either would have meant shipping a format with nothing real behind it.
 */
export type RoundKind = 'meaning' | 'gap' | 'dictation' | 'order';

export type SessionMode = 'full' | 'select' | 'dictation';

export const ROUND_LABEL: Record<RoundKind, string> = {
  meaning: 'PICK THE MEANING',
  gap: 'MISSING PARTICLE',
  dictation: 'TYPE WHAT YOU HEAR',
  order: 'PUT IT IN ORDER',
};

export const ROUND_PROMPT: Record<RoundKind, string> = {
  meaning: 'Which meaning did you hear?',
  gap: 'Which particle went by?',
  dictation: 'Write the line you heard.',
  order: 'Rebuild the sentence you heard.',
};

/** One printable word: a kanji chunk plus whatever kana trailed it, with the reading merged to match. */
export interface SentenceWord {
  text: string;
  /** Furigana for the whole word. Empty when the word has no kanji in it. */
  reading: string;
}

export interface ListeningRound {
  /** Unique within a session — the same sentence can legitimately appear in two different formats. */
  key: string;
  kind: RoundKind;
  item: ListeningItem;
  /** The sentence broken into words, for the answer breakdown and the sentence-order bank. */
  words: SentenceWord[];
  /** The word the round turns on — highlighted in the breakdown. `-1` when the round has no single one. */
  focusIndex: number;
  /** The trap this sentence contains, if any. */
  trap: SoundTrap | null;
  /** `meaning` and `gap`: the buttons, already shuffled. */
  choices: string[];
  /** Index into `choices`. `-1` for the formats that are not multiple choice. */
  correctIndex: number;
  /** `gap`: the sentence with the tested particle replaced by a blank. */
  gapPrompt: string;
  /** `order`: word indices in the order they are offered in the bank, i.e. deliberately not the answer. */
  bank: number[];
}

/**
 * Punctuation is part of the sentence but never a word you rebuild, blank out, or put furigana over.
 * Stripped per character rather than per segment: the authored data attaches the full stop to the kana
 * that precedes it (`軽` + `い。`), so dropping only punctuation-only segments left words like 「軽い。」
 * on the answer chips and in the sentence-order bank.
 */
const PUNCTUATION = /[。、！？…「」『』・（）\s]/g;

/** Punctuation at a segment's end is also a word boundary — 「トム、」 must not fuse with what follows. */
const ENDS_IN_PUNCTUATION = /[。、！？…「」『』・（）\s]$/;

const KANJI = /[一-龯㐀-䶿]/;

/**
 * Particles that stand alone as a word. Anything else made of kana attaches to the word before it, which
 * is what separates okurigana (着 + ます) from a real particle (映画 + を).
 */
const PARTICLES = new Set([
  'は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'の', 'や', 'か', 'ね', 'よ', 'な',
  'から', 'まで', 'より', 'など', 'だけ', 'しか', 'ほど', 'ばかり', 'でも', 'とか',
]);

/**
 * The particles a "missing particle" round is allowed to test and to offer as wrong answers. Kept to the
 * case-marking core: these are the ones that change who did what to whom, and the ones a learner's ear
 * genuinely loses. Sentence-final particles like ね and よ are excluded — missing one costs you nothing.
 */
const TESTABLE_PARTICLES = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'から', 'まで'] as const;

/**
 * Groups the authored furigana segments into words.
 *
 * The data splits a sentence at kanji boundaries (`手伝` + `って`), which is right for rendering ruby text
 * but wrong for everything this page does with it: nobody rebuilds a sentence out of half-verbs. A kana
 * segment therefore merges into the word before it — carrying its sound onto that word's reading so the
 * furigana stays correct — unless it is a standalone particle, which is exactly the boundary that matters.
 */
export function segmentWords(segments: FuriganaSegment[]): SentenceWord[] {
  const words: SentenceWord[] = [];

  // Set by the punctuation the previous segment carried: whatever comes next starts a new word, because
  // the mark that separated them is gone from the output but the separation it marked is real.
  let boundary = false;

  for (const segment of segments) {
    const text = segment.text.replace(PUNCTUATION, '');
    if (text === '') {
      boundary = true;
      continue;
    }

    const previous = words[words.length - 1];
    const hasKanji = KANJI.test(text);
    const startsNewWord = boundary || hasKanji || PARTICLES.has(text) || !previous || PARTICLES.has(previous.text);
    boundary = ENDS_IN_PUNCTUATION.test(segment.text);

    if (startsNewWord) {
      words.push({ text, reading: hasKanji ? (segment.reading ?? '').replace(PUNCTUATION, '') : '' });
      continue;
    }

    // Trailing kana: append it to the word, and to the reading too — but only if that word already has a
    // reading to extend. A kana-only word needs no furigana, and half a reading is worse than none.
    previous.text += text;
    if (previous.reading) previous.reading += text;
  }

  return words;
}

function trapFor(item: ListeningItem, words: SentenceWord[]): SoundTrap | null {
  return findSoundTrap({
    japanese: item.japanese,
    kana: item.kana,
    particles: new Set(words.filter((w) => PARTICLES.has(w.text)).map((w) => w.text)),
    words: words.map((w) => w.text),
  });
}

/** Three plausible wrong meanings from the same level, so the options aren't decided by topic alone. */
function meaningChoices(item: ListeningItem, pool: ListeningItem[]): string[] {
  const distractors = shuffle(pool.filter((p) => p.en !== item.en))
    .slice(0, 3)
    .map((p) => p.en);
  return shuffle([item.en, ...distractors]);
}

function baseRound(item: ListeningItem, kind: RoundKind): ListeningRound {
  const words = segmentWords(item.segments);
  return {
    key: `${kind}:${item.id}`,
    kind,
    item,
    words,
    focusIndex: -1,
    trap: trapFor(item, words),
    choices: [],
    correctIndex: -1,
    gapPrompt: '',
    bank: [],
  };
}

/**
 * Blanks out one case particle. Returns null when the sentence has no particle worth testing — plenty of
 * short sentences don't, and a round has to be dropped rather than padded with something arbitrary.
 */
function buildGapRound(item: ListeningItem): ListeningRound | null {
  const round = baseRound(item, 'gap');
  const candidates = round.words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => (TESTABLE_PARTICLES as readonly string[]).includes(word.text));
  if (candidates.length === 0) return null;

  // The last case particle in the sentence, which is the one closest to the verb and so the one carrying
  // the most grammatical weight — and, being sandwiched between two words, the hardest to hear.
  const target = candidates[candidates.length - 1];
  const answer = target.word.text;
  const distractors = shuffle(TESTABLE_PARTICLES.filter((p) => p !== answer)).slice(0, 3);
  const choices = shuffle([answer, ...distractors]);

  return {
    ...round,
    focusIndex: target.index,
    choices,
    correctIndex: choices.indexOf(answer),
    gapPrompt: round.words.map((word, index) => (index === target.index ? '◯' : word.text)).join(''),
  };
}

/** Rebuilding needs enough words to be a puzzle and few enough to stay a listening test, not a memory one. */
function buildOrderRound(item: ListeningItem): ListeningRound | null {
  const round = baseRound(item, 'order');
  if (round.words.length < 3 || round.words.length > 7) return null;

  const indices = round.words.map((_, index) => index);
  let bank = shuffle(indices);
  // A bank that happens to come out already in order isn't a puzzle. One reshuffle is enough in practice;
  // if it lands in order twice, rotating it guarantees a different arrangement without another loop.
  if (bank.every((value, index) => value === index)) bank = shuffle(indices);
  if (bank.every((value, index) => value === index)) bank = [...bank.slice(1), bank[0]];

  return { ...round, bank };
}

function buildMeaningRound(item: ListeningItem, pool: ListeningItem[]): ListeningRound {
  const round = baseRound(item, 'meaning');
  const choices = meaningChoices(item, pool);
  return { ...round, choices, correctIndex: choices.indexOf(item.en) };
}

function buildDictationRound(item: ListeningItem): ListeningRound {
  return baseRound(item, 'dictation');
}

/** Which formats each mode draws on. `full` is every format the app can actually build a round from. */
const MODE_KINDS: Record<SessionMode, RoundKind[]> = {
  full: ['meaning', 'gap', 'dictation', 'order'],
  select: ['meaning', 'gap'],
  dictation: ['dictation', 'order'],
};

export const MODE_LABEL: Record<SessionMode, string> = {
  full: 'Full session',
  select: 'Listen & select',
  dictation: 'Dictation',
};

/**
 * Builds one session.
 *
 * Formats are dealt round-robin rather than picked at random per item, so a mixed session is genuinely
 * mixed instead of occasionally handing out eight dictations in a row. Each sentence is used once at
 * most: the same line coming back in a second format later in the same eight is a memory test.
 *
 * Dictation and sentence-order rounds are grammatically stricter than the other two — the first grades
 * typed romaji, the second needs a sentence of a workable length — so they draw from narrower pools and
 * can decline an item. When a format runs out of usable sentences the session simply carries on with the
 * others rather than shrinking.
 */
export function buildSession(mode: SessionMode, level: JlptLevel, size: number): ListeningRound[] {
  const pool = buildListeningPool(level);
  if (pool.length === 0) return [];

  const wide = shuffle(pool);
  const narrow = shuffle(buildDictationPool(level));
  const kinds = MODE_KINDS[mode];

  // Per-format queues, so a format that keeps rejecting sentences can't consume another format's supply.
  const queues: Record<RoundKind, ListeningItem[]> = {
    meaning: [...wide],
    gap: [...wide],
    dictation: [...narrow],
    order: [...wide],
  };

  const rounds: ListeningRound[] = [];
  const usedIds = new Set<string>();
  let kindIndex = 0;
  let exhausted = 0;

  while (rounds.length < size && exhausted < kinds.length) {
    const kind = kinds[kindIndex % kinds.length];
    kindIndex += 1;

    const queue = queues[kind];
    let built: ListeningRound | null = null;

    while (queue.length > 0 && !built) {
      const item = queue.pop()!;
      if (usedIds.has(item.id)) continue;
      built =
        kind === 'meaning'
          ? buildMeaningRound(item, pool)
          : kind === 'gap'
            ? buildGapRound(item)
            : kind === 'dictation'
              ? buildDictationRound(item)
              : buildOrderRound(item);
    }

    if (built) {
      usedIds.add(built.item.id);
      rounds.push(built);
      exhausted = 0;
    } else {
      exhausted += 1;
    }
  }

  return rounds;
}
