import { describe, it, expect } from 'vitest';
import { JLPT_LEVELS } from '../types';
import {
  buildMockExam,
  EXAM_CONFIG,
  examTotal,
  MOCK_SECTIONS,
  SCORING,
  scoreExamOfficial,
} from './mockExam';

describe('mock exam builder', () => {
  for (const level of JLPT_LEVELS) {
    describe(level, () => {
      const config = EXAM_CONFIG[level];
      const exam = buildMockExam(level);

      it('produces the configured number of questions', () => {
        expect(exam.length).toBe(examTotal(config));
      });

      it('fills every section (incl. listening) to its configured count', () => {
        for (const section of MOCK_SECTIONS) {
          const n = exam.filter((q) => q.section === section).length;
          expect(n, `${level} ${section}`).toBe(config.perSection[section]);
        }
      });

      it('gives every question exactly 4 unique options and an in-range correct index', () => {
        for (const q of exam) {
          expect(q.options.length, q.id).toBe(4);
          expect(new Set(q.options).size, `${q.id} has duplicate options`).toBe(4);
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(q.options.length);
          expect(q.options[q.correctIndex], `${q.id} correct option is non-empty`).toBeTruthy();
        }
      });

      it('gives listening questions audio and no visible japanese', () => {
        for (const q of exam.filter((x) => x.section === 'listening')) {
          expect(q.audioText, `${q.id} has audioText`).toBeTruthy();
          expect(q.japanese, `${q.id} hides the transcript`).toBeUndefined();
        }
      });

      it('keeps sections in official order (vocab → kanji → grammar → reading → listening)', () => {
        const order = exam.map((q) => MOCK_SECTIONS.indexOf(q.section));
        expect(order).toEqual([...order].sort((a, b) => a - b));
      });
    });
  }
});

describe('official JLPT scoring', () => {
  it('scores a fully-correct exam as 180/180 and an official pass', () => {
    const exam = buildMockExam('N5');
    const answers = exam.map((q) => q.correctIndex);
    const r = scoreExamOfficial('N5', exam, answers);
    expect(r.scaled).toBe(180);
    expect(r.passed).toBe(true);
    expect(r.sections.every((s) => s.passed)).toBe(true);
  });

  it('scores an all-blank exam as 0 and a fail', () => {
    const exam = buildMockExam('N4');
    const r = scoreExamOfficial('N4', exam, exam.map(() => null));
    expect(r.scaled).toBe(0);
    expect(r.passed).toBe(false);
  });

  it('fails on a sectional minimum even when the overall mark is met', () => {
    const exam = buildMockExam('N3');
    // Everything correct except the whole listening section → listening scaled 0 (< 19).
    const answers = exam.map((q) => (q.section === 'listening' ? (q.correctIndex + 1) % q.options.length : q.correctIndex));
    const r = scoreExamOfficial('N3', exam, answers);
    expect(r.scaled).toBeGreaterThanOrEqual(SCORING.N3.overallPass); // overall mark cleared
    expect(r.passed).toBe(false); // but a section fell short
    expect(r.failedOnSection).toBe(true);
    expect(r.sections.find((s) => s.key === 'listening')!.passed).toBe(false);
  });
});
