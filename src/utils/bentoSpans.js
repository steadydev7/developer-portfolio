// Column spans for a 6-column bento grid (desktop) and a 2-column one
// (tablet). The lead card takes two thirds of the first row and later rows
// hold three cards. Leftovers are spread instead of leaving a hole: two
// leftover cards share the last row, and a single leftover turns the last
// four cards into two rows of two.
export const bentoSpans = (count) => {
  let lg;
  if (count === 1) lg = [6];
  else if (count === 3) lg = [6, 3, 3];
  else {
    lg = Array.from({ length: count }, (_, index) => (index === 0 ? 4 : 2));
    const remainder = (count - 2) % 3;
    const halves = remainder === 2 ? 2 : remainder === 1 ? 4 : 0;
    for (let index = count - halves; index < count; index += 1) lg[index] = 3;
  }

  return lg.map((span, index) => ({
    lg: span,
    md: index === 0 || (count % 2 === 0 && index === count - 1) ? 2 : 1,
  }));
};
