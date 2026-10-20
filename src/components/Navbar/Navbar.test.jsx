import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from './Navbar';
import { isSectionShown } from '../../data/sections';

describe('Navbar', () => {
  it('renders the theme toggle and nav links', () => {
    render(<Navbar theme="light" toggleTheme={vi.fn()} />);

    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Stats')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute(
      'href',
      '#resume',
    );
    // Optional sections only get a link while they have content.
    if (isSectionShown('testimonials')) {
      expect(screen.getByText('Testimonials')).toBeInTheDocument();
    } else {
      expect(screen.queryByText('Testimonials')).toBeNull();
    }
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });
});
