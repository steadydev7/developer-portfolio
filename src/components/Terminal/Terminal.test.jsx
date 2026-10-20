import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Terminal from './Terminal';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));
vi.mock('react-scroll', () => ({ scroller: { scrollTo: vi.fn() } }));
vi.mock('../../utils/resume', () => ({ downloadResume: vi.fn() }));

const openTerminal = () => {
  fireEvent.click(screen.getByLabelText(/open interactive terminal/i));
};

const run = (command) => {
  const input = screen.getByLabelText('Terminal command input');
  fireEvent.change(input, { target: { value: command } });
  fireEvent.keyDown(input, { key: 'Enter' });
};

describe('Terminal', () => {
  it('is closed by default', () => {
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens on trigger click and shows the intro line', () => {
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);

    openTerminal();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/type 'help'/i)).toBeInTheDocument();
  });

  it('runs the help command and prints the command list', () => {
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);
    openTerminal();

    const input = screen.getByLabelText('Terminal command input');
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Available commands:')).toBeInTheDocument();
  });

  it('shows a "command not found" message for unknown input', () => {
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);
    openTerminal();

    const input = screen.getByLabelText('Terminal command input');
    fireEvent.change(input, { target: { value: 'bogus' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText(/command not found: bogus/i)).toBeInTheDocument();
  });

  it('recalls the previous command with ArrowUp', () => {
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);
    openTerminal();

    const input = screen.getByLabelText('Terminal command input');
    fireEvent.change(input, { target: { value: 'whoami' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.value).toBe('whoami');
  });

  it('whoami describes Noah from the resume data', () => {
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);
    openTerminal();
    run('whoami');

    expect(
      screen.getByText('Noah Thomas — Senior AI Software Engineer'),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Most recently /)).toBeInTheDocument();
  });

  it('says so instead of opening a LinkedIn profile that is not listed', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);
    openTerminal();
    run('linkedin');

    expect(
      screen.getByText('No LinkedIn profile listed yet.'),
    ).toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('does not offer to open a section that is hidden', () => {
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);
    openTerminal();
    run('open testimonials');

    expect(
      screen.getByText("open: unknown section 'testimonials'"),
    ).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    render(<Terminal theme="light" toggleTheme={vi.fn()} />);
    openTerminal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    // Framer Motion keeps the dialog mounted during its exit transition, so
    // the unmount happens asynchronously after this point.
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });
});
