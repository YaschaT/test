import type { JlptLevel, Translatable } from '../types';
import { VOCABULARY } from '../data/vocabulary';
import { KANJI_LIST } from '../data/kanji';
import { GRAMMAR_POINTS } from '../data/grammar';
import { READINGS } from '../data/readings';
import { shuffle } from './listeningPool';

// ── Content sections (how questions are generated) ────────────────────────────
export type MockSection = 'vocabulary' | 'kanji' | 'grammar' | 'reading' | 'listening';

export const MOCK_SECTIONS: MockSection[] = ['vocabulary', 'kanji', 'grammar', 'reading', 'listening'];

export const SECTION_LABEL: Record<MockSection, Translatable> = {
  vocabulary: { en: 'Vocabulary', nl: 'Woordenschat' },
  kanji: { en: 'Kanji', nl: 'Kanji' },
  grammar: { en: 'Grammar', nl: 'Grammatica' },
  reading: { en: 'Reading', nl: 'Lezen' },
  listening: { en: 'Listening', nl: 'Luisteren' },
};

/** One normalized exam question — every content section is flattened into this common shape. */
export interface MockQuestion {
  id: string;
  section: MockSection;
  /** The instruction, e.g. "Choose the meaning". */
  prompt: Translatable;
  /** The Japanese stimulus shown large (word/kanji/sentence); absent for listening (audio only). */
  japanese?: string;
  /** For listening questions: the Japanese to speak aloud (hidden by default). */
  audioText?: string;
  /** Small contextual line above the question (e.g. the reading passage it belongs to). */
  context?: Translatable;
  options: string[];
  correctIndex: number;
  explanation?: Translatable;
}

// ── Official JLPT scoring model (source: jlpt.jp) ─────────────────────────────
// Every level is scored 0–180. To pass you need the overall pass mark AND at least the
// sectional minimum in every scoring section. Our scaled score maps each scoring section's
// raw accuracy onto its official 0–60 / 0–120 range — a faithful structural replica of the
// real pass/fail logic (the real test uses equated item-response scaling we can't reproduce).
export type ScoringKey = 'langReading' | 'language' | 'reading' | 'listening';

export interface ScoringSectionDef {
  key: ScoringKey;
  label: Translatable;
  max: number;
  min: number;
  contentSections: MockSection[];
}

export interface LevelScoring {
  overallPass: number;
  total: number;
  sections: ScoringSectionDef[];
}

const LANG_READING: ScoringSectionDef = {
  key: 'langReading',
  label: { en: 'Language Knowledge · Reading', nl: 'Taalkennis · Lezen' },
  max: 120,
  min: 38,
  contentSections: ['vocabulary', 'kanji', 'grammar', 'reading'],
};
const LISTENING: ScoringSectionDef = {
  key: 'listening',
  label: { en: 'Listening', nl: 'Luisteren' },
  max: 60,
  min: 19,
  contentSections: ['listening'],
};

export const SCORING: Record<JlptLevel, LevelScoring> = {
  // N5 & N4 have two scoring sections; N3 splits Language Knowledge and Reading apart.
  N5: { overallPass: 80, total: 180, sections: [LANG_READING, LISTENING] },
  N4: { overallPass: 90, total: 180, sections: [LANG_READING, LISTENING] },
  N3: {
    overallPass: 95,
    total: 180,
    sections: [
      { key: 'language', label: { en: 'Language Knowledge', nl: 'Taalkennis' }, max: 60, min: 19, contentSections: ['vocabulary', 'kanji', 'grammar'] },
      { key: 'reading', label: { en: 'Reading', nl: 'Lezen' }, max: 60, min: 19, contentSections: ['reading'] },
      LISTENING,
    ],
  },
};

export interface MockExamConfig {
  level: JlptLevel;
  /** Minutes on the clock (condensed from the official time, in proportion to our shorter paper). */
  minutes: number;
  /** Official full testing time in minutes, shown for reference. */
  officialMinutes: number;
  perSection: Record<MockSection, number>;
}

/** Condensed papers that mirror the official JLPT section mix; sizes stay under each content pool. */
export const EXAM_CONFIG: Record<JlptLevel, MockExamConfig> = {
  N5: { level: 'N5', minutes: 24, officialMinutes: 90, perSection: { vocabulary: 10, kanji: 6, grammar: 6, reading: 4, listening: 6 } },
  N4: { level: 'N4', minutes: 27, officialMinutes: 115, perSection: { vocabulary: 11, kanji: 7, grammar: 8, reading: 4, listening: 6 } },
  N3: { level: 'N3', minutes: 30, officialMinutes: 140, perSection: { vocabulary: 10, kanji: 8, grammar: 8, reading: 5, listening: 6 } },
};

export function examTotal(config: MockExamConfig): number {
  return MOCK_SECTIONS.reduce((n, s) => n + config.perSection[s], 0);
}

// ── Question builders ────────────────────────────────────────────────────────
function joinSegments(segments: { text: string }[]): string {
  return segments.map((s) => s.text).join('');
}

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
        explanation: { en: `${w.japanese} (${w.romaji}) — ${w.meaning.en}`, nl: `${w.japanese} (${w.romaji}) — ${w.meaning.nl}` },
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
        explanation: { en: `${k.character} — ${k.meaning.en}${readings ? ` · ${readings}` : ''}`, nl: `${k.character} — ${k.meaning.nl}${readings ? ` · ${readings}` : ''}` },
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
  const items = READINGS.filter((r) => r.level === level).flatMap((r) => r.questions.map((q) => ({ passage: r, q })));
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

/** Listening items: the learner hears a same-level example sentence and picks its meaning. */
function buildListening(level: JlptLevel, count: number): MockQuestion[] {
  const pool = VOCABULARY.filter((w) => w.level === level && w.example);
  const meanings = pool.map((w) => w.example.en);
  return shuffle(pool)
    .slice(0, count)
    .map((w) => {
      const { options, correctIndex } = multipleChoice(w.example.en, meanings);
      const jp = joinSegments(w.example.segments);
      return {
        id: `mq-l-${w.id}`,
        section: 'listening' as const,
        prompt: { en: 'Listen and choose the meaning.', nl: 'Luister en kies de betekenis.' },
        audioText: jp,
        options,
        correctIndex,
        explanation: { en: `${jp} — ${w.example.en}`, nl: `${jp} — ${w.example.nl}` },
      };
    });
}

const BUILDERS: Record<MockSection, (level: JlptLevel, n: number) => MockQuestion[]> = {
  vocabulary: buildVocabulary,
  kanji: buildKanji,
  grammar: buildGrammar,
  reading: buildReading,
  listening: buildListening,
};

/**
 * Assembles a fresh mixed exam for a level from real content, ordered vocab → kanji → grammar →
 * reading → listening (mirroring the official section order). Each section is internally shuffled;
 * a new call reshuffles for a different paper.
 */
export function buildMockExam(level: JlptLevel): MockQuestion[] {
  const config = EXAM_CONFIG[level];
  return MOCK_SECTIONS.flatMap((section) => BUILDERS[section](level, config.perSection[section]));
}

// ── Scoring ──────────────────────────────────────────────────────────────────
export interface ContentScore {
  section: MockSection;
  correct: number;
  total: number;
}

/** Raw per-content-section tally (vocab/kanji/grammar/reading/listening) for the detailed breakdown. */
export function scoreByContent(questions: MockQuestion[], answers: (number | null)[]): ContentScore[] {
  return MOCK_SECTIONS.map((section) => {
    const idxs = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.section === section);
    const correct = idxs.filter(({ q, i }) => answers[i] === q.correctIndex).length;
    return { section, correct, total: idxs.length };
  }).filter((s) => s.total > 0);
}

export interface ScoredScoringSection {
  key: ScoringKey;
  label: Translatable;
  scaled: number;
  max: number;
  min: number;
  passed: boolean;
  correct: number;
  total: number;
}

export interface OfficialResult {
  sections: ScoredScoringSection[];
  scaled: number;
  total: number;
  overallPass: number;
  /** Raw correct across every question. */
  correct: number;
  rawTotal: number;
  passed: boolean;
  /** True when the overall mark is met but a sectional minimum was missed (an official fail). */
  failedOnSection: boolean;
}

/** Scores an exam on the official JLPT model: scaled 0–180, overall pass mark + sectional minimums. */
export function scoreExamOfficial(level: JlptLevel, questions: MockQuestion[], answers: (number | null)[]): OfficialResult {
  const def = SCORING[level];
  const sections: ScoredScoringSection[] = def.sections.map((sec) => {
    const idxs = questions.map((q, i) => ({ q, i })).filter(({ q }) => sec.contentSections.includes(q.section));
    const correct = idxs.filter(({ q, i }) => answers[i] === q.correctIndex).length;
    const total = idxs.length;
    const scaled = total > 0 ? Math.round((correct / total) * sec.max) : 0;
    return { key: sec.key, label: sec.label, scaled, max: sec.max, min: sec.min, passed: scaled >= sec.min, correct, total };
  });
  const scaled = sections.reduce((n, s) => n + s.scaled, 0);
  const correct = sections.reduce((n, s) => n + s.correct, 0);
  const rawTotal = sections.reduce((n, s) => n + s.total, 0);
  const allSectionsPassed = sections.every((s) => s.passed);
  const passed = scaled >= def.overallPass && allSectionsPassed;
  return { sections, scaled, total: def.total, overallPass: def.overallPass, correct, rawTotal, passed, failedOnSection: scaled >= def.overallPass && !allSectionsPassed };
}
