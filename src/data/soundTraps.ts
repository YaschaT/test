/**
 * Sound traps — the reason a sentence gets misheard even when every word in it is already known.
 *
 * Listening failures at N5–N3 are overwhelmingly *phonetic*, not lexical: a swallowed particle, a
 * negative that only exists in the last two syllables, a long vowel clipped short. Naming the specific
 * trap a sentence contains is what turns "I got it wrong" into "I know what my ear skipped."
 *
 * These are matched, not authored per sentence: each trap declares what has to be true of a sentence for
 * it to apply, so every sentence in the vocabulary and grammar sets gets the note that actually fits it
 * with no parallel content set to keep in sync. Nothing matches → no note is shown. The list is ordered
 * most-specific first and exactly one trap is ever surfaced, so the note is the sharpest one available
 * rather than the most generic.
 */

/**
 * What a trap gets to look at.
 *
 * `particles` and `words` are what keep the matching honest. Substring-matching a kana string claims
 * traps that aren't there — 会います contains います, 花 contains は — and a note about the wrong thing is
 * worse than no note. Anything that is really a claim about a *word* is matched against the words.
 */
export interface SoundTrapContext {
  /** The sentence as written, kanji included. */
  japanese: string;
  /** The sentence's full kana reading. */
  kana: string;
  /** Standalone particle words in the sentence. */
  particles: Set<string>;
  /** Every word in the sentence, punctuation dropped. */
  words: string[];
}

export interface SoundTrap {
  id: string;
  /** The confusable pair or pattern itself, shown as the note's headline. */
  title: string;
  body: string;
  applies: (ctx: SoundTrapContext) => boolean;
}

/** Long vowels that get clipped to a short one by a learner's ear, and change the word when they do. */
const LONG_VOWEL = /(こう|そう|とう|ろう|ゆう|きょう|しょう|ちょう|びょう|りょう|じょう|ぎょう|くう|すう|つう)/;

/** The existence verbs as whole words, so 会います and 買います can't be mistaken for います. */
const EXISTENCE_VERB = /^(あります|ありました|ありません|います|いました|いません)$/;

export const SOUND_TRAPS: SoundTrap[] = [
  {
    id: 'kiru-kuru',
    title: '着ます・来ます',
    body: 'Both are said kimasu. The particle in front is the tell: something being worn arrives with を, and coming somewhere arrives with に or へ.',
    applies: (c) => /着(ま|て|る|た)/.test(c.japanese),
  },
  {
    id: 'han-hachi',
    title: 'はん・はち',
    body: 'はち (eight) and はん (half) open on the same は. The ending decides which one it was, so hold your judgement one syllable longer than feels necessary.',
    applies: (c) => /半/.test(c.japanese) || /はん|はち/.test(c.kana),
  },
  {
    id: 'time-ni',
    title: 'に after a clock time',
    body: 'A time takes に and never を or が. It is said fast and low, almost swallowed between the number and the verb — hearing it is how you know a time was given rather than a duration.',
    applies: (c) => /(時|分|時半|曜日)に/.test(c.japanese),
  },
  {
    id: 'position-particle',
    title: '〜の上で・〜の上に',
    body: 'The particle after a position word says what happens there: で marks the place of an action, に marks something simply being there. The position word is identical either way.',
    applies: (c) => /(上|下|中|前|後ろ|横|間|そば|隣)\s*(に|で)/.test(c.japanese),
  },
  {
    id: 'counters',
    title: 'Irregular counters',
    body: 'Small numbers refuse to follow the pattern — ひとり, ふたり, ついたち, はつか. They are memorised as sounds, not assembled from the number you already know.',
    applies: (c) => /(一人|二人|一日|二十日|一つ|二つ|二十歳|一本|一杯|一匹)/.test(c.japanese),
  },
  {
    id: 'masen',
    title: '〜ます・〜ません',
    body: 'The negative lives entirely in the tail of the verb, spoken quickly and quietly at the end of the line. Judge the sentence only once it has finished.',
    applies: (c) => /ません/.test(c.kana) || /ません/.test(c.japanese),
  },
  {
    id: 'tai',
    title: '〜たいです',
    body: 'たい turns the verb into a wish, and it replaces ます. The sentence still ends in です, so the overall shape sounds the same as a plain statement — the difference is mid-word.',
    applies: (c) => /たいです|たくない|たかった/.test(c.kana),
  },
  {
    id: 'te-imasu',
    title: '〜ています・〜ました',
    body: 'Ongoing and finished differ by a syllable in the middle of the ending. ています stretches; ました stops short. The vowel length is your cue.',
    applies: (c) => /ています|ていました|ている/.test(c.kana),
  },
  {
    id: 'mashita',
    title: '〜ます・〜ました',
    body: 'Present and past are one syllable apart at the very end of the line. Nothing earlier in the sentence marks the tense, so the last sound carries all of it.',
    applies: (c) => /ました/.test(c.kana),
  },
  {
    id: 'aru-iru',
    title: 'あります・います',
    body: 'Which verb is used tells you whether the thing is alive, before you have identified the noun. います for people and animals, あります for everything else.',
    applies: (c) => c.words.some((word) => EXISTENCE_VERB.test(word)),
  },
  {
    id: 'wo-particle',
    title: 'を is said お',
    body: 'Written を, pronounced o. It is the quietest sound in the sentence and marks what the verb acts on — miss it and the object and the subject swap places in your head.',
    applies: (c) => c.particles.has('を'),
  },
  {
    id: 'he-particle',
    title: 'へ is said え',
    body: 'As a particle, へ is pronounced e, not he. It marks the direction you are heading — and it sounds nothing like the へ you learned in the kana chart.',
    applies: (c) => c.particles.has('へ'),
  },
  {
    id: 'wa-particle',
    title: 'は is said わ',
    body: 'The topic particle is written は and pronounced wa. It sets what the sentence is about, then almost disappears under the words on either side of it.',
    applies: (c) => c.particles.has('は'),
  },
  {
    id: 'ga-particle',
    title: 'が・は',
    body: 'が points at the thing being talked about, は at what the whole sentence is about. Both are single quiet syllables, and swapping them changes who is doing what.',
    applies: (c) => c.particles.has('が'),
  },
  {
    id: 'ni-particle',
    title: 'に',
    body: 'に is where something ends up — the place you arrive, the person you give to or meet. One quiet syllable that decides the direction the whole sentence points in.',
    applies: (c) => c.particles.has('に'),
  },
  {
    id: 'de-particle',
    title: 'で',
    body: 'で marks where an action happens, or what you did it with. It is easy to lose against the noun in front of it, and losing it turns a place into a thing.',
    applies: (c) => c.particles.has('で'),
  },
  {
    id: 'to-companion',
    title: 'と for company',
    body: 'と links you to the person you did it with, and it lands right after that person — not before the verb, where an English ear expects "with" to go.',
    applies: (c) => c.particles.has('と'),
  },
  {
    id: 'kara-made',
    title: 'から・まで',
    body: 'から is the starting point, まで the end. They sit either side of the same span and are easy to hear as one word when the sentence is running fast.',
    applies: (c) => c.particles.has('から') || c.particles.has('まで'),
  },
  {
    id: 'small-tsu',
    title: 'The small っ',
    body: 'The small っ is a held beat with no sound in it — きて and きって are different words separated by a silence. Count it as a full syllable or the word changes.',
    applies: (c) => /っ/.test(c.kana),
  },
  {
    id: 'long-vowel',
    title: 'Long vowels',
    body: 'A long vowel is two beats, not a stressed one. Clipping it makes a different word — おばさん and おばあさん are aunt and grandmother, and only the length separates them.',
    applies: (c) => LONG_VOWEL.test(c.kana),
  },
  {
    id: 'moraic-n',
    title: 'ん before b, p, m',
    body: 'Before b, p or m, ん is pronounced closer to an m — せんぱい comes out sempai. It is still one full beat of its own, however much it leans on the sound after it.',
    applies: (c) => /ん[ばびぶべぼぱぴぷぺぽまみむめも]/.test(c.kana),
  },
];

/** The single sharpest trap this sentence contains, or `null` when none of them apply. */
export function findSoundTrap(ctx: SoundTrapContext): SoundTrap | null {
  return SOUND_TRAPS.find((trap) => trap.applies(ctx)) ?? null;
}
