import type {
  FuriganaSegment,
  GrammarDrill,
  GrammarDrillTier,
  GrammarPoint,
  SrsRating,
  Translatable,
} from '../types';
import { GRAMMAR_DRILL_TIERS } from '../types';
import { getGrammarLessonExtras } from '../data/grammarLessons';
import { daysBetween, todayIso } from './date';

/** Seconds on the clock for a JLPT-format item. */
export const EXAM_SECONDS = 25;

export const TIER_NAME: Record<GrammarDrillTier, Translatable> = {
  recognise: { en: 'Recognise', nl: 'Herkennen' },
  produce: { en: 'Produce', nl: 'Zelf maken' },
  reallife: { en: 'Real life', nl: 'In het echt' },
  exam: { en: 'Exam sprint', nl: 'Examensprint' },
};

/** Shown once, the first time a tier opens — it explains what just changed about the questions. */
export const TIER_UNLOCK: Record<GrammarDrillTier, Translatable> = {
  recognise: {
    en: 'Spot the pattern before you have to make it.',
    nl: 'Herken het patroon voordat je het zelf moet maken.',
  },
  produce: {
    en: 'You can spot the pattern. Now build it yourself — typing, ordering, correcting.',
    nl: 'Je herkent het patroon. Nu bouw je het zelf — typen, ordenen, verbeteren.',
  },
  reallife: {
    en: 'Situations you will actually meet: listening, conversation, and translating cold.',
    nl: 'Situaties die je echt tegenkomt: luisteren, gesprekken en vertalen zonder aanloop.',
  },
  exam: {
    en: `JLPT format from here: kana only, no hints, ${EXAM_SECONDS} seconds a question.`,
    nl: `Vanaf hier JLPT-formaat: alleen kana, geen hints, ${EXAM_SECONDS} seconden per vraag.`,
  },
};

/**
 * Trailing punctuation and spaces are noise when the learner is being asked for a *sentence*, so both
 * sides of a typed comparison are stripped of them. Full-width and half-width marks both, because a
 * Japanese IME produces 。 and a Latin keyboard produces "." for the same intent.
 */
export function normalizeTyped(text: string): string {
  return (text ?? '').replace(/[\s。．.、,！!？?・]/g, '');
}

/** Whether a typed answer matches any accepted spelling. */
export function typedMatches(typed: string, accepts: string[]): boolean {
  const t = normalizeTyped(typed);
  return t.length > 0 && accepts.some((a) => normalizeTyped(a) === t);
}

/** The kanji form of an example, without its closing punctuation. */
function exampleJapanese(point: GrammarPoint, index: number): string {
  return point.examples[index].segments.map((s) => s.text).join('');
}

/**
 * Particles that stand alone as their own tile. Everything else that is kana-only attaches to the
 * kanji chunk in front of it, which is what keeps 行 + きましょう from being torn into two tiles.
 */
const STANDALONE_PARTICLES = new Set([
  'は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ', 'の', 'や', 'か', 'ね', 'よ',
  'から', 'まで', 'より', 'など',
]);

const PUNCTUATION = new Set(['。', '、', '！', '？', '．', '，']);

/** Tiles need to be worth ordering: two is not a puzzle, eight is a chore. */
const MIN_TILES = 3;
const MAX_TILES = 7;

/**
 * Chunks an example sentence into orderable tiles, or returns null when it cannot do it well.
 *
 * The source segments are cut for *furigana*, not for meaning — 「行」and「きましょう」are two
 * segments because only the first carries a reading. Ordering those as separate tiles would be a
 * puzzle about okurigana rather than about the pattern, so a kana-only segment merges into the chunk
 * in front of it unless it is a standalone particle. Punctuation is dropped.
 *
 * Returning null rather than forcing a result is the point: where the rule produces too few or too
 * many tiles, the point simply doesn't get a build drill.
 */
export function tilesFromSegments(segments: FuriganaSegment[]): string[] | null {
  const tiles: string[] = [];
  let lastWasParticle = false;
  // True right after punctuation: whatever comes next opens a new chunk.
  let atBoundary = true;
  // Set by a one-character kana prefix that just opened a chunk (the ご of ご飯, the お of お茶):
  // the kanji behind it finishes that word instead of starting a new tile.
  let openPrefix = false;

  segments.forEach((segment, i) => {
    const text = segment.text;
    if (PUNCTUATION.has(text)) {
      atBoundary = true;
      return;
    }

    const isParticle = STANDALONE_PARTICLES.has(text);
    const startsChunk =
      !!segment.reading || // carries furigana, so it opens a new chunk
      isParticle ||
      isKatakana(text) || // a loanword is its own word, never a tail on the chunk before it
      lastWasParticle || // nothing hangs off a bare particle
      atBoundary ||
      tiles.length === 0;

    // The kanji a prefix was waiting for finishes that word rather than starting its own tile.
    const opened = startsChunk && !(segment.reading && openPrefix);
    if (opened) tiles.push(text);
    else tiles[tiles.length - 1] += text;

    const next = segments[i + 1];
    openPrefix = opened && !segment.reading && !isParticle && text.length === 1 && !!next?.reading;
    lastWasParticle = isParticle;
    atBoundary = false;
  });

  if (tiles.length < MIN_TILES || tiles.length > MAX_TILES) return null;
  return tiles;
}

function isKatakana(text: string): boolean {
  return /^[\u30a0-\u30ff\u30fc]+$/.test(text);
}

/**
 * A stable shuffle: the same drill id always produces the same tile order, so a re-render (or a
 * "Try again") never silently rearranges the pool under the learner's fingers.
 */
export function stableShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    h = (Math.imul(h, 48271) + 11) % 2147483647;
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The practice ladder for a point that has no authored drills yet.
 *
 * Every item here is built out of that point's own real content — its authored quiz questions and its
 * authored example sentences — so a point without a hand-written ladder still gets a genuine three-tier
 * session rather than a placeholder. Tiers that cannot be built from the available material are simply
 * absent; nothing is invented to fill them.
 */
export function deriveDrills(point: GrammarPoint): GrammarDrill[] {
  const drills: GrammarDrill[] = [];
  const structure: Translatable = { en: point.structure, nl: point.structure };

  // Tier 1 — the point's own multiple-choice questions.
  for (const q of point.quiz) {
    drills.push({
      id: `${point.id}-quiz-${q.id}`,
      tier: 'recognise',
      kind: 'choice',
      instruction: q.prompt,
      promptJapanese: q.japanesePrompt,
      options: q.options.map((japanese) => ({ japanese })),
      answerIndex: q.correctIndex,
      rule: structure,
      why: q.explanation ?? point.explanation,
    });
  }

  // Pairing sentences with meanings needs a real spread of options to be worth doing.
  if (point.examples.length >= 3) {
    drills.push({
      id: `${point.id}-match`,
      tier: 'recognise',
      kind: 'match',
      instruction: { en: 'Match each sentence to its meaning.', nl: 'Koppel elke zin aan de betekenis.' },
      pairs: point.examples.slice(0, 4).map((ex, i) => ({
        japanese: exampleJapanese(point, i),
        meaning: { en: ex.en, nl: ex.nl },
      })),
      rule: structure,
      why: point.explanation,
    });
  }

  // Tier 2 — produce each example sentence from its meaning.
  point.examples.slice(0, 3).forEach((ex, i) => {
    drills.push({
      id: `${point.id}-say-${i}`,
      tier: 'produce',
      kind: 'type',
      instruction: { en: 'Say it in Japanese.', nl: 'Zeg het in het Japans.' },
      promptEn: { en: `“${ex.en}”`, nl: `“${ex.nl}”` },
      accepts: [exampleJapanese(point, i), ex.kana],
      hint: { en: ex.romaji, nl: ex.romaji },
      placeholder: point.examples[i].segments[0]?.text ?? '',
      rule: structure,
      why: point.explanation,
    });
  });

  // Tier 2 — put the same sentences back together from their own chunks, where they chunk cleanly.
  point.examples.slice(0, 2).forEach((ex, i) => {
    const tiles = tilesFromSegments(ex.segments);
    if (!tiles) return;
    drills.push({
      id: `${point.id}-order-${i}`,
      tier: 'produce',
      kind: 'build',
      instruction: { en: 'Build the sentence.', nl: 'Bouw de zin.' },
      promptEn: { en: `“${ex.en}”`, nl: `“${ex.nl}”` },
      tiles,
      target: tiles,
      rule: structure,
      why: point.explanation,
    });
  });

  // Tier 3 — tell the point's own examples apart by ear. Needs at least three to be a real choice.
  if (point.examples.length >= 3) {
    const options = point.examples
      .slice(0, 3)
      .map((ex, i) => ({ japanese: exampleJapanese(point, i), hint: ex.en }));
    [0, 1].forEach((answerIndex) => {
      drills.push({
        id: `${point.id}-hear-${answerIndex}`,
        tier: 'reallife',
        kind: 'listen',
        instruction: { en: 'What did you hear?', nl: 'Wat hoorde je?' },
        subhead: {
          en: 'Play it as often as you like.',
          nl: 'Speel het zo vaak af als je wilt.',
        },
        audioKana: point.examples[answerIndex].kana,
        options,
        answerIndex,
        rule: structure,
        why: point.explanation,
      });
    });
  }

  return drills;
}

/** The ladder actually run for a point: the authored one when it exists, the derived one otherwise. */
export function drillsForPoint(point: GrammarPoint): GrammarDrill[] {
  const authored = getGrammarLessonExtras(point.id)?.drills;
  return authored && authored.length > 0 ? authored : deriveDrills(point);
}

/** True when the point has a hand-written ladder rather than one built from its examples and quiz. */
export function hasAuthoredDrills(point: GrammarPoint): boolean {
  const authored = getGrammarLessonExtras(point.id)?.drills;
  return !!authored && authored.length > 0;
}

export interface DrillTierGroup {
  tier: GrammarDrillTier;
  /** Indices into the ordered drill list — what the segmented progress bar is drawn from. */
  indices: number[];
}

/** The tiers this session actually contains, in ladder order, with the drills belonging to each. */
export function tierGroups(drills: GrammarDrill[]): DrillTierGroup[] {
  return GRAMMAR_DRILL_TIERS.map((tier) => ({
    tier,
    indices: drills.map((d, i) => (d.tier === tier ? i : -1)).filter((i) => i >= 0),
  })).filter((g) => g.indices.length > 0);
}

/**
 * How the session grades the point for the SRS scheduler.
 *
 * First-try accuracy is the signal: a run where nothing needed a second look genuinely earns a longer
 * interval than one that needed four. Previously every finished practice was graded "good" regardless,
 * which made the grammar schedule the same for a clean run and a struggle.
 */
export function ratingForAccuracy(firstTryCorrect: number, total: number): SrsRating {
  if (total === 0) return 'good';
  const accuracy = firstTryCorrect / total;
  if (accuracy >= 0.9) return 'easy';
  if (accuracy >= 0.7) return 'good';
  if (accuracy >= 0.5) return 'hard';
  return 'again';
}

/**
 * When this point comes back around, in words — read straight off its SRS card's own due date, so it
 * says what the scheduler actually decided rather than a rounded guess.
 */
export function reviewDueLabel(dueDate: string | null | undefined, today: string = todayIso()): string | null {
  if (!dueDate) return null;
  const days = daysBetween(today, dueDate);
  if (days <= 0) return 'Due for review today';
  if (days === 1) return 'Review tomorrow';
  if (days < 14) return `Review in ${days} days`;
  const weeks = Math.round(days / 7);
  return `Review in ${weeks} weeks`;
}
