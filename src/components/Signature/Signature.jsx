import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'framer-motion';
import './Signature.scss';

// A self-writing signature: the name in a script face, outlined on with a
// stroke sweep the first time it scrolls into view, then inked in.
const Signature = ({ name = 'Noah Thomas', className = '' }) => {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const inView = useInView(wrapRef, { once: true, margin: '-40px' });
  const [textLength, setTextLength] = useState(1800);

  useEffect(() => {
    const el = textRef.current;
    if (!el || typeof el.getComputedTextLength !== 'function') return undefined;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      try {
        const measured = el.getComputedTextLength();
        if (measured > 0) setTextLength(Math.ceil(measured * 1.05));
      } catch {
        // jsdom — keep the fallback length.
      }
    };
    measure();
    // The script face (Great Vibes) may still be loading on first render;
    // measure again once it's in, or the sweep is sized for the fallback.
    document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <div
      ref={wrapRef}
      className={`signature${inView ? ' is-drawn' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      <svg
        className="signature__svg"
        viewBox="0 0 560 170"
        role="img"
        aria-label={`${name} — signature`}
      >
        <text
          ref={textRef}
          className="signature__ink"
          x="16"
          y="112"
          style={{
            strokeDasharray: textLength,
            strokeDashoffset: inView ? 0 : textLength,
          }}
        >
          {name}
        </text>
      </svg>
    </div>
  );
};

Signature.propTypes = {
  name: PropTypes.string,
  className: PropTypes.string,
};

export default Signature;
