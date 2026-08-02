import { describe, it, expect } from 'vitest';
import { JLPT_LEVELS } from '../types';
import {
  buildMockExam,
  EXAM_CONFIG,
  examTotal,
  MOCK_SECTIONS,
  PASS_THRESHOLD,
  scoreExam,
} from './mockExam';

describe('mock exam builder', () => {
  for (const level of JLPT_LEVELS) {
    describe(level, () => {
      const config = EXAM_CONFIG[level];
      const exam = buildMockExam(level);

      it('produces the configured number of questions', () => {
        expect(exam.length).toBe(examTotal(config));
      });

      it('fills every section to its configured count', () => {
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

      it('keeps sections in a stable order (vocab → kanji → grammar → reading)', () => {
        const order = exam.map((q) => MOCK_SECTIONS.indexOf(q.section));
        const sorted = [...order].sort((a, b) => a - b);
        expect(order).toEqual(sorted);
      });
    });
  }

  it('scores a fully-correct exam as 100% and a passing result', () => {
    const exam = buildMockExam('N5');
    const answers = exam.map((q) => q.correctIndex);
    const { correct, total, bySection } = scoreExam(exam, answers);
    expect(correct).toBe(total);
    expect(correct / total).toBeGreaterThanOrEqual(PASS_THRESHOLD);
    expect(bySection.reduce((n, s) => n + s.total, 0)).toBe(total);
  });

  it('counts unanswered questions as wrong', () => {
    const exam = buildMockExam('N4');
    const answers = exam.map(() => null);
    const { correct, total } = scoreExam(exam, answers);
    expect(correct).toBe(0);
    expect(total).toBe(exam.length);
  });
});
