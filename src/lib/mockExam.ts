import type { JlptLevel, Translatable } from '../types';
import { VOCABULARY } from '../data/vocabulary';
import { KANJI_LIST } from '../data/kanji';
import { GRAMMAR_POINTS } from '../data/grammar';
import { READINGS } from '../data/readings';
import { shuffle } from './listeningPool';

export type MockSection = 'vocabulary' | 'kanji' | 'grammar' | 'reading';

export const MOCK_SECTIONS: MockSection[] = ['vocabulary', 'kanji', 'grammar', 'reading'];

export const SECTION_LABEL: Record<MockSection, Translatable> = {
  vocabulary: { en: 'Vocabulary', nl: 'Woordenschat' },
  kanji: { en: 'Kanji', nl: 'Kanji' },
  grammar: { en: 'Grammar', nl: 'Grammatica' },
  reading: { en: 'Reading', nl: 'Lezen' },
};

/** One normalized exam question — every section is flattened into this common shape. */
export interface MockQuestion {
  id: string;
  section: MockSection;
  /** The instruction, e.g. "Choose the meaning". */
  prompt: Translatable;
  /** The Japanese stimulus (word, kanji, or sentence) shown large; absent for some reading items. */
  japanese?: string;
  /** Small contextual line above the question (e.g. the reading passage it belongs to). */
  context?: Translatable;
  options: string[];
  correctIndex: number;
  explanation?: Translatable;
}

export interface MockExamConfig {
  level: JlptLevel;
  /** Minutes on the clock. */
  minutes: number;
  /** Target question count per section (clamped to what content exists). */
  perSection: Record<MockSection, number>;
}

/** Sizes chosen to sit safely under each level's real content pool (reading is the tightest). */
export const EXAM_CONFIG: Record<JlptLevel, MockExamConfig> = {
  N5: { level: 'N5', minutes: 20, perSection: { vocabulary: 12, kanji: 8, grammar: 6, reading: 4 } },
  N4: { level: 'N4', minutes: 25, perSection: { vocabulary: 14, kanji: 9, grammar: 8, reading: 4 } },
  N3: { level: 'N3', minutes: 30, perSection: { vocabulary: 14, kanji: 10, grammar: 8, reading: 4 } },
};

/** JLPT scoring is scaled, but ~60% overall is the conventional pass line — used as our threshold. */
export const PASS_THRESHOLD = 0.6;

export function examTotal(config: MockExamConfig): number {
  return MOCK_SECTIONS.reduce((n, s) => n + config.perSection[s], 0);
}

/** Picks `n` distinct wrong options from a pool, excluding the correct answer. */
function distractors(pool: string[], correct: string, n: number): string[] {
  const seen = new Set([correct.trim().toLowerCase()]);
  const out: string[] = [];
  for (const candidate of shuffle(pool)) {
    const key = candidate.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(candidate);
    if (out.length === n) break;
  }
  return out;
}

/** Builds a 4-option question from a correct answer + a distractor pool, returning options + index. */
function multipleChoice(correct: string, pool: string[]): { options: string[]; correctIndex: number } {
  const options = shuffle([correct, ...distractors(pool, correct, 3)]);
  return { options, correctIndex: options.indexOf(correct) };
}

function buildVocabulary(level: JlptLevel, count: number): MockQuestion[] {
  const pool = VOCABULARY.filter((w) => w.level === level);
  const meanings = pool.map((w) => w.meaning.en);
  return shuffle(pool)
    .slice(0, count)
    .map((w) => {
      const { options, correctIndex } = multipleChoice(w.meaning.en, meanings);
      return {
        id: `mq-v-${w.id}`,
        section: 'vocabulary' as const,
        prompt: { en: 'What does this word mean?', nl: 'Wat betekent dit woord?' },
        japanese: `${w.japanese}（${w.kana}）`,
        options,
        correctIndex,
        explanation: {
          en: `${w.japanese} (${w.romaji}) — ${w.meaning.en}`,
          nl: `${w.japanese} (${w.romaji}) — ${w.meaning.nl}`,
        },
      };
    });
}

function buildKanji(level: JlptLevel, count: number): MockQuestion[] {
  const pool = KANJI_LIST.filter((k) => k.level === level);
  const meanings = pool.map((k) => k.meaning.en);
  return shuffle(pool)
    .slice(0, count)
    .map((k) => {
      const { options, correctIndex } = multipleChoice(k.meaning.en, meanings);
      const readings = [...k.onyomi, ...k.kunyomi].filter(Boolean).join('、');
      return {
        id: `mq-k-${k.id}`,
        section: 'kanji' as const,
        prompt: { en: 'What does this kanji mean?', nl: 'Wat betekent deze kanji?' },
        japanese: k.character,
        options,
        correctIndex,
        explanation: {
          en: `${k.character} — ${k.meaning.en}${readings ? ` · ${readings}` : ''}`,
          nl: `${k.character} — ${k.meaning.nl}${readings ? ` · ${readings}` : ''}`,
        },
      };
    });
}

function buildGrammar(level: JlptLevel, count: number): MockQuestion[] {
  const questions = GRAMMAR_POINTS.filter((g) => g.level === level).flatMap((g) => g.quiz);
  return shuffle(questions)
    .slice(0, count)
    .map((q) => ({
      id: `mq-g-${q.id}`,
      section: 'grammar' as const,
      prompt: q.prompt,
      japanese: q.japanesePrompt,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));
}

function buildReading(level: JlptLevel, count: number): MockQuestion[] {
  const items = READINGS.filter((r) => r.level === level).flatMap((r) =>
    r.questions.map((q) => ({ passage: r, q })),
  );
  return shuffle(items)
    .slice(0, count)
    .map(({ passage, q }) => ({
      id: `mq-r-${q.id}`,
      section: 'reading' as const,
      prompt: q.question,
      context: { en: `From “${passage.title.en}”`, nl: `Uit “${passage.title.nl}”` },
      options: q.options.map((o) => o.en),
      correctIndex: q.correctIndex,
    }));
}

const BUILDERS: Record<MockSection, (level: JlptLevel, n: number) => MockQuestion[]> = {
  vocabulary: buildVocabulary,
  kanji: buildKanji,
  grammar: buildGrammar,
  reading: buildReading,
};

/**
 * Assembles a fresh mixed exam for a level from real content — sections are ordered
 * (vocab → kanji → grammar → reading) and each section is internally shuffled. A new call
 * reshuffles, so retaking gives a different paper. Every question is a self-contained 4-option MCQ.
 */
export function buildMockExam(level: JlptLevel): MockQuestion[] {
  const config = EXAM_CONFIG[level];
  return MOCK_SECTIONS.flatMap((section) => BUILDERS[section](level, config.perSection[section]));
}

export interface SectionScore {
  section: MockSection;
  correct: number;
  total: number;
}

/** Tallies a completed exam into an overall count plus a per-section breakdown. */
export function scoreExam(
  questions: MockQuestion[],
  answers: (number | null)[],
): { correct: number; total: number; bySection: SectionScore[] } {
  const bySection = MOCK_SECTIONS.map((section) => {
    const idxs = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.section === section);
    const correct = idxs.filter(({ q, i }) => answers[i] === q.correctIndex).length;
    return { section, correct, total: idxs.length };
  }).filter((s) => s.total > 0);

  const correct = bySection.reduce((n, s) => n + s.correct, 0);
  const total = bySection.reduce((n, s) => n + s.total, 0);
  return { correct, total, bySection };
}
