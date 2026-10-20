import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from './About';
import { experiences } from '../../data/resumeData';
import { CONTACT } from '../../data/contact';

describe('About', () => {
  it('shows the bio beside an at-a-glance card drawn from the data', () => {
    const { container } = render(<About />);

    expect(container.querySelectorAll('.about-bio p')).toHaveLength(2);
    expect(screen.getByText('At a glance')).toBeInTheDocument();
    expect(
      screen.getByText(`${experiences[0].role} @ ${experiences[0].company}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`^${CONTACT.workMode} · `)),
    ).toBeInTheDocument();
  });

  it('does not repeat the contact details the Contact section shows', () => {
    render(<About />);

    expect(screen.queryByText(CONTACT.email)).toBeNull();
    expect(screen.queryByText(CONTACT.phone)).toBeNull();
  });
});
