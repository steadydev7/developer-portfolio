import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SkillGlobe from './SkillGlobe';
import { skills } from '../../data/resumeData';

const allSkills = Object.values(skills).flat();
const areaNames = Object.keys(skills);

describe('SkillGlobe', () => {
  it('puts every skill on the globe as a chip', () => {
    const { container } = render(<SkillGlobe skills={skills} />);
    const chips = [...container.querySelectorAll('.skill-globe__chip')].map(
      (chip) => chip.textContent,
    );

    expect(chips).toHaveLength(allSkills.length);
    allSkills.forEach((skill) => expect(chips).toContain(skill.name));
  });

  it('starts every area, in order, with its headline skill', () => {
    const { container } = render(<SkillGlobe skills={skills} />);
    const chips = [...container.querySelectorAll('.skill-globe__chip')];

    Object.values(skills).forEach((items, area) => {
      expect(chips[area]).toHaveTextContent(items[0].name);
    });
  });

  it('highlights one area at a time from its button', () => {
    const { container } = render(<SkillGlobe skills={skills} />);
    const [first, second] = areaNames;
    const firstButton = screen.getByRole('button', { name: /^Languages/ });
    const secondButton = screen.getByTitle(second);

    expect(screen.getByText(/Drag to spin/)).toBeInTheDocument();
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByText(`${first} · ${skills[first].length} skills`),
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('.skill-globe__chip.is-focused'),
    ).toHaveLength(skills[first].length);

    fireEvent.click(secondButton);
    expect(firstButton).toHaveAttribute('aria-pressed', 'false');
    expect(secondButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(secondButton);
    expect(secondButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText(/Drag to spin/)).toBeInTheDocument();
  });

  it('names the hovered skill and its area', () => {
    render(<SkillGlobe skills={skills} />);
    const [area] = areaNames;
    const skill = skills[area][0];

    fireEvent.pointerEnter(screen.getByText(skill.name));
    expect(screen.getByText(`${skill.name} · ${area}`)).toBeInTheDocument();
  });

  it('renders nothing without skills', () => {
    const { container } = render(<SkillGlobe skills={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
