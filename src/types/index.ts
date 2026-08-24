export type JlptLevel = 'N5' | 'N4' | 'N3';

/** Ordered study bands, low→high. Used for level tabs and progression logic. */
export const JLPT_LEVELS: JlptLevel[] = ['N5', 'N4', 'N3'];

export type SkillArea =
  | 'grammar'
  | 'vocabulary'
  | 'kanji'
  | 'reading'
  | 'listening'
  | 'speaking';

/** English + Dutch text pair shown side by side throughout the app. */
export interface Translatable {
  en: string;
  nl: string;
}

/** One printable chunk of Japanese text. `reading` is only set on kanji chunks, for furigana. */
export interface FuriganaSegment {
  text: string;
  reading?: string;
}

export interface ExampleSentence {
  segments: FuriganaSegment[];
  kana: string;
  romaji: string;
  en: string;
  nl: string;
}

export interface QuizQuestion {
  id: string;
  skill: SkillArea;
  level: JlptLevel;
  prompt: Translatable;
  japanesePrompt?: string;
  options: string[];
  correctIndex: number;
  explanation?: Translatable;
}

export interface GrammarPoint {
  id: string;
  level: JlptLevel;
  title: string;
  romaji: string;
  structure: string;
  meaning: Translatable;
  explanation: Translatable;
  examples: ExampleSentence[];
  commonMistake: Translatable;
  quiz: QuizQuestion[];
}

/* ------------------------------------------------------------------------------------------------
 * Grammar lesson extras
 *
 * A GrammarPoint carries the reference material every point has (structure, explanation, examples,
 * common mistake, quiz). The types below are the *taught* layer on top of it — the sentence taken
 * apart piece by piece, the same idea at three politeness levels, the lookalikes it gets confused
 * with, and a slot machine for the pattern's own conjugation. All of it is hand-authored per point
 * and every field is optional, because a section with nothing real to say simply does not render.
 * ---------------------------------------------------------------------------------------------- */

/** One tappable chunk of the lesson's headline sentence. */
export interface GrammarAnatomyToken {
  /** The chunk itself, e.g. 「は」. */
  text: string;
  /** Two or three words naming the job it does, e.g. "particle". */
  role: Translatable;
  /** Panel heading — the chunk plus what it is. */
  title: string;
  /** What the chunk does, in the learner's own language. */
  body: Translatable;
}

/** Politeness ladder: the same sentence at three social distances. */
export type GrammarRegister = 'casual' | 'polite' | 'formal';

export interface GrammarRegisterLine {
  register: GrammarRegister;
  japanese: string;
  /** Who you would actually say it to. */
  note: Translatable;
}

/** One row of the "don't confuse this with" table. */
export interface GrammarContrastRow {
  form: string;
  usedFor: Translatable;
  example: string;
}

export interface GrammarContrast {
  rows: GrammarContrastRow[];
  /** The mistake the table exists to prevent, e.g. stacking two of the forms. */
  warning: Translatable;
  /** The broken Japanese the warning is about, shown struck through in red. */
  warningJapanese?: string;
}

/**
 * Which of the eight polite/casual × present/past × affirmative/negative forms is showing.
 * Every form is authored as a finished string — no morphology is computed in code, because a
 * conjugation engine that is subtly wrong teaches the learner something subtly wrong.
 */
export type GrammarFormKey =
  | 'polite-present-affirmative'
  | 'polite-present-negative'
  | 'polite-past-affirmative'
  | 'polite-past-negative'
  | 'casual-present-affirmative'
  | 'casual-present-negative'
  | 'casual-past-affirmative'
  | 'casual-past-negative';

export const GRAMMAR_FORM_KEYS: GrammarFormKey[] = [
  'polite-present-affirmative',
  'polite-present-negative',
  'polite-past-affirmative',
  'polite-past-negative',
  'casual-present-affirmative',
  'casual-present-negative',
  'casual-past-affirmative',
  'casual-past-negative',
];

export interface GrammarPlaygroundPredicate {
  /** Dictionary form, shown on the chip. */
  japanese: string;
  /** The finished predicate + tail for each form, e.g. 学生でした. */
  forms: Record<GrammarFormKey, string>;
  /** The same eight forms in kana — what gets spoken, so no reading is ever guessed by the voice. */
  formsKana: Record<GrammarFormKey, string>;
  /** The whole sentence in English and Dutch, per form — authored, not assembled from fragments. */
  meaning: Record<GrammarFormKey, Translatable>;
}

/**
 * Predicates hang off their topic rather than off the playground, so the two slots can only ever
 * produce sentences that mean something: 今日は暑いです is offered, 今日は学生です is not.
 */
export interface GrammarPlaygroundTopic {
  japanese: string;
  kana: string;
  label: Translatable;
  predicates: GrammarPlaygroundPredicate[];
}

export interface GrammarPlayground {
  topicLabel: Translatable;
  predicateLabel: Translatable;
  topics: GrammarPlaygroundTopic[];
  /** The rule the learner just watched fire, one line per form. */
  notes: Record<GrammarFormKey, Translatable>;
}

/**
 * Practice ladder tiers, in order. A drill's tier is what decides where it sits in the session and
 * which unlock message announces it.
 */
export type GrammarDrillTier = 'recognise' | 'produce' | 'reallife' | 'exam';

export const GRAMMAR_DRILL_TIERS: GrammarDrillTier[] = ['recognise', 'produce', 'reallife', 'exam'];

interface GrammarDrillCommon {
  id: string;
  tier: GrammarDrillTier;
  /** The task, as an instruction. */
  instruction: Translatable;
  /** Optional second line under the instruction. */
  subhead?: Translatable;
  /** Where this is happening, e.g. "Museum ticket desk". */
  scenario?: Translatable;
  /** Why the right answer is right — shown after grading, always. */
  why: Translatable;
  /** The pattern in one line, e.g. "Topic は + noun + です". */
  rule?: Translatable;
  /** JLPT-format item: kana only, no hints, and the clock runs. */
  exam?: boolean;
}

export interface GrammarChoiceOption {
  japanese: string;
  /** Reading or gloss shown beside the option — omitted entirely in exam format. */
  hint?: string;
}

/** Pick one of N written options. */
export interface GrammarChoiceDrill extends GrammarDrillCommon {
  kind: 'choice';
  promptJapanese?: string;
  promptEn?: Translatable;
  options: GrammarChoiceOption[];
  answerIndex: number;
  /** Why *that* wrong option is wrong, keyed by option index. */
  wrongWhy?: Record<number, Translatable>;
}

/** Hear a sentence, pick which one it was. */
export interface GrammarListenDrill extends GrammarDrillCommon {
  kind: 'listen';
  /** Kana fed to TTS — the app speaks kana, never kanji, so readings are never guessed. */
  audioKana: string;
  options: GrammarChoiceOption[];
  answerIndex: number;
}

/** Type the missing word, or the whole sentence. */
export interface GrammarTypeDrill extends GrammarDrillCommon {
  kind: 'type';
  promptJapanese?: string;
  promptEn?: Translatable;
  /** Every spelling that counts — kanji and kana forms both. Compared with punctuation stripped. */
  accepts: string[];
  hint: Translatable;
  placeholder: string;
}

/** One token in the sentence is wrong — tap it. */
export interface GrammarMistakeDrill extends GrammarDrillCommon {
  kind: 'mistake';
  tokens: string[];
  answerIndex: number;
  /** The repaired sentence. */
  fixed: string;
}

/** Tap tiles in order to build the sentence. */
export interface GrammarBuildDrill extends GrammarDrillCommon {
  kind: 'build';
  promptEn: Translatable;
  /** Shuffled at run time from this authored order. */
  tiles: string[];
  target: string[];
}

/** Pair each sentence with its meaning. */
export interface GrammarMatchDrill extends GrammarDrillCommon {
  kind: 'match';
  pairs: { japanese: string; meaning: Translatable }[];
}

export interface GrammarRoleplayChoice {
  japanese: string;
  hint: Translatable;
  ok: boolean;
  /** Required on the wrong replies: what that reply actually lands as. */
  why?: Translatable;
}

export interface GrammarRoleplayTurn {
  npc: { japanese: string; kana: string; meaning: Translatable };
  choices: GrammarRoleplayChoice[];
  /** What the learner got right by picking well — shown once the turn is passed. */
  why: Translatable;
}

/** Hold your side of a short conversation. */
export interface GrammarRoleplayDrill extends GrammarDrillCommon {
  kind: 'roleplay';
  partner: { avatar: string; name: string; role: Translatable };
  turns: GrammarRoleplayTurn[];
}

export type GrammarDrill =
  | GrammarChoiceDrill
  | GrammarListenDrill
  | GrammarTypeDrill
  | GrammarMistakeDrill
  | GrammarBuildDrill
  | GrammarMatchDrill
  | GrammarRoleplayDrill;

/**
 * Everything a point can teach beyond its reference card. Points without an entry still get a real
 * lesson and a real practice run — the sections below just don't appear, and the drills are built
 * from the point's own examples and quiz instead (see lib/grammarDrills.ts).
 */
export interface GrammarLessonExtras {
  /** The one sentence the lesson takes apart, and its pieces. */
  anatomy?: { sentence: string; kana: string; tokens: GrammarAnatomyToken[] };
  registers?: GrammarRegisterLine[];
  contrast?: GrammarContrast;
  playground?: GrammarPlayground;
  /** The authored practice ladder. Replaces the derived one entirely when present. */
  drills?: GrammarDrill[];
}

export interface VocabWord {
  id: string;
  level: JlptLevel;
  japanese: string;
  kana: string;
  romaji: string;
  meaning: Translatable;
  category: string;
  example: ExampleSentence;
}

export interface KanjiExampleWord {
  word: string;
  kana: string;
  meaning: Translatable;
}

export interface KanjiEntry {
  id: string;
  level: JlptLevel;
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: Translatable;
  strokeCount: number;
  exampleWords: KanjiExampleWord[];
  exampleSentence: ExampleSentence;
}

export interface ReadingSentence {
  segments: FuriganaSegment[];
  kana: string;
  romaji: string;
  en: string;
  nl: string;
  highlightVocabIds?: string[];
  highlightGrammarIds?: string[];
}

export interface ReadingQuestion {
  id: string;
  question: Translatable;
  options: Translatable[];
  correctIndex: number;
}

/**
 * Tadoku ("extensive reading") grade, 0–5. Finer than JLPT at the beginner end,
 * where most extensive reading lives. Rough word-count bands used to place a book:
 * L0 ~20–120 · L1 ~120–400 · L2 ~400–800 · L3 ~800–1500 · L4/L5 longer.
 */
export type TadokuLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Ordered Tadoku shelves, low→high. */
export const TADOKU_LEVELS: TadokuLevel[] = [0, 1, 2, 3, 4, 5];

export interface ReadingPassage {
  id: string;
  level: JlptLevel;
  /** Primary grade for the library shelves — Tadoku's own 0–5 scale. */
  tadokuLevel: TadokuLevel;
  title: Translatable;
  /**
   * The book's own Japanese title — what a learner sees first on the shelf, with the English
   * title underneath. Written at the book's own reading level (kana-only for L0), so the title
   * itself is already readable by whoever the book is for.
   */
  titleJa: string;
  /** One-line summary shown in the "About this book" panel. */
  description: Translatable;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Cover glyph shown on the shelf card (e.g. "🍙"). */
  coverEmoji: string;
  /**
   * Optional painted cover, served from `/assets/reading/covers/`. Only some books have one;
   * the rest fall back to the tinted emoji cover, so the shelf never shows a blank placeholder.
   */
  cover?: string;
  /** Authored word count (Japanese words) — drives the "words read" volume tracker. */
  wordCount: number;
  /** Optional theme label shown as a small tag (e.g. "Daily life"). */
  genre?: string;
  sentences: ReadingSentence[];
  vocabHighlightIds: string[];
  grammarHighlightIds: string[];
  /** Optional comprehension check. Empty for pure extensive-reading books (L0–L1). */
  questions: ReadingQuestion[];
}

/** Which daily budget a week belongs to. Core = strong-N4 path; stretch = the N3 overlay. */
export type StudyRoute = 'core' | 'stretch';

export type RoadmapPhase = 'N5' | 'N4' | 'N3' | 'consolidation';

/**
 * A mastery gate is checked against real progress signals (completed IDs, SRS state, quiz
 * accuracy) — a week opens because the learner has *demonstrated* the prior week, never
 * because a number of days elapsed. All thresholds are fractions (0..1) or counts; any field
 * left undefined is simply not required for that week.
 */
export interface MasteryGate {
  /** Fraction of this week's grammar points that must be marked complete. */
  grammarCompletion?: number;
  /** Fraction of this week's kanji that must be marked learned. */
  kanjiCompletion?: number;
  /** Fraction of this week's vocab that must have been reviewed to ≥ "good" at least once. */
  vocabMastery?: number;
  /** Fraction of this week's readings that must be completed. */
  readingCompletion?: number;
  /** Minimum accuracy (0..1) on this week's checkpoint quiz. */
  minCheckpointAccuracy?: number;
  /** Learner-facing one-line description of what passing this week requires. */
  summary: Translatable;
}

/** A coherent teaching block inside a week; content-ID arrays point at real items in src/data. */
export interface RoadmapUnit {
  id: string;
  title: Translatable;
  objectives: Translatable[];
  prerequisites: Translatable[];
  grammarIds: string[];
  vocabIds: string[];
  kanjiIds: string[];
  readingIds: string[];
}

export interface RoadmapWeek {
  week: number; // 1..22
  phase: RoadmapPhase;
  level: JlptLevel;
  theme: Translatable;
  focus: Translatable;
  /** Prior week numbers whose gates must be passed before this week unlocks. */
  prerequisiteWeeks: number[];
  /** Core daily budget in minutes, [min, max] — the strong-N4 path. */
  coreMinutesPerDay: [number, number];
  /** Extra daily minutes for the N3 stretch overlay, [min, max], when this week has stretch work. */
  stretchMinutesPerDay?: [number, number];
  units: RoadmapUnit[];
  /** Spaced-review offsets in days after first study — the 1/3/7/14/30 cadence. */
  reviewDaysAfter: number[];
  checkpoint: Translatable;
  /** True for JLPT-style mixed-skill review weeks/checkpoints. */
  mixedReview: boolean;
  gate: MasteryGate;
}

/**
 * What an SRS card can be scheduled against. Not static content — lives in progress data.
 *
 * Vocabulary and kanji are reviewed in dedicated sessions; the other four are scheduled off the moment
 * the learner genuinely finishes the thing (a grammar lesson, a book, a listening item, a role-play
 * played through). That's what lets every section report the same learned / due-for-review / still-to-
 * learn split instead of only the two decks with a review flow of their own.
 */
export type SrsItemType = 'vocabulary' | 'kanji' | 'grammar' | 'reading' | 'listening' | 'speaking';
export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCardState {
  itemId: string;
  itemType: SrsItemType;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string; // ISO date (yyyy-mm-dd)
  lastReviewed: string | null; // ISO date
}

export const SKILL_AREAS: SkillArea[] = [
  'grammar',
  'vocabulary',
  'kanji',
  'reading',
  'listening',
  'speaking',
];

export const SKILL_LABELS: Record<SkillArea, Translatable> = {
  grammar: { en: 'Grammar', nl: 'Grammatica' },
  vocabulary: { en: 'Vocabulary', nl: 'Woordenschat' },
  kanji: { en: 'Kanji', nl: 'Kanji' },
  reading: { en: 'Reading', nl: 'Lezen' },
  listening: { en: 'Listening', nl: 'Luisteren' },
  speaking: { en: 'Speaking', nl: 'Spreken' },
};
