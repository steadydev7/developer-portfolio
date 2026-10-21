import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Signature from './Signature';

describe('Signature', () => {
  it('exposes the name as an accessible image', () => {
    render(<Signature name="Noah Thomas" />);
    expect(
      screen.getByRole('img', { name: /noah thomas — signature/i }),
    ).toBeInTheDocument();
  });

  it('writes the name in the script text', () => {
    const { container } = render(<Signature name="Jane Doe" />);
    const text = container.querySelector('text.signature__ink');
    expect(text).not.toBeNull();
    expect(text.textContent).toBe('Jane Doe');
  });

  it('starts un-drawn so the reveal can play on scroll-in', () => {
    const { container } = render(<Signature />);
    expect(container.querySelector('.signature.is-drawn')).toBeNull();
    const ink = container.querySelector('.signature__ink');
    expect(ink.style.strokeDashoffset).toBe(ink.style.strokeDasharray);
  });
});
