import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Testimonials from './Testimonials';

// The real list starts empty, so these tests fill a mocked copy in place.
const data = vi.hoisted(() => ({ testimonials: [], recommendationsUrl: null }));
vi.mock('../../data/testimonials', () => data);

const SAMPLE = [
  {
    name: 'Jane Doe',
    role: 'Engineering Manager @ Example Co',
    relationship: 'Managed Noah at Example Co',
    quote: 'A sample quote for the first card.',
  },
  {
    name: 'John Roe',
    role: 'Staff Engineer @ Example Co',
    relationship: 'Worked with Noah at Example Co',
    quote: 'A sample quote for the second card.',
  },
];

const useSample = () => data.testimonials.splice(0, Infinity, ...SAMPLE);

describe('Testimonials', () => {
  afterEach(() => {
    data.testimonials.splice(0, Infinity);
    data.recommendationsUrl = null;
  });

  it('renders nothing while there are no testimonials', () => {
    const { container } = render(<Testimonials />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the pagination dots as real, labeled buttons (keyboard accessible)', () => {
    useSample();
    render(<Testimonials />);

    const dot = screen.getByLabelText('Go to testimonial 2');
    expect(dot.tagName).toBe('BUTTON');
  });

  it('switches testimonials when a pagination dot is clicked', async () => {
    useSample();
    render(<Testimonials />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Go to testimonial 2'));

    // AnimatePresence exits the old testimonial before mounting the new one.
    await waitFor(() =>
      expect(screen.getByText('John Roe')).toBeInTheDocument(),
    );
  });

  it('marks the active dot with aria-current', () => {
    useSample();
    render(<Testimonials />);

    expect(screen.getByLabelText('Go to testimonial 1')).toHaveAttribute(
      'aria-current',
      'true',
    );
    expect(screen.getByLabelText('Go to testimonial 2')).toHaveAttribute(
      'aria-current',
      'false',
    );
  });

  it('shows the recommendations link only when a URL is set', () => {
    useSample();
    const { rerender } = render(<Testimonials />);
    expect(screen.queryByText(/see all recommendations/i)).toBeNull();

    data.recommendationsUrl = 'https://example.com/recommendations';
    rerender(<Testimonials key="with-url" />);
    expect(
      screen.getByText(/see all recommendations/i).closest('a'),
    ).toHaveAttribute('href', 'https://example.com/recommendations');
  });
});
