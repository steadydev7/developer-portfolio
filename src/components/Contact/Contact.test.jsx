import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Contact from './Contact';
import { CONTACT } from '../../data/contact';
import { addMessage } from '../../firebase';

vi.mock('../../firebase', () => ({
  addMessage: vi.fn(() => Promise.resolve()),
}));

const sendEmail = vi.fn(() => Promise.resolve({ status: 200 }));
vi.mock('emailjs-com', () => ({
  default: { send: (...a) => sendEmail(...a) },
}));

const openAndFillForm = async () => {
  fireEvent.click(screen.getByRole('button', { name: /send me a message/i }));
  fireEvent.change(await screen.findByLabelText(/^Name/), {
    target: { value: 'Ada' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^Email/ }), {
    target: { value: 'ada@example.com' },
  });
  fireEvent.change(screen.getByLabelText(/^Message/), {
    target: { value: 'Hello there' },
  });
  fireEvent.submit(screen.getByLabelText(/^Message/).closest('form'));
};

const stubEmailJs = (value) => {
  vi.stubEnv('VITE_EMAILJS_SERVICE_ID', value);
  vi.stubEnv('VITE_EMAILJS_TEMPLATE_ID', value);
  vi.stubEnv('VITE_EMAILJS_USER_ID', value);
};

describe('Contact', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(() => Promise.resolve()) },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('links the WhatsApp number to a wa.me chat in a new tab', () => {
    render(<Contact />);
    const link = screen.getByText(CONTACT.whatsapp).closest('a');

    expect(link).toHaveAttribute(
      'href',
      `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`,
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('lists the phone number as a tap-to-call link under the email', () => {
    render(<Contact />);
    const phone = screen.getByText(CONTACT.phone);

    expect(phone.closest('a')).toHaveAttribute(
      'href',
      `tel:${CONTACT.phone.replace(/[^\d+]/g, '')}`,
    );
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

  it('opens a filled-in email draft when EmailJS is not configured', async () => {
    stubEmailJs('');
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Contact />);

    await openAndFillForm();

    const [url, target] = open.mock.calls[0];
    expect(target).toBe('_self');
    expect(url).toMatch(new RegExp(`^mailto:${CONTACT.email}\\?subject=`));
    expect(decodeURIComponent(url)).toContain('Hello there');
    expect(decodeURIComponent(url)).toContain('ada@example.com');
    expect(
      await screen.findByText(/email app should open/i),
    ).toBeInTheDocument();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('counts a message as sent when EmailJS delivers it, even if the backup copy fails', async () => {
    stubEmailJs('configured');
    addMessage.mockImplementationOnce(() => Promise.reject(new Error('no db')));
    render(<Contact />);

    await openAndFillForm();

    expect(
      await screen.findByText(/message sent successfully/i),
    ).toBeInTheDocument();
    expect(sendEmail).toHaveBeenCalled();
  });
});
