import { useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faCalendar,
  faChevronDown,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';
import { experiences } from '../../data/resumeData';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { formatTenure } from '../../utils/tenure';
import OrgLogo from './OrgLogo';
import './ExperienceTimeline.scss';

// Just enough lag that the head glides after a wheel notch instead of
// jumping with it.
const PROGRESS_SPRING = { stiffness: 160, damping: 28, mass: 0.4 };

// Bullets shown before "Show more". A list only one longer than this is
// shown whole: a button that reveals a single line isn't worth the click.
const VISIBLE_BULLETS = 3;

const ENTRANCE = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { type: 'spring', stiffness: 260, damping: 26 },
};

const ExperienceEntry = ({ exp, reached, current, dotRef }) => {
  const [expanded, setExpanded] = useState(false);
  const bulletsId = useId();
  const tenure = formatTenure(exp.date);
  const bullets = exp.bullets ?? [];
  const collapsible = bullets.length > VISIBLE_BULLETS + 1;
  const shownBullets =
    collapsible && !expanded ? bullets.slice(0, VISIBLE_BULLETS) : bullets;

  return (
    <li
      className={`experience-entry${reached ? ' is-reached' : ''}${
        current ? ' is-current' : ''
      }`}
    >
      <span className="experience-entry__dot" ref={dotRef} aria-hidden="true" />

      <div className="experience-entry__when">
        <p className="experience-entry__date">
          <FontAwesomeIcon icon={faCalendar} /> {exp.date}
        </p>
        {tenure && <p className="experience-entry__tenure">{tenure}</p>}
        <p className="experience-entry__place">
          <FontAwesomeIcon icon={faLocationDot} /> {exp.location}
        </p>
        {exp.type && (
          <p className="experience-entry__place">
            <FontAwesomeIcon icon={faBriefcase} /> {exp.type}
          </p>
        )}
      </div>

      <m.article className="experience-card" {...ENTRANCE}>
        <div className="experience-card__main">
          <header className="experience-card__header">
            <OrgLogo name={exp.company} />
            <div>
              <h4 className="experience-card__role">{exp.role}</h4>
              <p className="experience-card__company">
                {exp.url ? (
                  <a href={exp.url} target="_blank" rel="noopener noreferrer">
                    {exp.company}
                  </a>
                ) : (
                  exp.company
                )}
              </p>
            </div>
          </header>

          {exp.summary && (
            <p className="experience-card__summary">{exp.summary}</p>
          )}

          {bullets.length > 0 && (
            <ul id={bulletsId} className="experience-card__bullets">
              {shownBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}

          {collapsible && (
            <button
              type="button"
              className={`experience-card__toggle${
                expanded ? ' is-expanded' : ''
              }`}
              aria-expanded={expanded}
              aria-controls={bulletsId}
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded
                ? 'Show less'
                : `Show ${bullets.length - VISIBLE_BULLETS} more`}
              <FontAwesomeIcon icon={faChevronDown} aria-hidden="true" />
            </button>
          )}
        </div>

        {exp.stack?.length > 0 && (
          <div className="experience-card__aside">
            <p className="experience-card__aside-label">Tech stack</p>
            <ul className="experience-card__stack">
              {exp.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </div>
        )}
      </m.article>
    </li>
  );
};

ExperienceEntry.propTypes = {
  exp: PropTypes.shape({
    company: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    type: PropTypes.string,
    url: PropTypes.string,
    summary: PropTypes.string,
    bullets: PropTypes.arrayOf(PropTypes.string),
    stack: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  reached: PropTypes.bool.isRequired,
  current: PropTypes.bool.isRequired,
  dotRef: PropTypes.func.isRequired,
};

const ExperienceTimeline = () => {
  const trackRef = useRef(null);
  const dotRefs = useRef([]);
  const [reachedCount, setReachedCount] = useState(0);
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // 0 when the top of the timeline reaches the middle of the viewport, 1
  // when its bottom does, so the head always sits at the viewport's middle
  // while the timeline is passing through it.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start center', 'end center'],
  });
  const smoothProgress = useSpring(scrollYProgress, PROGRESS_SPRING);
  const progress = prefersReducedMotion ? scrollYProgress : smoothProgress;
  const headTop = useTransform(progress, (value) => `${value * 100}%`);
  const headOpacity = useTransform(progress, [0, 0.02], [0, 1]);

  // An entry lights up once the head has slid past its dot. Entries are in
  // order, so the count alone says which ones; the last one lit is the one
  // being read.
  useMotionValueEvent(progress, 'change', (value) => {
    const track = trackRef.current;
    if (!track) return;
    const { top, height } = track.getBoundingClientRect();
    const headY = top + value * height;
    const count = dotRefs.current.filter((dot) => {
      if (!dot) return false;
      const rect = dot.getBoundingClientRect();
      return rect.top + rect.height / 2 <= headY + 1;
    }).length;
    setReachedCount(count);
  });

  return (
    <div className="experience-timeline">
      {/* Framer's own in-view reveal rather than data-aos: scrollReveal only
          picks up [data-aos] nodes present on first load, so one remounted
          later (a hot reload) would stay invisible. */}
      <m.div className="projects-showcase__header" {...ENTRANCE}>
        <div>
          <span className="projects-showcase__eyebrow">Experience</span>
          <h3 className="projects-showcase__title">
            Where I&apos;ve{' '}
            <span className="projects-showcase__accent">Worked</span>
          </h3>
        </div>
      </m.div>

      <div className="experience-timeline__track" ref={trackRef}>
        <span className="experience-timeline__rail" aria-hidden="true">
          <m.span
            className="experience-timeline__fill"
            style={{ scaleY: progress }}
          />
          <m.span
            className="experience-timeline__head"
            style={{ top: headTop, opacity: headOpacity }}
          />
        </span>

        <ol className="experience-timeline__list">
          {experiences.map((exp, index) => (
            <ExperienceEntry
              key={`${exp.company}-${exp.role}`}
              exp={exp}
              reached={index < reachedCount}
              current={index === reachedCount - 1}
              dotRef={(el) => {
                dotRefs.current[index] = el;
              }}
            />
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ExperienceTimeline;
