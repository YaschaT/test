export type JlptLevel = 'N5' | 'N4';

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

export interface ReadingPassage {
  id: string;
  level: JlptLevel;
  title: Translatable;
  difficulty: 'easy' | 'medium' | 'hard';
  sentences: ReadingSentence[];
  vocabHighlightIds: string[];
  grammarHighlightIds: string[];
  questions: ReadingQuestion[];
}

export interface RoadmapWeek {
  week: number;
  level: JlptLevel;
  theme: string;
  goals: Translatable[];
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
