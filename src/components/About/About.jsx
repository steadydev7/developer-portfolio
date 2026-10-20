import { Container, Row, Col } from 'react-bootstrap';
import './About.scss';
import { useVirtualPageView } from '../../hooks/useVirtualPageView';

// Bio only: email, phone, location and live availability all live in the
// Contact section, so they aren't repeated here.
const About = () => {
  const sectionRef = useVirtualPageView('About', '/#about');

  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <Container>
        <h2 className="section-title text-center mb-5" data-aos="fade-up">
          About Me
        </h2>
        <Row className="justify-content-center">
          <Col lg={9} className="text-center" data-aos="fade-up">
            <p className="about-bio">
              Software engineer and AI developer with 7+ years of experience
              architecting and deploying intelligent, data-driven systems. I use
              Python for backend and ML pipelines and JavaScript/TypeScript for
              full-stack AI integration, with deep expertise in Generative AI
              and LLMs — transformer models, Google BERT, and the Hugging Face
              ecosystem for fine-tuning and deployment — and LangChain for
              multi-step agentic workflows that connect LLMs with APIs and
              proprietary data. I focus on AI that is production-ready,
              scalable, and grounded in practical utility.
            </p>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default About;
