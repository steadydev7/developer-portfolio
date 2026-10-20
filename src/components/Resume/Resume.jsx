import { Container, Row, Col } from 'react-bootstrap';
import { m } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { trackEvent } from '../../utils/analytics';
import { useVirtualPageView } from '../../hooks/useVirtualPageView';
import { slugify } from '../../utils/slugify';
import {
  RESUME_URL,
  RESUME_FILE_NAME,
  downloadResume,
  viewResume,
} from '../../utils/resume';
import {
  education,
  interviewedCompanies,
  achievements,
  skills,
} from '../../data/resumeData';
import {
  faCalendar,
  faLocationDot,
  faBuilding,
  faDownload,
  faEye,
  faArrowUpRightFromSquare,
  faAward,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import ExperienceTimeline from './ExperienceTimeline';
import FeaturedProjects from './FeaturedProjects';
import OrgLogo from './OrgLogo';
import InterviewMarquee from './InterviewMarquee';
import './Resume.scss';

// Framer's in-view reveal rather than data-aos, which only picks up nodes
// present on first load (see utils/scrollReveal.js).
const REVEAL = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { type: 'spring', stiffness: 260, damping: 26 },
};

// Lifts on hover; its own transition so the lift isn't held back by the
// staggered entrance delay.
const CARD_HOVER = {
  y: -6,
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
  transition: { type: 'spring', stiffness: 300, damping: 22 },
};

const Resume = () => {
  const sectionRef = useVirtualPageView('Resume', '/#resume');

  const handleResumeView = () => {
    trackEvent('select_content', {
      content_type: 'resume',
      content_id: 'resume_view',
    });

    viewResume();
  };

  const handleResumeDownload = () => {
    // Matches GA4's own "file_download" recommended-event schema so this
    // reads correctly in the standard reports. Enhanced Measurement's
    // automatic file-download detection must stay OFF for this data stream
    // (Admin > Data Streams > Enhanced measurement) or the same click gets
    // counted twice under the same event name.
    trackEvent('file_download', {
      file_name: RESUME_FILE_NAME,
      file_extension: 'pdf',
      link_url: RESUME_URL,
      link_text: 'Download Resume',
    });

    downloadResume();
  };

  return (
    <section id="resume" className="resume-section" ref={sectionRef}>
      <Container>
        {/* Kept for the document outline and screen readers; visually the
            Experience header below opens the section. */}
        <h2 className="visually-hidden">Resume</h2>

        <ExperienceTimeline />

        <FeaturedProjects />

        <div className="resume-block" id="education">
          <m.div className="projects-showcase__header" {...REVEAL}>
            <div>
              <span className="projects-showcase__eyebrow">Education</span>
              <h3 className="projects-showcase__title">
                Where I{' '}
                <span className="projects-showcase__accent">Studied</span>
              </h3>
            </div>
          </m.div>
          <m.article className="education-card" {...REVEAL}>
            <OrgLogo name={education.school} />
            <div className="education-card__main">
              <h4 className="education-card__school">
                {education.url ? (
                  <a
                    href={education.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {education.school}
                  </a>
                ) : (
                  education.school
                )}
              </h4>
              <p className="education-card__degree">{education.degree}</p>
            </div>
            <ul className="education-card__meta">
              <li>
                <FontAwesomeIcon icon={faCalendar} /> {education.date}
              </li>
              <li>
                <FontAwesomeIcon icon={faLocationDot} /> {education.location}
              </li>
              {education.cgpa && (
                <li>
                  <FontAwesomeIcon icon={faChartLine} /> CGPA: {education.cgpa}
                </li>
              )}
            </ul>
          </m.article>
        </div>

        {interviewedCompanies.length > 0 && (
          <Row className="mb-5">
            <Col lg={12} data-aos="fade-up">
              <div className="resume-card">
                <h3>
                  <FontAwesomeIcon icon={faBuilding} /> Interview Experience
                </h3>
                <p className="interview-divider">
                  Recruited and interviewed by
                </p>
                <InterviewMarquee companies={interviewedCompanies} />
              </div>
            </Col>
          </Row>
        )}

        {achievements.length > 0 && (
          <Row className="mb-5">
            <Col lg={12} data-aos="fade-up" data-aos-delay="150">
              <div className="resume-card">
                <h3>
                  <FontAwesomeIcon icon={faAward} /> Achievements
                </h3>
                <div className="achievements-grid">
                  {achievements.map((achievement, index) => (
                    <m.div
                      key={index}
                      className="achievement-item"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      whileHover={CARD_HOVER}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 22,
                        delay: index * 0.1,
                      }}
                    >
                      <div className="achievement-header">
                        <div className="achievement-title">
                          <OrgLogo
                            name={achievement.org || achievement.title}
                          />
                          <h4>{achievement.title}</h4>
                        </div>
                        {(achievement.url || achievement.secondaryUrl) && (
                          <div className="achievement-links">
                            {achievement.url && (
                              <a
                                href={achievement.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`View ${achievement.title} on GitHub`}
                                onClick={() =>
                                  trackEvent('select_content', {
                                    content_type: 'achievement_link',
                                    content_id: `${slugify(achievement.title)}_primary`,
                                  })
                                }
                              >
                                <FontAwesomeIcon icon={faGithub} />
                              </a>
                            )}
                            {achievement.secondaryUrl && (
                              <a
                                href={achievement.secondaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${achievement.secondaryLabel} for ${achievement.title}`}
                                onClick={() =>
                                  trackEvent('select_content', {
                                    content_type: 'achievement_link',
                                    content_id: `${slugify(achievement.title)}_secondary`,
                                  })
                                }
                              >
                                <FontAwesomeIcon
                                  icon={
                                    achievement.secondaryIcon ||
                                    faArrowUpRightFromSquare
                                  }
                                />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      <ul className="achievement-bullets">
                        {achievement.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex}>{bullet}</li>
                        ))}
                      </ul>
                    </m.div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        )}

        <div className="resume-block" id="skills">
          <m.div className="projects-showcase__header" {...REVEAL}>
            <div>
              <span className="projects-showcase__eyebrow">Skills</span>
              <h3 className="projects-showcase__title">
                Tech <span className="projects-showcase__accent">Stack</span>
              </h3>
            </div>
          </m.div>
          <div className="skills-board">
            {Object.entries(skills).map(([category, items]) => (
              <m.div key={category} className="skills-group" {...REVEAL}>
                <h4 className="skills-group__title">
                  {category}
                  <span className="skills-group__count">{items.length}</span>
                </h4>
                <ul className="skills-group__list">
                  {items.map((skill) => (
                    <li key={skill.name} className="skill-item">
                      <FontAwesomeIcon icon={skill.icon} />
                      {skill.name}
                    </li>
                  ))}
                </ul>
              </m.div>
            ))}
          </div>
        </div>

        <Row className="justify-content-center mt-5">
          <Col
            lg={12}
            className="text-center"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="resume-actions">
              <m.button
                type="button"
                onClick={handleResumeView}
                className="view-btn"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faEye} /> View Resume
              </m.button>
              <m.button
                type="button"
                onClick={handleResumeDownload}
                className="download-btn"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faDownload} /> Download Resume
              </m.button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Resume;
