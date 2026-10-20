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
  faGraduationCap,
  faCalendar,
  faLocationDot,
  faBuilding,
  faDownload,
  faEye,
  faArrowUpRightFromSquare,
  faAward,
  faChartLine,
  faCode,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import ExperienceTimeline from './ExperienceTimeline';
import FeaturedProjects from './FeaturedProjects';
import OrgLogo from './OrgLogo';
import InterviewMarquee from './InterviewMarquee';
import './Resume.scss';

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
        <h2 className="section-title text-center mb-5" data-aos="fade-up">
          Resume
        </h2>

        <ExperienceTimeline />

        <FeaturedProjects />

        <Row className="mb-5">
          <Col lg={12} data-aos="fade-up">
            <div className="resume-card">
              <h3>
                <FontAwesomeIcon icon={faGraduationCap} /> Education
              </h3>
              <div className="education-item">
                <div className="entity-header">
                  <OrgLogo name={education.school} />
                  <h4>
                    <a
                      href={education.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {education.school}
                    </a>
                  </h4>
                </div>
                <p className="degree">{education.degree}</p>
                <div className="details">
                  <p>
                    <FontAwesomeIcon icon={faCalendar} /> {education.date}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faLocationDot} />{' '}
                    {education.location}
                  </p>
                  {education.cgpa && (
                    <p>
                      <FontAwesomeIcon icon={faChartLine} /> CGPA:{' '}
                      {education.cgpa}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>

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

        <Row>
          <Col lg={12} data-aos="fade-up" data-aos-delay="200">
            <div className="resume-card">
              <h3>
                <FontAwesomeIcon icon={faCode} /> Skills
              </h3>
              {Object.entries(skills).map(([category, items]) => (
                <div key={category} className="skills-category">
                  <h4>{category}</h4>
                  <div className="skills-grid">
                    {items.map((skill, index) => (
                      <span
                        key={index}
                        className="skill-item"
                        data-aos="fade-up"
                        data-aos-delay={index * 50}
                      >
                        <FontAwesomeIcon icon={skill.icon} />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

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
