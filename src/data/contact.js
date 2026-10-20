import { faGithub, faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const GITHUB_USERNAME = 'steadydev7';
const WHATSAPP = '+1 (646) 221-0843';

// wa.me wants the full number as digits only, country code included.
export const whatsappUrl = (number) =>
  `https://wa.me/${number.replace(/\D/g, '')}`;

// The one place for the contact details the site shows — change them here
// and every section follows. `phone` is listed in the Contact section under
// the email; leave it empty to hide it. `whatsapp` is a separate number:
// it adds a WhatsApp row there and a chat icon beside the other socials. `city` labels the live
// local-time displays, since the time zone's own name is a different city
// (America/New_York). `responseTime` and `workMode` fill two of the Contact
// section's stat tiles (the third is the live local time). The GitHub
// username also drives the live Stats numbers and the contribution heatmap,
// and `sourceRepo` is this portfolio's own repository.
export const CONTACT = {
  email: 'mindiron277@gmail.com',
  phone: '+1 (715) 709-7990',
  whatsapp: WHATSAPP,
  location: 'Oakland, Maine, USA',
  city: 'Oakland',
  timeZone: 'America/New_York',
  workingHours: { start: 9, end: 24 },
  responseTime: '< 24h',
  workMode: 'Remote',
  githubUsername: GITHUB_USERNAME,
  sourceRepo: `https://github.com/${GITHUB_USERNAME}/developer-portfolio`,
  topics: [
    'AI & LLM Products',
    'RAG & Agents',
    'Full-Stack Development',
    'Freelance & Contract',
  ],
  // Add LinkedIn here as { label: 'LinkedIn', url, icon: faLinkedin,
  // contentId: 'linkedin_profile' } and every LinkedIn link on the site
  // (hero, contact, footer, command palette, terminal) appears with it.
  socials: [
    {
      label: 'GitHub',
      url: `https://github.com/${GITHUB_USERNAME}`,
      icon: faGithub,
      contentId: 'github_profile',
    },
    {
      label: 'WhatsApp',
      url: whatsappUrl(WHATSAPP),
      icon: faWhatsapp,
      contentId: 'whatsapp_chat',
    },
  ],
};

export const socialUrl = (label) =>
  CONTACT.socials.find((social) => social.label === label)?.url;
