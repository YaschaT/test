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
  /** One-line summary shown in the "About this book" panel. */
  description: Translatable;
  difficulty: 'easy' | 'medium' | 'hard';
  /** Cover glyph shown on the shelf card (e.g. "🍙"). */
  coverEmoji: string;
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

/** SRS scheduling state for one vocabulary or kanji item. Not static content — lives in progress data. */
export type SrsItemType = 'vocabulary' | 'kanji';
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
