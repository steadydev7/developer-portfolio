import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const GITHUB_USERNAME = 'steadydev7';

// The one place for the contact details the About and Contact sections
// show — change them here and both sections follow. `phone` is listed in
// the About section; leave it empty to hide it. `city` labels the live
// local-time displays, since the time zone's own name is a different city
// (America/New_York). `responseTime` and `workMode` fill two of the Contact
// section's stat tiles (the third is the live local time). The GitHub
// username also drives the live Stats numbers and the contribution heatmap,
// and `sourceRepo` is this portfolio's own repository.
export const CONTACT = {
  email: 'mindiron277@gmail.com',
  phone: '+1 (715) 709-7990',
  location: 'Oakland, Maine, USA',
  city: 'Oakland',
  timeZone: 'America/New_York',
  workingHours: { start: 9, end: 24 },
  responseTime: '< 24h',
  workMode: 'Remote',
  githubUsername: GITHUB_USERNAME,
  sourceRepo: `https://github.com/${GITHUB_USERNAME}/developer-portfolio`,
  topics: [
    'Web Applications',
    'Backend & APIs',
    'Open Source',
    'Freelance & Contract',
  ],
  socials: [
    {
      label: 'GitHub',
      url: `https://github.com/${GITHUB_USERNAME}`,
      icon: faGithub,
      contentId: 'github_profile',
    },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/nasssar/',
      icon: faLinkedin,
      contentId: 'linkedin_profile',
    },
  ],
};

export const socialUrl = (label) =>
  CONTACT.socials.find((social) => social.label === label)?.url;
