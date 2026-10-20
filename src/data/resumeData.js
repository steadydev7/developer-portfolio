import {
  faGithub,
  faPython,
  faJs,
  faReact,
  faAws,
  faDocker,
  faGitAlt,
  faHtml5,
  faCss3,
  faNodeJs,
  faGoogle,
  faVuejs,
  faWordpress,
  faCloudflare,
} from '@fortawesome/free-brands-svg-icons';
import {
  faDatabase,
  faLeaf,
  faLayerGroup,
  faMagnifyingGlass,
  faVectorSquare,
  faWandMagicSparkles,
  faBrain,
  faBookOpen,
  faPlug,
  faMicrochip,
  faSliders,
  faFaceSmile,
  faKeyboard,
  faLink,
  faRobot,
  faNetworkWired,
  faServer,
  faGears,
  faInfinity,
  faN,
  faSpider,
  faBolt,
  faArrowsRotate,
  faMobileScreenButton,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';

// `cgpa` is optional; the Education card hides that line without it.
export const education = {
  school: 'Nanyang Technological University',
  degree: "Bachelor's Degree in Computer Science",
  date: 'Jul 2013 – Jun 2017',
  location: 'Singapore',
  url: 'https://www.ntu.edu.sg/',
};

// Newest first; the Experience timeline renders them in this order. `url`,
// `type`, `summary`, `bullets` and `stack` are optional (no `url` shows the
// company as plain text). `stack` only names what that job's own text names.
export const experiences = [
  {
    company: 'Contextual AI',
    role: 'Senior AI Backend Engineer',
    date: 'Feb 2024 – Aug 2026',
    location: 'Mountain View, CA',
    url: 'https://contextual.ai',
    stack: ['Python', 'LLMs', 'NLP', 'REST', 'GraphQL', 'React', 'CI/CD'],
    summary:
      'Architected and delivered enterprise conversational AI platforms, integrating LLM/NLP pipelines with scalable Python backends and cloud-native infrastructure to power intelligent automation across global enterprise deployments.',
    bullets: [
      'Built end-to-end conversational AI agents handling complex business workflows across 4 product lines, engineering LLM/NLP pipelines tailored to high-stakes enterprise use cases.',
      'Developed scalable Python microservices and REST/GraphQL APIs supporting 50K+ concurrent requests, achieving a 40% reduction in average response latency.',
      'Led full-stack feature delivery by coupling React frontend components with AI-driven backend logic, cutting time-to-feature by 30%.',
      'Collaborated with product, UX, and platform leadership to translate business requirements into production-ready AI solutions, consistently shipping on schedule.',
      'Optimized high-volume deployments to maintain 99.9% uptime across 6+ enterprise channels, improving system resilience under sustained load.',
      'Owned the full SDLC — architecture, implementation, CI/CD, QA, and post-release iteration — for mission-critical conversational AI systems.',
    ],
  },
  {
    company: 'Simon AI',
    role: 'AI Software Engineer',
    date: 'Dec 2019 – Dec 2023',
    location: 'New York, NY',
    url: 'https://www.simon.ai',
    stack: ['Python', 'FastAPI', 'RAG', 'LLMs', 'React', 'Observability'],
    summary:
      'Delivered production-ready AI systems end-to-end, applying RAG architectures, Python microservices, and React-based interfaces to accelerate enterprise automation and knowledge discovery workflows.',
    bullets: [
      'Built full-stack AI applications from the ground up across 3 core products, pairing LLM-powered Python backends with React frontends for enterprise user workflows.',
      'Designed and implemented RAG pipelines connected to internal knowledge bases, improving answer accuracy and reducing hallucinations across 10K+ daily queries.',
      'Developed high-throughput FastAPI microservices achieving sub-100ms response times with 99.95% availability under sustained enterprise load.',
      'Integrated third-party platforms and internal tooling to embed real-time automation into existing enterprise ecosystems, eliminating 20+ hours of weekly manual work.',
      'Established logging, tracing, and alerting pipelines that reduced mean time to resolution (MTTR) by 35% across cloud-based production environments.',
    ],
  },
  {
    company: 'SimuHealth',
    role: 'Full-Stack AI Engineer',
    date: 'Sep 2017 – Nov 2019',
    location: 'Vancouver, BC',
    stack: ['Python', 'React', 'TypeScript', 'Snowflake', 'LLMs', 'CI/CD'],
    summary:
      'Spearheaded development of AI-powered data activation platforms, fusing first-party data pipelines, LLM intelligence, and modern web interfaces to unlock personalized marketing at enterprise scale.',
    bullets: [
      'Built full-stack features spanning data pipelines, backend services, and React/TypeScript interfaces to power customer segmentation and audience activation across enterprise marketing workflows.',
      'Authored Python APIs on top of Snowflake and cloud data warehouses, enabling AI-driven audience generation and real-time data access for 8 marketing teams.',
      'Integrated LLM-based intelligence into core platform workflows, enabling hyper-personalization across 50+ customer segments and expanding automation coverage platform-wide.',
      'Hardened CI/CD pipelines and deployment configurations, reducing release cycle time by 25% and cutting production incidents by 40%.',
    ],
  },
];

// Companies that interviewed you or had a recruiter reach out — not
// employers, so this stays name-only rather than claiming a role/date like
// `experiences` does. Logos come from src/assets/images/logos/<slug>.*
// (e.g. 'Google' -> google.png). The Interview Experience section is hidden
// while this is empty.
export const interviewedCompanies = [];

// `featured` projects render first, and the first card is the wide one in
// the Featured Work grid. `category` is the label on the card's cover.
// `liveUrl` is the site the card opens; `url` (a GitHub repo) is optional
// and adds the GitHub icon. The cover is a screenshot dropped at
// src/assets/images/projects/covers/<slug>.webp (or an explicit `cover`),
// else a floating icon from src/assets/images/projects/<slug>.png (or
// `image`), else the initials — <slug> is the name lower-cased with
// non-alphanumerics as "_", e.g. steer_health.
//
// `tech` is what each live site is verifiably built on, checked 2026-10-20
// against its response headers and its own JS/CSS bundles (plus, for
// ChatWisp, the voice providers its page names) — swap in what you
// actually worked with.
export const projects = [
  {
    name: 'ChatWisp',
    liveUrl: 'https://chatwisp.ai/',
    featured: true,
    category: 'AI Surveys',
    tech: ['Next.js', 'React', 'Tailwind', 'Deepgram', 'ElevenLabs'],
    description:
      'AI-moderated surveys and forms — respondents answer by voice or chat while an AI interviewer asks follow-up questions, and results can be queried in plain English.',
  },
  {
    name: 'Hoory',
    liveUrl: 'https://hoory.com/',
    category: 'Customer Support AI',
    tech: ['Nuxt', 'Vue', 'Tailwind', 'AWS'],
    description:
      'All-in-one AI customer support platform: AI assistant, chatbot builder, live chat, call center and an omnichannel inbox, with multilingual text and audio support.',
  },
  {
    name: 'ZyraTalk',
    liveUrl: 'https://www.zyratalk.com/',
    category: 'Voice AI',
    tech: ['WordPress', 'Elementor', 'Cloudflare'],
    description:
      'AI answering service for home-service businesses — answers calls and chats 24/7, books jobs into tools like ServiceTitan and Housecall Pro, and follows up by call and text.',
  },
  {
    name: 'Steer Health',
    liveUrl: 'https://steerhealth.io/',
    category: 'Healthcare AI',
    tech: ['React', 'Vite', 'Tailwind'],
    description:
      'AI patient access platform for health systems — a voice front desk that verifies insurance and books visits into Epic, Cerner or athenahealth, plus referral and revenue-cycle automation.',
  },
  {
    name: 'Clerie',
    liveUrl: 'https://www.clerie.ai/',
    category: 'Health Tech',
    tech: ['Next.js', 'React', 'Tailwind', 'AWS'],
    description:
      'AI-powered EHR for therapy practices — drafts session notes and treatment plans, checks billing codes and drafts denial appeals, with scheduling, telehealth and credentialing built in.',
  },
];

// Each entry: `title`, `bullets` (strings), and optionally `org` (picks the
// logo from src/assets/images/logos/<slug>.*), `url` (GitHub link) and
// `secondaryUrl` + `secondaryLabel` (+ `secondaryIcon`) for a second link.
// The Achievements section is hidden while this is empty.
export const achievements = [];

// From the resume's Skills section, in its reading order. The first
// category also fills the hero's "Stack" line (first five names), and every
// name here doubles as a tech-stack icon on the project cards (`techIcons`).
// Brands without a Font Awesome icon get the closest symbol (a leaf for
// MongoDB, a smile for Hugging Face).
export const skills = {
  'Languages & Runtimes': [
    { name: 'Python', icon: faPython },
    { name: 'JavaScript', icon: faJs },
    { name: 'TypeScript', icon: faJs },
    { name: 'Node.js', icon: faNodeJs },
  ],
  'AI / ML': [
    { name: 'Generative AI', icon: faWandMagicSparkles },
    { name: 'LLMs', icon: faBrain },
    { name: 'RAG Architecture', icon: faBookOpen },
    { name: 'OpenAI API', icon: faPlug },
    { name: 'Transformer Models', icon: faMicrochip },
    { name: 'Fine-Tuning', icon: faSliders },
    { name: 'Google BERT', icon: faGoogle },
    { name: 'Hugging Face', icon: faFaceSmile },
    { name: 'Prompt Engineering', icon: faKeyboard },
    { name: 'LangChain', icon: faLink },
    { name: 'Agentic Workflows', icon: faRobot },
  ],
  Frontend: [
    { name: 'React', icon: faReact },
    { name: 'Next.js', icon: faN },
    { name: 'HTML/CSS', icon: faHtml5 },
  ],
  'Backend & APIs': [
    { name: 'FastAPI', icon: faBolt },
    { name: 'REST APIs', icon: faServer },
    { name: 'WebSockets', icon: faNetworkWired },
  ],
  'Data & Storage': [
    { name: 'PostgreSQL', icon: faDatabase },
    { name: 'MongoDB', icon: faLeaf },
    { name: 'Redis', icon: faLayerGroup },
    { name: 'FAISS', icon: faMagnifyingGlass },
    { name: 'Vector Databases', icon: faVectorSquare },
  ],
  'Cloud & DevOps': [
    { name: 'AWS', icon: faAws },
    { name: 'Docker', icon: faDocker },
    { name: 'MLOps', icon: faGears },
    { name: 'CI/CD', icon: faInfinity },
    { name: 'Git', icon: faGitAlt },
  ],
};

// Reuses the icons already defined above for Skills, plus a few fallbacks
// for project tech that doesn't appear in that list, so the tech-stack tags
// in Projects don't have to duplicate icon choices already made once.
export const techIcons = {
  ...Object.fromEntries(
    Object.values(skills)
      .flat()
      .map((skill) => [skill.name, skill.icon]),
  ),
  Tailwind: faCss3,
  'GitHub Actions': faGithub,
  Automation: faGears,
  'Web Scraping': faSpider,
  Vite: faBolt,
  Astro: faRocket,
  'TanStack Query': faArrowsRotate,
  Zustand: faLayerGroup,
  'Django REST Framework': faServer,
  Channels: faNetworkWired,
  PWA: faMobileScreenButton,
  'React Router': faReact,
  Vue: faVuejs,
  WordPress: faWordpress,
  Cloudflare: faCloudflare,
};
