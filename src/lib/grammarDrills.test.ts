import { describe, expect, it } from 'vitest';
import {
  deriveDrills,
  tilesFromSegments,
  drillsForPoint,
  hasAuthoredDrills,
  normalizeTyped,
  ratingForAccuracy,
  reviewDueLabel,
  stableShuffle,
  tierGroups,
  typedMatches,
} from './grammarDrills';
import { GRAMMAR_POINTS, getGrammarPoint } from '../data/grammar';
import { GRAMMAR_DRILL_TIERS, type GrammarPoint } from '../types';

const desu = getGrammarPoint('desu') as GrammarPoint;

describe('normalizeTyped / typedMatches', () => {
  it('ignores punctuation and spacing on both sides', () => {
    expect(normalizeTyped(' 私は学生です。 ')).toBe('私は学生です');
    expect(normalizeTyped('これは、本です.')).toBe('これは本です');
  });

  it('accepts either the kanji or the kana spelling', () => {
    expect(typedMatches('私', ['私', 'わたし'])).toBe(true);
    expect(typedMatches('わたし', ['私', 'わたし'])).toBe(true);
    expect(typedMatches('わたし。', ['私', 'わたし'])).toBe(true);
  });

  it('never counts an empty answer as a match', () => {
    expect(typedMatches('', ['私'])).toBe(false);
    expect(typedMatches('。。。', ['私'])).toBe(false);
  });
});

describe('deriveDrills', () => {
  it('turns every one of the point’s own quiz questions into a recognise-tier drill', () => {
    const drills = deriveDrills(desu);
    const recognise = drills.filter((d) => d.tier === 'recognise' && d.kind === 'choice');
    expect(recognise).toHaveLength(desu.quiz.length);
    expect(recognise[0]).toMatchObject({ answerIndex: desu.quiz[0].correctIndex });
  });

  it('produces one typing drill per example, accepting the kanji and kana forms', () => {
    const produce = deriveDrills(desu).filter((d) => d.tier === 'produce' && d.kind === 'type');
    expect(produce).toHaveLength(Math.min(3, desu.examples.length));
    const first = produce[0];
    if (first.kind !== 'type') throw new Error('expected a typing drill');
    expect(first.accepts).toContain(desu.examples[0].kana);
    expect(typedMatches(desu.examples[0].kana, first.accepts)).toBe(true);
  });

  it('only adds matching and listening when there are enough real sentences to choose between', () => {
    const thin: GrammarPoint = { ...desu, examples: desu.examples.slice(0, 2) };
    const kinds = deriveDrills(thin).map((d) => d.kind);
    expect(kinds).not.toContain('match');
    expect(kinds).not.toContain('listen');

    const full = deriveDrills(desu).map((d) => d.kind);
    expect(full).toContain('match');
    expect(full).toContain('listen');
  });

  it('never invents an exam tier — JLPT-format items are only ever hand-authored', () => {
    for (const point of GRAMMAR_POINTS) {
      expect(deriveDrills(point).some((d) => d.tier === 'exam')).toBe(false);
    }
  });
});

describe('drillsForPoint', () => {
  it('prefers the authored ladder over the derived one', () => {
    expect(hasAuthoredDrills(desu)).toBe(true);
    const drills = drillsForPoint(desu);
    expect(drills[0].id.startsWith('desu-d')).toBe(true);
    expect(tierGroups(drills).map((g) => g.tier)).toEqual(GRAMMAR_DRILL_TIERS);
  });

  it('gives every grammar point in the app a real practice run', () => {
    for (const point of GRAMMAR_POINTS) {
      const drills = drillsForPoint(point);
      expect(drills.length, `${point.id} has no drills`).toBeGreaterThan(0);
      expect(tierGroups(drills).length, `${point.id} has no tiers`).toBeGreaterThan(0);
    }
  });

  it('leaves no drill without bilingual instruction and explanation text', () => {
    for (const point of GRAMMAR_POINTS) {
      for (const drill of drillsForPoint(point)) {
        expect(drill.instruction.en.length, `${drill.id} instruction.en`).toBeGreaterThan(0);
        expect(drill.instruction.nl.length, `${drill.id} instruction.nl`).toBeGreaterThan(0);
        expect(drill.why.en.length, `${drill.id} why.en`).toBeGreaterThan(0);
        expect(drill.why.nl.length, `${drill.id} why.nl`).toBeGreaterThan(0);
      }
    }
  });

  it('keeps every answer key inside its own options, and every roleplay turn winnable', () => {
    for (const point of GRAMMAR_POINTS) {
      for (const drill of drillsForPoint(point)) {
        if (drill.kind === 'choice' || drill.kind === 'listen') {
          expect(drill.options[drill.answerIndex], `${drill.id} answerIndex`).toBeDefined();
        }
        if (drill.kind === 'mistake') {
          expect(drill.tokens[drill.answerIndex], `${drill.id} answerIndex`).toBeDefined();
        }
        if (drill.kind === 'build') {
          expect(drill.tiles.slice().sort()).toEqual(drill.target.slice().sort());
        }
        if (drill.kind === 'type') {
          expect(drill.accepts.length, `${drill.id} accepts`).toBeGreaterThan(0);
        }
        if (drill.kind === 'roleplay') {
          for (const turn of drill.turns) {
            expect(turn.choices.filter((c) => c.ok), `${drill.id} correct replies`).toHaveLength(1);
            for (const wrong of turn.choices.filter((c) => !c.ok)) {
              expect(wrong.why?.en.length, `${drill.id} wrong reply needs a reason`).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });

  it('ids are unique inside a point, so session state can never collide', () => {
    for (const point of GRAMMAR_POINTS) {
      const ids = drillsForPoint(point).map((d) => d.id);
      expect(new Set(ids).size, `${point.id} has duplicate drill ids`).toBe(ids.length);
    }
  });
});

describe('tilesFromSegments', () => {
  const seg = (text: string, reading?: string) => (reading ? { text, reading } : { text });

  it('keeps a kanji stem and its okurigana in one tile, and particles on their own', () => {
    // 一緒に行きましょう。 — as the furigana data segments it.
    expect(
      tilesFromSegments([seg('一緒', 'いっしょ'), seg('に'), seg('行', 'い'), seg('きましょう'), seg('。')]),
    ).toEqual(['一緒', 'に', '行きましょう']);
  });

  it('never hangs a word off a bare particle', () => {
    expect(
      tilesFromSegments([seg('先週', 'せんしゅう'), seg('宿題', 'しゅくだい'), seg('を'), seg('し'), seg('ませんでした'), seg('。')]),
    ).toEqual(['先週', '宿題', 'を', 'しませんでした']);
  });

  it('gives a loanword its own tile instead of gluing it to the word in front', () => {
    expect(
      tilesFromSegments([seg('朝', 'あさ'), seg('パン'), seg('を'), seg('食', 'た'), seg('べません'), seg('。')]),
    ).toEqual(['朝', 'パン', 'を', '食べません']);
  });

  it('keeps a one-character kana prefix attached to its own word', () => {
    expect(
      tilesFromSegments([seg('今', 'いま'), seg('、'), seg('ご'), seg('飯', 'はん'), seg('を'), seg('食', 'た'), seg('べています'), seg('。')]),
    ).toEqual(['今', 'ご飯', 'を', '食べています']);
  });

  it('declines rather than forcing a sentence that does not chunk into a puzzle', () => {
    // 心配しないでください。 collapses to a single chunk — there is nothing to order.
    expect(tilesFromSegments([seg('心配', 'しんぱい'), seg('しないでください'), seg('。')])).toBeNull();
  });

  it('always reconstructs the original sentence exactly', () => {
    for (const point of GRAMMAR_POINTS) {
      for (const example of point.examples) {
        const tiles = tilesFromSegments(example.segments);
        if (!tiles) continue;
        const source = example.segments
          .map((s) => s.text)
          .join('')
          .replace(/[。、！？．，]/g, '');
        expect(tiles.join(''), point.id).toBe(source);
      }
    }
  });
});

describe('tierGroups', () => {
  it('drops tiers with nothing in them and keeps ladder order', () => {
    const groups = tierGroups(deriveDrills(desu));
    expect(groups.map((g) => g.tier)).toEqual(['recognise', 'produce', 'reallife']);
    expect(groups.flatMap((g) => g.indices)).toHaveLength(deriveDrills(desu).length);
  });
});

describe('ratingForAccuracy', () => {
  it('maps a run onto the grade the scheduler should see', () => {
    expect(ratingForAccuracy(10, 10)).toBe('easy');
    expect(ratingForAccuracy(8, 10)).toBe('good');
    expect(ratingForAccuracy(5, 10)).toBe('hard');
    expect(ratingForAccuracy(2, 10)).toBe('again');
  });

  it('does not punish a session with nothing in it', () => {
    expect(ratingForAccuracy(0, 0)).toBe('good');
  });
});

describe('stableShuffle', () => {
  it('is a permutation, and the same seed always gives the same order', () => {
    const items = [0, 1, 2, 3, 4, 5];
    const a = stableShuffle(items, 'desu-d6');
    const b = stableShuffle(items, 'desu-d6');
    expect(a).toEqual(b);
    expect(a.slice().sort()).toEqual(items);
    expect(stableShuffle(items, 'desu-d8')).not.toEqual(a);
  });
});

describe('reviewDueLabel', () => {
  it('reads the schedule the SRS card actually holds', () => {
    expect(reviewDueLabel('2026-08-23', '2026-08-23')).toBe('Due for review today');
    expect(reviewDueLabel('2026-08-22', '2026-08-23')).toBe('Due for review today');
    expect(reviewDueLabel('2026-08-24', '2026-08-23')).toBe('Review tomorrow');
    expect(reviewDueLabel('2026-08-29', '2026-08-23')).toBe('Review in 6 days');
    expect(reviewDueLabel('2026-09-13', '2026-08-23')).toBe('Review in 3 weeks');
  });

  it('says nothing at all when the point has never been practised', () => {
    expect(reviewDueLabel(null)).toBeNull();
    expect(reviewDueLabel(undefined)).toBeNull();
  });
});
