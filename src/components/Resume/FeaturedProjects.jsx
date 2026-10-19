import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { m } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { trackEvent } from '../../utils/analytics';
import { useVirtualPageView } from '../../hooks/useVirtualPageView';
import { slugify } from '../../utils/slugify';
import { getInitials } from '../../utils/initials';
import { projects, techIcons } from '../../data/resumeData';
import { CONTACT } from '../../data/contact';
import { bentoSpans } from '../../utils/bentoSpans';
import './FeaturedProjects.scss';

// Drop an icon at src/assets/images/projects/<slug>.<ext> (slug = name with
// non-alphanumerics as "_", e.g. egypt_metro_backend.png) and it's matched
// to its project by filename — no code change. It's shown floating in the
// middle of the card's cover; a `cover` screenshot on the project fills the
// whole cover instead.
const projectImages = import.meta.glob(
  '../../assets/images/projects/*.{png,jpg,jpeg,webp,svg}',
  { eager: true, query: '?url', import: 'default' },
);
const projectImageBySlug = Object.fromEntries(
  Object.entries(projectImages).map(([path, url]) => [
    path
      .split('/')
      .pop()
      .replace(/\.[^.]+$/, ''),
    url,
  ]),
);

const MAX_STACK_ICONS = 5;

// Lifts on hover; its own transition so the lift isn't held back by the
// staggered entrance delay.
const CARD_HOVER = {
  y: -6,
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
  transition: { type: 'spring', stiffness: 300, damping: 22 },
};

const githubProfile = CONTACT.socials.find((s) => s.label === 'GitHub');
const ALL_PROJECTS_URL = githubProfile
  ? `${githubProfile.url}?tab=repositories`
  : null;

const trackProjectClick = (name, linkType) =>
  trackEvent('select_content', {
    content_type: 'project',
    content_id: `${slugify(name)}_${linkType}`,
  });

const TechStack = ({ tech }) => {
  const shown = tech.slice(0, MAX_STACK_ICONS);
  const hidden = tech.slice(MAX_STACK_ICONS);

  return (
    <ul className="project-card__stack" aria-label="Tech stack">
      {shown.map((name) => (
        <li key={name} title={name}>
          {techIcons[name] ? (
            <FontAwesomeIcon icon={techIcons[name]} aria-hidden="true" />
          ) : (
            <span className="project-card__stack-abbr" aria-hidden="true">
              {getInitials(name)}
            </span>
          )}
          <span className="visually-hidden">{name}</span>
        </li>
      ))}
      {hidden.length > 0 && (
        <li title={hidden.join(', ')} className="project-card__stack-more">
          <span aria-hidden="true">+{hidden.length}</span>
          <span className="visually-hidden">{hidden.join(', ')}</span>
        </li>
      )}
    </ul>
  );
};

TechStack.propTypes = {
  tech: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const FeaturedProjects = () => {
  const sectionRef = useVirtualPageView('Projects', '/#projects');

  // Featured first, otherwise data order (Array.sort is stable).
  const orderedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)),
    [],
  );
  const spans = bentoSpans(orderedProjects.length);

  return (
    <div className="projects-showcase" id="projects" ref={sectionRef}>
      <div className="projects-showcase__header" data-aos="fade-up">
        <div>
          <span className="projects-showcase__eyebrow">Projects</span>
          <h3 className="projects-showcase__title">
            Featured <span className="projects-showcase__accent">Work</span>
          </h3>
        </div>
        {ALL_PROJECTS_URL && (
          <a
            className="projects-showcase__all"
            href={ALL_PROJECTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent('select_content', {
                content_type: 'project',
                content_id: 'all_projects',
              })
            }
          >
            View all projects <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      <div className="projects-bento">
        {orderedProjects.map((project, index) => {
          const icon =
            project.image ?? projectImageBySlug[slugify(project.name)] ?? null;
          const primaryUrl = project.liveUrl ?? project.url;
          const primaryType = project.liveUrl ? 'demo' : 'repo';
          const isLead = index === 0;

          return (
            <m.div
              key={project.name}
              className={`project-card${isLead ? ' is-lead' : ''}`}
              style={{
                '--span-lg': spans[index].lg,
                '--span-md': spans[index].md,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={CARD_HOVER}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 22,
                delay: index * 0.08,
              }}
            >
              <div className="project-card__cover">
                <a
                  className="project-card__cover-link"
                  href={primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => trackProjectClick(project.name, primaryType)}
                >
                  {project.cover ? (
                    <img
                      className="project-card__shot"
                      src={project.cover}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <span className="project-card__art">
                      {icon ? (
                        <img
                          className="project-card__icon"
                          src={icon}
                          alt=""
                          width="120"
                          height="120"
                          loading="lazy"
                        />
                      ) : (
                        <span className="project-card__icon project-card__icon--fallback">
                          {getInitials(project.name)}
                        </span>
                      )}
                    </span>
                  )}
                  <span className="project-card__peek">
                    View project <span aria-hidden="true">↗</span>
                  </span>
                </a>
                {project.category && (
                  <span className="project-card__tag">{project.category}</span>
                )}
              </div>

              <div className="project-card__body">
                <h4 className="project-card__name">{project.name}</h4>
                <p className="project-card__description">
                  {project.description}
                </p>

                <div className="project-card__footer">
                  <TechStack tech={project.tech} />
                  <div className="project-card__links">
                    <a
                      className="project-card__repo"
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.name} source on GitHub`}
                      title="Source on GitHub"
                      onClick={() => trackProjectClick(project.name, 'repo')}
                    >
                      <FontAwesomeIcon icon={faGithub} />
                    </a>
                    <a
                      className="project-card__view"
                      href={primaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackProjectClick(project.name, primaryType)
                      }
                    >
                      View project
                      <span className="visually-hidden">
                        : {project.name}
                        {project.liveUrl ? ' live demo' : ' on GitHub'}
                      </span>{' '}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </m.div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProjects;
