import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion';
import { scroller } from 'react-scroll';
import Navbar from './components/Navbar/Navbar';
import Home from './components/Home/Home';
import Stats from './components/Stats/Stats';
import About from './components/About/About';
import Resume from './components/Resume/Resume';
import Testimonials from './components/Testimonials/Testimonials';
import Contact from './components/Contact/Contact';
import Quotes from './components/Quotes/Quotes';
import Footer from './components/Footer/Footer';
const ParticlesBackground = lazy(
  () => import('./components/ParticlesBackground/ParticlesBackground'),
);
import CursorGlow from './components/CursorGlow/CursorGlow';
import LikeButton from './components/LikeButton/LikeButton';
import KonamiEasterEgg from './components/KonamiEasterEgg/KonamiEasterEgg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { trackEvent } from './utils/analytics';
import { printConsoleGreeting } from './utils/consoleGreeting';
import CommandPalette from './components/CommandPalette/CommandPalette';
import Terminal from './components/Terminal/Terminal';
import ReactGA from 'react-ga4';
import throttle from 'lodash/throttle';
import { initScrollReveal } from './utils/scrollReveal';
import './styles/scrollReveal.scss';
import './styles/main.scss';

const initAnalytics = () => {
  if (ReactGA.isInitialized || !import.meta.env.VITE_GOOGLE_ANALYTICS_ID)
    return;
  try {
    ReactGA.initialize(import.meta.env.VITE_GOOGLE_ANALYTICS_ID, {
      debug: import.meta.env.MODE !== 'production',
    });
    ReactGA.send('pageview');
  } catch (error) {
    console.error('Google Analytics initialization error:', error);
  }
};

// Dark unless the visitor picked light before (the toggle saves it).
// index.html's <body class="dark-theme"> covers the first paint, before
// React runs.
const readSavedTheme = () => {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

function App() {
  const [theme, setTheme] = useState(readSavedTheme);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAnalytics();
    printConsoleGreeting();

    // Optimize scroll event handling
    const handleScroll = throttle(() => {
      setShowScrollTop(window.pageYOffset > 300);
    }, 200);

    window.addEventListener('scroll', handleScroll);

    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.className = `${theme}-theme`;
  }, [theme]);

  useEffect(() => {
    // Wire up scroll-reveal once the sections have actually mounted (they're
    // gated behind `loading`). initScrollReveal() is idempotent — it only
    // does its one-time [data-aos] scan the first time it's called — and it
    // honours prefers-reduced-motion internally (see utils/scrollReveal.js).
    if (!loading) {
      initScrollReveal();

      // Sections don't mount until the loading screen clears, so the
      // browser's native fragment navigation (e.g. a shared /#resume link)
      // fires before its target exists and silently does nothing. Finish
      // that navigation manually once the real content is in the DOM.
      const hash = window.location.hash.slice(1);
      if (hash) {
        scroller.scrollTo(hash, { offset: -70, duration: 0 });
      }
    }
  }, [loading]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    trackEvent('toggle_theme', { theme_mode: newTheme });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Track scroll-to-top event
    trackEvent('scroll_to_top');
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <Suspense fallback={null}>
        <ParticlesBackground theme={theme} />
      </Suspense>
      <CursorGlow theme={theme} />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <CommandPalette theme={theme} toggleTheme={toggleTheme} />
      <Terminal theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Home />
        <About />
        <Resume />
        <Stats theme={theme} />
        <Testimonials />
        <Contact />
        <Quotes />
      </main>
      <Footer />
      <LikeButton scrolled={showScrollTop} />
      <KonamiEasterEgg />
      <AnimatePresence>
        {showScrollTop && (
          <m.button
            className="scroll-to-top"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            whileHover={{ scale: 1.12, y: -3 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </m.button>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}

export default App;
