import { describe, it, expect } from 'vitest';
import { bentoSpans } from './bentoSpans';

const desktopRows = (spans) => {
  const rows = [];
  let row = [];
  let width = 0;
  spans.forEach(({ lg }) => {
    row.push(lg);
    width += lg;
    if (width === 6) {
      rows.push(row);
      row = [];
      width = 0;
    }
  });
  return { rows, leftover: row };
};

describe('bentoSpans', () => {
  it('gives the lead card two thirds of the first row', () => {
    expect(bentoSpans(5).map((s) => s.lg)).toEqual([4, 2, 2, 2, 2]);
  });

  it('never leaves a hole in the last desktop row', () => {
    for (let count = 1; count <= 12; count += 1) {
      const { leftover } = desktopRows(bentoSpans(count));
      expect(leftover).toEqual([]);
    }
  });

  it('spreads leftover cards instead of leaving one alone', () => {
    expect(bentoSpans(3).map((s) => s.lg)).toEqual([6, 3, 3]);
    expect(bentoSpans(4).map((s) => s.lg)).toEqual([4, 2, 3, 3]);
    expect(bentoSpans(6).map((s) => s.lg)).toEqual([4, 2, 3, 3, 3, 3]);
    for (let count = 2; count <= 12; count += 1) {
      const { rows } = desktopRows(bentoSpans(count));
      expect(rows.at(-1).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('fills the two tablet columns, with the lead card full width', () => {
    for (let count = 1; count <= 12; count += 1) {
      const md = bentoSpans(count).map((s) => s.md);
      expect(md[0]).toBe(2);
      expect(md.reduce((sum, span) => sum + span, 0) % 2).toBe(0);
    }
  });
});
