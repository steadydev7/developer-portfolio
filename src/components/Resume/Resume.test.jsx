import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Resume from './Resume';
import {
  skills,
  achievements,
  projects,
  experiences,
  education,
  interviewedCompanies,
} from '../../data/resumeData';

const cardTitles = (container) =>
  [...container.querySelectorAll('.project-card__name')].map((h) =>
    h.textContent.trim(),
  );

describe('Resume', () => {
  it('renders every skill under its category', () => {
    const { container } = render(<Resume />);
    const categories = [...container.querySelectorAll('.skills-category')];

    expect(categories.map((c) => c.querySelector('h4').textContent)).toEqual(
      Object.keys(skills),
    );
    Object.values(skills).forEach((items, i) => {
      const names = [...categories[i].querySelectorAll('.skill-item')].map(
        (item) => item.textContent.trim(),
      );
      expect(names).toEqual(items.map((skill) => skill.name));
    });
  });

  it('renders every experience as a timeline entry with a dot', () => {
    const { container } = render(<Resume />);

    const entries = container.querySelectorAll('.experience-entry');
    expect(entries).toHaveLength(experiences.length);
    experiences.forEach((exp, i) => {
      const entry = entries[i];
      expect(entry.querySelector('.experience-card__role')).toHaveTextContent(
        exp.role,
      );
      const company = entry.querySelector('.experience-card__company');
      expect(company).toHaveTextContent(exp.company);
      const link = company.querySelector('a');
      if (exp.url) {
        expect(link).toHaveAttribute('href', exp.url);
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      } else {
        expect(link).toBeNull();
      }
      expect(entry).toHaveTextContent(exp.date);
      expect(entry.querySelector('.experience-entry__dot')).not.toBeNull();
    });
  });

  it('shows three bullets per job until "Show more" is pressed', () => {
    const { container } = render(<Resume />);
    const entries = container.querySelectorAll('.experience-entry');

    experiences.forEach((exp, i) => {
      const bullets = exp.bullets ?? [];
      const collapsible = bullets.length > 4;
      const visible = () =>
        entries[i].querySelectorAll('.experience-card__bullets li').length;
      const toggle = entries[i].querySelector('.experience-card__toggle');

      if (!collapsible) {
        expect(visible()).toBe(bullets.length);
        expect(toggle).toBeNull();
        return;
      }
      expect(visible()).toBe(3);
      expect(toggle).toHaveTextContent(`Show ${bullets.length - 3} more`);
      expect(toggle).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(toggle);
      expect(visible()).toBe(bullets.length);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(toggle).toHaveTextContent('Show less');
    });
  });

  it('renders the education card, without a CGPA line when none is set', () => {
    const { container } = render(<Resume />);
    const card = container.querySelector('.education-item');

    expect(card).toHaveTextContent(education.school);
    expect(card).toHaveTextContent(education.degree);
    expect(card).toHaveTextContent(education.date);
    expect(
      card.querySelector('.org-logo-photo, .org-logo-fallback'),
    ).not.toBeNull();
    if (education.cgpa) {
      expect(card).toHaveTextContent(`CGPA: ${education.cgpa}`);
    } else {
      expect(card).not.toHaveTextContent('CGPA');
    }
  });

  it('renders every achievement inside a card, with a logo, or hides the section', () => {
    render(<Resume />);

    if (achievements.length === 0) {
      expect(screen.queryByText('Achievements')).toBeNull();
      return;
    }
    achievements.forEach((achievement) => {
      expect(screen.getByText(achievement.title)).toBeInTheDocument();
    });
    const items = document.querySelectorAll('.achievement-item');
    expect(items).toHaveLength(achievements.length);
    items.forEach((item) => {
      expect(
        item.querySelector('.org-logo-photo, .org-logo-fallback'),
      ).not.toBeNull();
    });
  });

  it('shows Interview Experience only when companies are listed', () => {
    render(<Resume />);
    const heading = screen.queryByText('Interview Experience');

    if (interviewedCompanies.length === 0) {
      expect(heading).toBeNull();
    } else {
      expect(heading).toBeInTheDocument();
    }
  });

  it('renders a Projects subsection inside the resume with every project', () => {
    const { container } = render(<Resume />);

    expect(container.querySelector('#projects')).not.toBeNull();
    const titles = cardTitles(container);
    projects.forEach((project) => {
      expect(titles.some((t) => t.includes(project.name))).toBe(true);
    });
    expect(container.querySelectorAll('.project-card')).toHaveLength(
      projects.length,
    );
  });

  it('orders featured projects first', () => {
    const { container } = render(<Resume />);
    const titles = cardTitles(container);
    projects
      .filter((p) => p.featured)
      .forEach((project, i) => {
        expect(titles[i]).toContain(project.name);
      });
  });

  it('links each project out safely in a new tab', () => {
    const { container } = render(<Resume />);
    const cards = [...container.querySelectorAll('.project-card')];

    projects.forEach((project) => {
      const card = cards.find((c) =>
        c
          .querySelector('.project-card__name')
          .textContent.includes(project.name),
      );
      const view = card.querySelector('.project-card__view');
      expect(view).toHaveAttribute('href', project.liveUrl ?? project.url);
      expect(view).toHaveAttribute('target', '_blank');
      expect(view).toHaveAttribute('rel', 'noopener noreferrer');

      const repo = card.querySelector('.project-card__repo');
      if (project.url) {
        expect(repo).toHaveAttribute('href', project.url);
      } else {
        expect(repo).toBeNull();
      }
    });
  });
});
