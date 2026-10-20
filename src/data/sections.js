import { testimonials } from './testimonials';

// Sections that only exist while they have content. The navbar, footer,
// command palette and terminal skip any id mapped to false here, so no link
// points at a section that isn't on the page.
const SHOWN = {
  testimonials: testimonials.length > 0,
};

export const isSectionShown = (id) => SHOWN[id] ?? true;
