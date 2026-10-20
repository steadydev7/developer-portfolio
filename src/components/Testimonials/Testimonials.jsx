import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import { m, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuoteLeft,
  faChevronLeft,
  faChevronRight,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import './Testimonials.scss';
import { trackEvent } from '../../utils/analytics';
import { useVirtualPageView } from '../../hooks/useVirtualPageView';
import { getInitials } from '../../utils/initials';
import { testimonials, recommendationsUrl } from '../../data/testimonials';

const TestimonialAvatar = ({ photo, photoWebp, name }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (photo && !imgFailed) {
    return (
      <picture>
        {photoWebp && <source srcSet={photoWebp} type="image/webp" />}
        <img
          src={photo}
          alt={name}
          className="testimonial-avatar-photo"
          width="400"
          height="400"
          onError={() => setImgFailed(true)}
        />
      </picture>
    );
  }

  return <div className="testimonial-avatar">{getInitials(name)}</div>;
};

TestimonialAvatar.propTypes = {
  photo: PropTypes.string,
  photoWebp: PropTypes.string,
  name: PropTypes.string.isRequired,
};

const Testimonials = () => {
  const sectionRef = useVirtualPageView('Testimonials', '/#testimonials');
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = () => {
    setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (testimonials.length < 2) return undefined;
    const interval = setInterval(next, 12000);
    return () => clearInterval(interval);
  }, [next]);

  if (testimonials.length === 0) return null;

  const testimonial = testimonials[current];

  return (
    <section
      id="testimonials"
      className="testimonials-section"
      ref={sectionRef}
    >
      <Container>
        <h2 className="section-title text-center mb-5" data-aos="fade-up">
          Testimonials
        </h2>

        <div className="testimonials-container">
          <FontAwesomeIcon icon={faQuoteLeft} className="quote-icon" />

          <AnimatePresence mode="wait">
            <m.div
              key={current}
              className="testimonial-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <p className="testimonial-quote">{testimonial.quote}</p>
              <div className="testimonial-person">
                <TestimonialAvatar
                  photo={testimonial.photo}
                  photoWebp={testimonial.photoWebp}
                  name={testimonial.name}
                />
                <div className="testimonial-meta">
                  <div className="testimonial-name">{testimonial.name}</div>
                  <div className="testimonial-role">{testimonial.role}</div>
                  <div className="testimonial-relationship">
                    {testimonial.relationship}
                  </div>
                </div>
              </div>
            </m.div>
          </AnimatePresence>

          <div className="testimonial-nav-btns">
            <button
              onClick={prev}
              className="testimonial-nav-btn"
              aria-label="Previous testimonial"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              onClick={next}
              className="testimonial-nav-btn"
              aria-label="Next testimonial"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>

          <div className="testimonial-points">
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrent(index)}
                className={`testimonial-point ${index === current ? 'active' : ''}`}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === current}
              />
            ))}
          </div>
        </div>

        {recommendationsUrl && (
          <div className="testimonials-footer">
            <m.a
              href={recommendationsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="linkedin-cta"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() =>
                trackEvent('cta_click', { cta_id: 'view_recommendations' })
              }
            >
              <FontAwesomeIcon icon={faLinkedin} />
              See all recommendations on LinkedIn
              <FontAwesomeIcon
                icon={faArrowUpRightFromSquare}
                className="external-icon"
              />
            </m.a>
          </div>
        )}
      </Container>
    </section>
  );
};

export default Testimonials;
