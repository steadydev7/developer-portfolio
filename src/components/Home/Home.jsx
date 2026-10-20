import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-scroll';
import { TypeAnimation } from 'react-type-animation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './Home.scss';
import PointSphere from './PointSphere';
import { trackEvent } from '../../utils/analytics';
import { useVirtualPageView } from '../../hooks/useVirtualPageView';
import { PROFILE } from '../../data/profile';
import { CONTACT } from '../../data/contact';
import { skills } from '../../data/resumeData';

const STACK = (Object.values(skills)[0] ?? [])
  .slice(0, 5)
  .map((skill) => skill.name);
const BUILDS_SEQUENCE = PROFILE.builds.flatMap((item) => [item, 2200]);
const ROLE_HIGHLIGHT =
  PROFILE.roleHighlight && PROFILE.role.startsWith(PROFILE.roleHighlight)
    ? PROFILE.roleHighlight
    : PROFILE.role.split(' ')[0];
const ROLE_REST = PROFILE.role.slice(ROLE_HIGHLIGHT.length).trim();

const formatClock = (date) =>
  date.toLocaleTimeString('en-US', {
    timeZone: CONTACT.timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });

// Its own component so the per-second tick re-renders just the clock, not
// the whole hero (and not the typing animation).
const LiveClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <time>{formatClock(now)}</time>;
};

const scrollLinkProps = {
  spy: false,
  smooth: true,
  offset: -70,
  duration: 500,
};

const Home = () => {
  const sectionRef = useVirtualPageView('Home', '/#home');

  return (
    <section id="home" className="home-section" ref={sectionRef}>
      <Container>
        <Row className="align-items-center hero-row">
          <Col lg={6} className="hero-copy" data-aos="fade-right">
            <div className="hero-status">
              <span className="hero-status__pill">
                <span className="hero-status__dot" aria-hidden="true" />
                {PROFILE.status}
              </span>
              <span className="hero-status__meta">
                {CONTACT.location} · <LiveClock />
              </span>
            </div>

            <h1 className="hero-name">
              <span>{PROFILE.firstName}</span>
              <span className="hero-name__accent">{PROFILE.lastName}</span>
            </h1>

            <p className="hero-role">
              <span className="hero-role__key">{ROLE_HIGHLIGHT}</span>{' '}
              {ROLE_REST}
            </p>

            <p className="hero-builds">
              <span className="hero-builds__label">Builds //</span>{' '}
              <TypeAnimation
                sequence={BUILDS_SEQUENCE}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="hero-builds__value"
              />
            </p>

            <p className="hero-intro">{PROFILE.intro}</p>

            <div className="hero-actions">
              <Link
                to="contact"
                href="#contact"
                {...scrollLinkProps}
                className="hero-btn hero-btn--primary"
                onClick={() =>
                  trackEvent('select_content', {
                    content_type: 'hero_cta',
                    content_id: 'get_in_touch',
                  })
                }
              >
                Get in touch <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <Link
                to="projects"
                href="#projects"
                {...scrollLinkProps}
                className="hero-btn hero-btn--ghost"
                onClick={() =>
                  trackEvent('select_content', {
                    content_type: 'hero_cta',
                    content_id: 'view_work',
                  })
                }
              >
                View work
              </Link>
              <div className="hero-socials">
                {CONTACT.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-icon"
                    aria-label={social.label}
                    title={social.label}
                    onClick={() =>
                      trackEvent('select_content', {
                        content_type: 'social_profile',
                        content_id: social.contentId,
                      })
                    }
                  >
                    <FontAwesomeIcon icon={social.icon} />
                  </a>
                ))}
              </div>
            </div>

            <dl className="hero-meta">
              <div>
                <dt>Work mode</dt>
                <dd>{CONTACT.workMode}</dd>
              </div>
              <div>
                <dt>Replies</dt>
                <dd>{CONTACT.responseTime}</dd>
              </div>
              {STACK.length > 0 && (
                <div>
                  <dt>Stack</dt>
                  <dd>{STACK.join(' · ')}</dd>
                </div>
              )}
            </dl>
          </Col>

          <Col lg={6} className="hero-visual" data-aos="fade-left">
            <PointSphere />
          </Col>
        </Row>
      </Container>

      <Link
        to="stats"
        href="#stats"
        {...scrollLinkProps}
        className="scroll-indicator"
        aria-label="Scroll to Stats section"
      >
        <FontAwesomeIcon icon={faChevronDown} className="scroll-arrow" />
      </Link>
    </section>
  );
};

export default Home;
