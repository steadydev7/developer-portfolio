import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { AnimatePresence, m } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faCheck,
  faArrowLeft,
  faArrowRight,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { techIcons } from '../../data/resumeData';
import { getInitials } from '../../utils/initials';
import './ProjectDetails.scss';

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const hostname = (url) => new URL(url).hostname.replace(/^www\./, '');

// Locks the page behind the dialog without the layout jumping when the
// scrollbar disappears.
const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    };
  }, [locked]);
};

// A project's details window: rendered into <body> (the cards animate with
// transforms, which would otherwise pin a fixed overlay to the card), with
// Escape / backdrop to close, ← → between projects, and Tab kept inside.
const ProjectDetails = ({
  project,
  cover,
  icon,
  position,
  total,
  prevName,
  nextName,
  onClose,
  onPrev,
  onNext,
  onLinkClick,
}) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const open = Boolean(project);

  useScrollLock(open);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open, project?.name]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && total > 1) {
        onPrev();
      } else if (event.key === 'ArrowRight' && total > 1) {
        onNext();
      } else if (event.key === 'Tab' && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, total, onClose, onPrev, onNext]);

  const titleId = 'project-details-title';

  return createPortal(
    <AnimatePresence>
      {open && (
        <m.div
          className="project-details-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <m.div
            ref={dialogRef}
            className="project-details"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: 16,
              scale: 0.98,
              transition: { duration: 0.15 },
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeRef}
              type="button"
              className="project-details__close"
              onClick={onClose}
              aria-label="Close project details"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <m.div
              key={project.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="project-details__cover">
                {cover ? (
                  <img src={cover} alt={`${project.name} website`} />
                ) : (
                  <span className="project-details__art">
                    {icon ? (
                      <img src={icon} alt="" />
                    ) : (
                      getInitials(project.name)
                    )}
                  </span>
                )}
                {project.category && (
                  <span className="project-details__tag">
                    {project.category}
                  </span>
                )}
              </div>

              <div className="project-details__body">
                <header className="project-details__header">
                  <div>
                    <h3 id={titleId} className="project-details__name">
                      {project.name}
                    </h3>
                    {project.liveUrl && (
                      <p className="project-details__host">
                        {hostname(project.liveUrl)}
                      </p>
                    )}
                  </div>
                  <div className="project-details__actions">
                    {project.url && (
                      <a
                        className="project-details__btn project-details__btn--ghost"
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onLinkClick('repo')}
                      >
                        <FontAwesomeIcon icon={faGithub} /> Source
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        className="project-details__btn"
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onLinkClick('demo')}
                      >
                        Visit site{' '}
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                      </a>
                    )}
                  </div>
                </header>

                <p className="project-details__description">
                  {project.description}
                </p>

                <div className="project-details__grid">
                  {project.highlights?.length > 0 && (
                    <div>
                      <h4 className="project-details__label">Key features</h4>
                      <ul className="project-details__features">
                        {project.highlights.map((item) => (
                          <li key={item}>
                            <FontAwesomeIcon
                              icon={faCheck}
                              aria-hidden="true"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="project-details__aside">
                    {project.role && (
                      <div>
                        <h4 className="project-details__label">My role</h4>
                        <p className="project-details__role">{project.role}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="project-details__label">Built with</h4>
                      <ul className="project-details__tech">
                        {project.tech.map((name) => (
                          <li key={name}>
                            {techIcons[name] && (
                              <FontAwesomeIcon
                                icon={techIcons[name]}
                                aria-hidden="true"
                              />
                            )}
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>

            {total > 1 && (
              <nav className="project-details__nav" aria-label="Other projects">
                <button type="button" onClick={onPrev}>
                  <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                  <span>
                    <span className="project-details__nav-hint">Previous</span>
                    {prevName}
                  </span>
                </button>
                <span className="project-details__count">
                  {position} / {total}
                </span>
                <button type="button" onClick={onNext}>
                  <span>
                    <span className="project-details__nav-hint">Next</span>
                    {nextName}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </button>
              </nav>
            )}
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

ProjectDetails.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    tech: PropTypes.arrayOf(PropTypes.string).isRequired,
    category: PropTypes.string,
    url: PropTypes.string,
    liveUrl: PropTypes.string,
    role: PropTypes.string,
    highlights: PropTypes.arrayOf(PropTypes.string),
  }),
  cover: PropTypes.string,
  icon: PropTypes.string,
  position: PropTypes.number,
  total: PropTypes.number,
  prevName: PropTypes.string,
  nextName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onLinkClick: PropTypes.func.isRequired,
};

export default ProjectDetails;
