import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contact from './Contact';
import { CONTACT } from '../../data/contact';

vi.mock('../../firebase', () => ({
  addMessage: vi.fn(() => Promise.resolve()),
}));

describe('Contact', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(() => Promise.resolve()) },
    });
  });

  it('copies the email address and confirms it', async () => {
    render(<Contact />);

    fireEvent.click(screen.getByLabelText('Copy email address'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(CONTACT.email);
    await waitFor(() =>
      expect(screen.getByLabelText('Email address copied')).toBeInTheDocument(),
    );
  });

  it('keeps the form closed until the call to action opens it', async () => {
    render(<Contact />);

    const cta = screen.getByRole('button', { name: /send me a message/i });
    expect(cta).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText(/^Name/)).not.toBeInTheDocument();

    fireEvent.click(cta);

    expect(cta).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument();
  });
});
