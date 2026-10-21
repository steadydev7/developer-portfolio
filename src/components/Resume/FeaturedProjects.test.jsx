import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FeaturedProjects from './FeaturedProjects';
import { projects } from '../../data/resumeData';

vi.mock('../../utils/analytics', () => ({ trackEvent: vi.fn() }));

const ordered = [...projects].sort(
  (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
);

const openDetailsFor = (name) =>
  fireEvent.click(
    screen.getByRole('button', { name: `View details for ${name}` }),
  );

describe('FeaturedProjects details', () => {
  it('gives every card a View details button', () => {
    render(<FeaturedProjects />);

    projects.forEach((project) => {
      expect(
        screen.getByRole('button', {
          name: `View details for ${project.name}`,
        }),
      ).toHaveAttribute('aria-haspopup', 'dialog');
    });
  });

  it('opens a dialog with the full project details and safe links', () => {
    render(<FeaturedProjects />);
    const [project] = ordered;
    openDetailsFor(project.name);

    const dialog = screen.getByRole('dialog', { name: project.name });
    expect(dialog).toHaveTextContent(project.description);
    project.highlights.forEach((item) =>
      expect(dialog).toHaveTextContent(item),
    );
    const techList = within(dialog).getByText('Built with').nextElementSibling;
    expect(
      [...techList.querySelectorAll('li')].map((li) => li.textContent),
    ).toEqual(project.tech);

    const visit = within(dialog).getByRole('link', { name: /visit site/i });
    expect(visit).toHaveAttribute('href', project.liveUrl);
    expect(visit).toHaveAttribute('target', '_blank');
    expect(visit).toHaveAttribute('rel', 'noopener noreferrer');
    expect(
      within(dialog).getByRole('button', { name: /close project details/i }),
    ).toHaveFocus();
  });

  it('moves between projects with Next / Previous, wrapping at the ends', async () => {
    render(<FeaturedProjects />);
    openDetailsFor(ordered[0].name);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: ordered[1].name }),
      ).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: ordered.at(-1).name }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByText(`${ordered.length} / ${ordered.length}`),
    ).toBeInTheDocument();
  });

  it('follows the arrow keys', async () => {
    render(<FeaturedProjects />);
    openDetailsFor(ordered[0].name);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: ordered[1].name }),
      ).toBeInTheDocument(),
    );
  });

  it('closes on Escape and on a backdrop click', async () => {
    render(<FeaturedProjects />);
    openDetailsFor(ordered[0].name);

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    openDetailsFor(ordered[0].name);
    fireEvent.click(document.querySelector('.project-details-backdrop'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
