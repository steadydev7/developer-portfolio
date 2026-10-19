import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './Home';
import { PROFILE } from '../../data/profile';
import { CONTACT } from '../../data/contact';

describe('Home', () => {
  it('shows the name as the page heading', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      `${PROFILE.firstName}${PROFILE.lastName}`,
    );
  });

  it('shows the status pill with the location', () => {
    render(<Home />);

    expect(screen.getByText(PROFILE.status)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(CONTACT.location.replace(/[,.]/g, '.'))),
    ).toBeInTheDocument();
  });

  it('links the calls to action to the contact and projects sections', () => {
    render(<Home />);

    expect(screen.getByText(/get in touch/i).closest('a')).toHaveAttribute(
      'href',
      '#contact',
    );
    expect(screen.getByText(/view work/i).closest('a')).toHaveAttribute(
      'href',
      '#projects',
    );
  });

  it('links every social profile out safely', () => {
    render(<Home />);

    CONTACT.socials.forEach((social) => {
      const link = screen.getByLabelText(social.label);
      expect(link).toHaveAttribute('href', social.url);
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
