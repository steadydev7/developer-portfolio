import { Container, Row, Col } from 'react-bootstrap';
import { m } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faBrain,
  faClockRotateLeft,
  faLaptopHouse,
} from '@fortawesome/free-solid-svg-icons';
import './About.scss';
import { useVirtualPageView } from '../../hooks/useVirtualPageView';
import { experiences } from '../../data/resumeData';
import { CONTACT } from '../../data/contact';
import { PROFILE } from '../../data/profile';

const [LATEST_JOB] = experiences;

// Scannable facts beside the bio. Contact details live in the Contact
// section, so they aren't repeated here.
const FACTS = [
  { icon: faClockRotateLeft, label: 'Experience', value: '7+ years' },
  {
    icon: faBrain,
    label: 'Focus',
    value: 'Gen AI · LLMs · RAG · Agentic workflows',
  },
  LATEST_JOB && {
    icon: faBriefcase,
    label: 'Most recently',
    value: `${LATEST_JOB.role} @ ${LATEST_JOB.company}`,
  },
  {
    icon: faLaptopHouse,
    label: 'Work mode',
    value: `${CONTACT.workMode} · ${PROFILE.status}`,
  },
].filter(Boolean);

// Framer's in-view reveal rather than data-aos, which only picks up nodes
// present on first load (see utils/scrollReveal.js).
const REVEAL = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { type: 'spring', stiffness: 260, damping: 26 },
};

const About = () => {
  const sectionRef = useVirtualPageView('About', '/#about');

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <Container>
        <h2 className="section-title text-center mb-5">About Me</h2>
        <Row className="justify-content-center align-items-center g-4 g-lg-5">
          <Col lg={7}>
            <m.div className="about-bio" {...REVEAL}>
              <p>
                Software engineer and AI developer with 7+ years of experience
                architecting and deploying intelligent, data-driven systems. I
                use Python for backend and ML pipelines and
                JavaScript/TypeScript for full-stack AI integration.
              </p>
              <p>
                My focus is Generative AI and LLMs — transformer models, Google
                BERT and the Hugging Face ecosystem for fine-tuning and
                deployment — plus LangChain for multi-step agentic workflows
                that connect LLMs with APIs and proprietary data. I build AI
                that is production-ready, scalable and grounded in practical
                utility.
              </p>
            </m.div>
          </Col>
          <Col lg={5}>
            <m.div className="about-facts" {...REVEAL}>
              <p className="about-facts__title">At a glance</p>
              <dl className="about-facts__list">
                {FACTS.map((fact) => (
                  <div key={fact.label} className="about-fact">
                    <FontAwesomeIcon
                      icon={fact.icon}
                      className="about-fact__icon"
                      fixedWidth
                    />
                    <div>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </m.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default About;
