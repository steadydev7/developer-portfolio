import { describe, it, expect } from 'vitest';
import { formatTenure } from './tenure';

describe('formatTenure', () => {
  it('counts both end months', () => {
    expect(formatTenure('Feb 2024 – Aug 2026')).toBe('2 yrs 7 mos');
    expect(formatTenure('Dec 2019 – Dec 2023')).toBe('4 yrs 1 mo');
    expect(formatTenure('Sep 2017 – Nov 2019')).toBe('2 yrs 3 mos');
  });

  it('drops a zero part', () => {
    expect(formatTenure('Jan 2020 – Dec 2020')).toBe('1 yr');
    expect(formatTenure('Mar 2021 – Mar 2021')).toBe('1 mo');
    expect(formatTenure('Mar 2021 – May 2021')).toBe('3 mos');
  });

  it('reads "Present" as the current month', () => {
    const now = new Date(2026, 9, 20);
    expect(formatTenure('Nov 2025 – Present', now)).toBe('1 yr');
  });

  it('accepts full month names and a plain hyphen', () => {
    expect(formatTenure('September 2017 - November 2019')).toBe('2 yrs 3 mos');
  });

  it('returns null for anything it cannot read', () => {
    expect(formatTenure('2021 - 2025')).toBeNull();
    expect(formatTenure('Summer 2020')).toBeNull();
    expect(formatTenure('Aug 2026 – Feb 2024')).toBeNull();
  });
});
