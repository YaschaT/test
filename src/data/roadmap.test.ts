import { describe, it, expect } from 'vitest';
import { ROADMAP, collectRoadmapContentIds } from './roadmap';
import { GRAMMAR_POINTS } from './grammar';
import { VOCABULARY } from './vocabulary';
import { KANJI_LIST } from './kanji';
import { READINGS } from './readings';
import { evaluateGate, isWeekUnlocked, type GateProgress } from '../lib/roadmapGate';

describe('roadmap structure', () => {
  it('has exactly 22 sequential weeks', () => {
    expect(ROADMAP).toHaveLength(22);
    ROADMAP.forEach((w, i) => expect(w.week).toBe(i + 1));
  });

  it('follows the required phase bands (1-6 N5, 7-14 N4, 15-20 N3, 21-22 consolidation)', () => {
    const phaseFor = (week: number) => ROADMAP.find((w) => w.week === week)!.phase;
    for (let w = 1; w <= 6; w++) expect(phaseFor(w)).toBe('N5');
    for (let w = 7; w <= 14; w++) expect(phaseFor(w)).toBe('N4');
    for (let w = 15; w <= 20; w++) expect(phaseFor(w)).toBe('N3');
    for (let w = 21; w <= 22; w++) expect(phaseFor(w)).toBe('consolidation');
  });

  it('keeps the core budget at 75-90 min and the N3 stretch overlay at 30-60 min', () => {
    for (const w of ROADMAP) {
      expect(w.coreMinutesPerDay).toEqual([75, 90]);
      expect(w.stretchMinutesPerDay).toEqual([30, 60]);
    }
  });

  it('schedules the 1/3/7/14/30-day review cadence on every week', () => {
    for (const w of ROADMAP) expect(w.reviewDaysAfter).toEqual([1, 3, 7, 14, 30]);
  });

  it('includes periodic JLPT-style mixed reviews (weeks 6, 14, 20, 21, 22)', () => {
    const mixed = ROADMAP.filter((w) => w.mixedReview).map((w) => w.week);
    expect(mixed).toEqual([6, 14, 20, 21, 22]);
  });

  it('only references prerequisite weeks that come earlier', () => {
    for (const w of ROADMAP) {
      for (const p of w.prerequisiteWeeks) expect(p).toBeLessThan(w.week);
    }
  });

  it('gives every unit a unique id', () => {
    const ids = ROADMAP.flatMap((w) => w.units.map((u) => u.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('roadmap content references resolve to real items', () => {
  const g = new Set(GRAMMAR_POINTS.map((x) => x.id));
  const v = new Set(VOCABULARY.map((x) => x.id));
  const k = new Set(KANJI_LIST.map((x) => x.id));
  const r = new Set(READINGS.map((x) => x.id));
  const refs = collectRoadmapContentIds();

  it('every grammar id exists', () => refs.grammar.forEach((id) => expect(g, id).toContain(id)));
  it('every vocab id exists', () => refs.vocab.forEach((id) => expect(v, id).toContain(id)));
  it('every kanji id exists', () => refs.kanji.forEach((id) => expect(k, id).toContain(id)));
  it('every reading id exists', () => refs.reading.forEach((id) => expect(r, id).toContain(id)));
});

describe('mastery gates', () => {
  const empty: GateProgress = {
    completedGrammarIds: [],
    learnedKanjiIds: [],
    completedReadingIds: [],
    srsCards: {},
    checkpointAccuracyByWeek: {},
  };

  it('week 1 is unlocked with no progress but its gate is not yet passed', () => {
    const w1 = ROADMAP[0];
    expect(isWeekUnlocked(w1, ROADMAP, empty)).toBe(true);
    expect(evaluateGate(w1, empty).passed).toBe(false);
  });

  it('week 2 stays locked until week 1 is fully demonstrated', () => {
    const w1 = ROADMAP[0];
    const w2 = ROADMAP[1];
    expect(isWeekUnlocked(w2, ROADMAP, empty)).toBe(false);

    const ids = w1.units[0];
    const done: GateProgress = {
      completedGrammarIds: [...ids.grammarIds],
      learnedKanjiIds: [...ids.kanjiIds],
      completedReadingIds: [...ids.readingIds],
      srsCards: Object.fromEntries(
        ids.vocabIds.map((id) => [
          `vocabulary:${id}`,
          { itemId: id, itemType: 'vocabulary' as const, easeFactor: 2.5, intervalDays: 4, repetitions: 2, dueDate: '2999-01-01', lastReviewed: '2026-01-01' },
        ]),
      ),
      checkpointAccuracyByWeek: { 1: 0.9 },
    };
    expect(evaluateGate(w1, done).passed).toBe(true);
    expect(isWeekUnlocked(w2, ROADMAP, done)).toBe(true);
  });
});
