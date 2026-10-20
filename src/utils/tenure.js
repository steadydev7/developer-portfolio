const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

// "Feb 2024" / "February 2024" / "Present" -> months since year 0.
const toMonthIndex = (text, now) => {
  const value = text.trim().toLowerCase();
  if (value === 'present') return now.getFullYear() * 12 + now.getMonth();
  const match = value.match(/^([a-z]{3})[a-z]*\.?\s+(\d{4})$/);
  if (!match) return null;
  const month = MONTHS.indexOf(match[1]);
  return month === -1 ? null : Number(match[2]) * 12 + month;
};

const plural = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'}`;

/**
 * How long a "Mon YYYY – Mon YYYY" (or "Mon YYYY – Present") range lasted,
 * counting both end months the way LinkedIn does, e.g.
 * "Feb 2024 – Aug 2026" -> "2 yrs 7 mos".
 *
 * @param {string} range
 * @param {Date} [now] - What "Present" means.
 * @returns {string|null} null when the range can't be read.
 */
export const formatTenure = (range, now = new Date()) => {
  const [from, to] = range.split(/\s*[–—-]\s*/);
  if (!from || !to) return null;
  const start = toMonthIndex(from, now);
  const end = toMonthIndex(to, now);
  if (start === null || end === null || end < start) return null;

  const total = end - start + 1;
  const years = Math.floor(total / 12);
  const months = total % 12;
  return [years && plural(years, 'yr'), months && plural(months, 'mo')]
    .filter(Boolean)
    .join(' ');
};
