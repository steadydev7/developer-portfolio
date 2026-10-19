import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-scroll';
import { m, useInView, animate } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {
  faCalendarDays,
  faCodeBranch,
  faCodeCommit,
  faStar,
  faFire,
  faArrowUpRightFromSquare,
  faHandshake,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import GitHubHeatmap from './GitHubHeatmap';
import { calculateStreaks } from '../../utils/streaks';
import { useVirtualPageView } from '../../hooks/useVirtualPageView';
import { trackEvent } from '../../utils/analytics';
import { CONTACT } from '../../data/contact';
import './Stats.scss';

const GITHUB_USERNAME = CONTACT.githubUsername;
const PORTFOLIO_REPO_URL = CONTACT.sourceRepo;
const PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;
const REPOS_TAB_URL = `${PROFILE_URL}?tab=repositories`;
const REPOS_BY_STARS_URL = `${REPOS_TAB_URL}&sort=stargazers`;
const COMMITS_SEARCH_URL = `https://github.com/search?q=author%3A${GITHUB_USERNAME}&type=commits`;
// GitHub's own commit-search API — `total_count` is the exact number of
// commits authored by the user across all public repos.
const COMMITS_API_URL = `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&per_page=1`;
const CONTRIBUTIONS_API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

// Counts as of Oct 2026 — used only if the corresponding live fetch fails
// (network error, or GitHub's low unauthenticated rate limit on the search
// API — ~10 req/min — kicking in). Bump these when they drift noticeably.
const FALLBACK_GITHUB_STARS = 25;
const FALLBACK_PUBLIC_REPOS = 45;
const FALLBACK_TOTAL_COMMITS = 48100;
const FALLBACK_CONTRIBUTIONS = 375;

// Rounds a live count down to the nearest 5 so displayed numbers stay clean
// and consistent without ever overstating the real value.
const roundDownToFive = (n) => Math.floor(n / 5) * 5;

const AnimatedCounter = ({ value, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView || value === null) return undefined;

    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref} className="stat-number">
      {value === null ? '—' : `${display.toLocaleString()}${suffix}`}
    </span>
  );
};

AnimatedCounter.propTypes = {
  value: PropTypes.number,
  suffix: PropTypes.string,
};

const Stats = ({ theme }) => {
  const sectionRef = useVirtualPageView('GitHub Stats', '/#stats');
  const [githubStars, setGithubStars] = useState(null);
  const [publicRepos, setPublicRepos] = useState(null);
  const [totalCommits, setTotalCommits] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(null);
  const [contributions, setContributions] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchGithubStats = async () => {
      try {
        const reposRes = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`,
        );
        if (!reposRes.ok) throw new Error('GitHub API request failed');
        const repos = await reposRes.json();
        const totalStars = repos.reduce(
          (sum, repo) => sum + (repo.stargazers_count || 0),
          0,
        );
        if (!cancelled) {
          setGithubStars(roundDownToFive(totalStars));
          setPublicRepos(roundDownToFive(repos.length));
        }
      } catch (error) {
        console.error('Failed to fetch live GitHub stats:', error);
        if (!cancelled) {
          setGithubStars(FALLBACK_GITHUB_STARS);
          setPublicRepos(FALLBACK_PUBLIC_REPOS);
        }
      }
    };

    const fetchCommits = async () => {
      try {
        const res = await fetch(COMMITS_API_URL);
        if (!res.ok) throw new Error('Commit search request failed');
        const data = await res.json();
        if (typeof data.total_count !== 'number') {
          throw new Error('Commit search response missing total_count');
        }
        if (!cancelled) setTotalCommits(roundDownToFive(data.total_count));
      } catch (error) {
        console.error('Failed to fetch live commit count:', error);
        if (!cancelled) setTotalCommits(FALLBACK_TOTAL_COMMITS);
      }
    };

    // Streaks change daily, unlike stars/repos which move slowly, so there's
    // no sane hardcoded fallback here — leave it as "—" (null) if the fetch
    // fails rather than show a number that goes stale within a day. The
    // past-year contribution total moves slowly enough to fall back on.
    const fetchStreaks = async () => {
      try {
        const res = await fetch(CONTRIBUTIONS_API_URL);
        if (!res.ok) throw new Error('Contributions API request failed');
        const data = await res.json();
        const { current } = calculateStreaks(data.contributions);
        if (!cancelled) {
          setCurrentStreak(current);
          if (typeof data.total?.lastYear === 'number') {
            setContributions(roundDownToFive(data.total.lastYear));
          } else {
            setContributions(FALLBACK_CONTRIBUTIONS);
          }
        }
      } catch (error) {
        console.error('Failed to fetch contribution streaks:', error);
        if (!cancelled) setContributions(FALLBACK_CONTRIBUTIONS);
      }
    };

    fetchGithubStats();
    fetchCommits();
    fetchStreaks();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      icon: faStar,
      value: githubStars,
      suffix: '+',
      label: 'GitHub Stars',
      url: REPOS_BY_STARS_URL,
      ariaLabel: 'View repositories sorted by stars on GitHub',
      contentId: 'github_stars',
    },
    {
      icon: faCodeBranch,
      value: publicRepos,
      suffix: '+',
      label: 'Public Repositories',
      url: REPOS_TAB_URL,
      ariaLabel: 'View all public repositories on GitHub',
      contentId: 'public_repos',
    },
    {
      icon: faCalendarDays,
      value: contributions,
      suffix: '+',
      label: 'Contributions, Past Year',
      url: PROFILE_URL,
      ariaLabel: "View Noah's contribution activity on GitHub",
      contentId: 'contributions',
    },
    {
      icon: faCodeCommit,
      value: totalCommits,
      suffix: '+',
      label: 'Commits',
      url: COMMITS_SEARCH_URL,
      ariaLabel: "View Noah's commits on GitHub",
      contentId: 'commits',
    },
  ];

  const streakLine =
    currentStreak !== null && currentStreak > 0 ? (
      <>
        <FontAwesomeIcon icon={faFire} /> {currentStreak}-day streak
      </>
    ) : null;

  const actionLinks = [
    {
      icon: faGithub,
      label: 'Star Portfolio',
      href: PORTFOLIO_REPO_URL,
      contentId: 'star_portfolio',
    },
    {
      icon: faUserPlus,
      label: 'Follow on GitHub',
      href: PROFILE_URL,
      contentId: 'follow_github',
    },
    {
      icon: faHandshake,
      label: "Let's Collaborate",
      to: 'contact',
      contentId: 'lets_collaborate',
      featured: true,
    },
  ];

  return (
    <section id="stats" className="stats-section" ref={sectionRef}>
      <Container>
        <h2 className="section-title text-center mb-5" data-aos="fade-up">
          Stats
        </h2>
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const CardTag = stat.url ? m.a : m.div;
            const linkProps = stat.url
              ? {
                  href: stat.url,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  'aria-label': stat.ariaLabel || stat.label,
                  onClick: () =>
                    trackEvent('select_content', {
                      content_type: 'stat_card',
                      content_id: stat.contentId,
                    }),
                }
              : {};

            return (
              <CardTag
                key={index}
                className={`stat-card ${stat.url ? 'stat-card-link' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                {...linkProps}
              >
                {stat.url && (
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    className="stat-link-icon"
                  />
                )}
                <FontAwesomeIcon icon={stat.icon} className="stat-icon" />
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="stat-label">{stat.label}</p>
                {stat.subtitle && (
                  <p className="stat-subtitle">{stat.subtitle}</p>
                )}
              </CardTag>
            );
          })}
        </div>
        <m.div
          className="stats-actions"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          aria-label="High value actions"
        >
          {actionLinks.map((action) =>
            action.to ? (
              <Link
                key={action.contentId}
                to={action.to}
                href={`#${action.to}`}
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className={`stats-action ${
                  action.featured ? 'stats-action-featured' : ''
                }`}
                onClick={() => {
                  window.history.replaceState(null, '', `#${action.to}`);
                  trackEvent('select_content', {
                    content_type: 'stats_action',
                    content_id: action.contentId,
                  });
                }}
              >
                <FontAwesomeIcon icon={action.icon} />
                <span>{action.label}</span>
              </Link>
            ) : (
              <a
                key={action.contentId}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`stats-action ${
                  action.featured ? 'stats-action-featured' : ''
                }`}
                onClick={() =>
                  trackEvent('select_content', {
                    content_type: 'stats_action',
                    content_id: action.contentId,
                  })
                }
              >
                <FontAwesomeIcon icon={action.icon} />
                <span>{action.label}</span>
              </a>
            ),
          )}
        </m.div>
        <Row className="justify-content-center">
          <Col xs={12} lg={10}>
            <h3 className="heatmap-title">Contribution Activity</h3>
            {streakLine && <p className="streak-line">{streakLine}</p>}
            <GitHubHeatmap theme={theme} />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

Stats.propTypes = {
  theme: PropTypes.string.isRequired,
};

export default Stats;
