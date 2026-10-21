import { describe, it, expect, vi, afterEach } from 'vitest';
import { RESUME_URL, downloadResume, viewResume } from './resume';

describe('resume utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('points at the self-hosted PDF', () => {
    expect(RESUME_URL).toMatch(/\.pdf$/);
  });

  it('downloadResume creates and clicks a download link pointing at the PDF', () => {
    const clickSpy = vi.fn();
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = realCreateElement(tag);
      if (tag === 'a') el.click = clickSpy;
      return el;
    });

    downloadResume();

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('viewResume creates and clicks a link opening the resume in a new tab', () => {
    const clickSpy = vi.fn();
    let createdLink;
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = realCreateElement(tag);
      if (tag === 'a') {
        el.click = clickSpy;
        createdLink = el;
      }
      return el;
    });

    viewResume();

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(createdLink.href).toBe(
      new URL(RESUME_URL, window.location.href).href,
    );
    expect(createdLink.target).toBe('_blank');
    expect(createdLink.rel).toBe('noopener noreferrer');
  });
});
