# Noah Thomas — Portfolio

<!-- markdownlint-disable MD033 -->

<p align="center">
  <img src="public/web-app-manifest-192x192.png" alt="NT logo" width="110" height="110" />
</p>

<p align="center">
  Personal site of <strong>Noah Thomas</strong>, Senior AI Software Engineer — Gen AI, LLMs, RAG and full-stack development.
</p>

<p align="center">
  <a href="https://noah-thomas.vercel.app"><strong>noah-thomas.vercel.app</strong></a>
  ·
  <a href="https://github.com/steadydev7/developer-portfolio/actions/workflows/ci.yml"><img src="https://github.com/steadydev7/developer-portfolio/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
</p>

## Contents

- [What's on the site](#whats-on-the-site)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Editing the content](#editing-the-content)
- [Project structure](#project-structure)
- [Quality checks](#quality-checks)
- [Deployment](#deployment)
- [Credits and license](#credits-and-license)

## What's on the site

One page, dark theme by default (the choice is remembered), in this order:

| Section     | What it shows                                                                                                                           |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Home**    | Name and role, a typed "Builds //" line, availability, local time, an animated point sphere, and quick links to contact and projects.   |
| **About**   | A short bio beside an "At a glance" card: experience, focus, most recent role and work mode.                                            |
| **Resume**  | Experience as a scroll-driven timeline, Featured Work, Education and a categorized tech stack, plus View / Download for the PDF resume. |
| **Stats**   | Live GitHub numbers (stars, public repos, contributions in the past year, commits) and a contribution heatmap with the current streak.  |
| **Contact** | Email (with copy), phone, WhatsApp, a message form, live availability and local time.                                                   |
| **Quotes**  | A rotating set of programming quotes.                                                                                                   |

**Featured Work** cards open a details window with a screenshot, key features, the full tech list and a link to the live site. It closes with Esc or a click outside, and ← / → move between projects.

The **Testimonials**, **Achievements** and **Interview Experience** sections are built in but stay hidden — along with their links — until their data has entries (see [Editing the content](#editing-the-content)).

**Extras:**

- **Command palette** — `Ctrl/Cmd + K` to jump to a section, switch theme, download the resume or open a profile.
- **Terminal** — the `>_` button opens a small shell: `help`, `whoami`, `about`, `experience`, `projects`, `skills`, `contact`, `resume`, `open <section>`, `theme <dark|light>`, `neofetch`, `clear`, `exit`.
- **Like counter** — a shared total stored in Firebase Realtime Database (shown only when Firebase is configured).
- **Konami code** — `↑ ↑ ↓ ↓ ← → ← → B A` for a small surprise.
- **PWA** — installable, with a service worker for repeat visits.
- **SEO** — meta and social-preview tags, structured data, and a generated `sitemap.xml`.

Animations respect `prefers-reduced-motion`.

## Tech stack

| Area      | Used                                                                      |
| --------- | ------------------------------------------------------------------------- |
| UI        | React 18, React Bootstrap (modular Bootstrap 5 imports), SCSS             |
| Motion    | Framer Motion, tsParticles (background), a 2D-canvas point sphere         |
| Build     | Vite 5, `vite-plugin-pwa`, image optimization, gzip + Brotli, sitemap     |
| Data      | GitHub REST API, GitHub contributions API, Firebase Realtime Database     |
| Contact   | EmailJS, with a fallback to the visitor's email app                       |
| Analytics | Google Analytics 4 (`react-ga4`)                                          |
| Quality   | Vitest + React Testing Library, ESLint, Prettier, Husky + lint-staged, CI |

## Getting started

Requires **Node.js 20.17+** and **npm 11** (the lockfile is written by npm 11).

```bash
git clone https://github.com/steadydev7/developer-portfolio.git
cd developer-portfolio
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Environment variables

Every variable is optional: the site builds and runs without them, and each missing one only switches its feature off (the build lists what's missing). For local development put them in `.env.development`; on Vercel, add them under **Project → Settings → Environment Variables**. Env files are git-ignored.

| Variable                                                                                                                                                                                                    | Turns on                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` | Saving contact messages and the like counter                                   |
| `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_USER_ID`, `VITE_EMAILJS_TO_EMAIL`                                                                                                      | Sending the contact form by email (without them, the form opens the email app) |
| `VITE_GOOGLE_ANALYTICS_ID`                                                                                                                                                                                  | Google Analytics 4                                                             |
| `VITE_GOOGLE_SITE_VERIFICATION`                                                                                                                                                                             | The Google Search Console verification tag                                     |

## Scripts

| Command           | Does                                                             |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Starts the dev server                                            |
| `npm run build`   | Production build into `dist/`                                    |
| `npm run preview` | Serves the production build locally                              |
| `npm run analyze` | Production build plus a bundle-size report (`stats.html`)        |
| `npm test`        | Runs the test suite once (`npm run test:watch` to keep watching) |
| `npm run lint`    | ESLint                                                           |
| `npm run format`  | Formats everything with Prettier (`format-check` only checks)    |

## Editing the content

All text and links come from a few data files — components read them, so content changes need no component edits.

| To change                                                    | Edit                                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------------------- |
| Name, role, hero text, availability status                   | `src/data/profile.js`                                                 |
| Email, phone, WhatsApp, location, time zone, socials, topics | `src/data/contact.js`                                                 |
| Experience, projects, education, skills                      | `src/data/resumeData.js`                                              |
| Achievements and Interview Experience (hidden while empty)   | `achievements` and `interviewedCompanies` in `src/data/resumeData.js` |
| Testimonials (hidden while empty)                            | `src/data/testimonials.js`                                            |
| The resume PDF                                               | `public/assets/PDFs/` and `RESUME_URL` in `src/utils/resume.js`       |

Images are matched by file name, so adding one needs no code change. The `<slug>` is the name lower-cased with anything non-alphanumeric turned into `_` (e.g. `Steer Health` → `steer_health`):

- **Company / school logos** — `src/assets/images/logos/<slug>.(svg|png|webp|jpg)`. Without one, the initials are shown.
- **Project screenshots** — `src/assets/images/projects/covers/<slug>.(webp|png|jpg)`.

Each project in `resumeData.js` can also set `highlights` (the "Key features" list) and `role`, shown as **My role** in its details window.

## Project structure

```text
public/             static files: icons, og-image.png, 404.html, resume PDF
src/
  components/       one folder per section or widget (JSX + SCSS + tests)
  data/             the content files listed above
  hooks/            useMediaQuery, useMagneticHover, useVirtualPageView
  utils/            analytics, time zones, streaks, tenure, resume download…
  styles/           global styles and the scroll-reveal animation
  assets/           logos, project screenshots, the signature font
  firebase.js       contact messages and the like counter
```

## Quality checks

- **CI** — every push and pull request to `main` runs the format check, ESLint, the test suite and a production build ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)).
- **Git hooks** — Husky runs lint-staged (ESLint + Prettier on staged files) before each commit and the test suite before each push.

## Deployment

Hosted on **Vercel**, which builds and deploys every push to `main`. Set the environment variables above in the Vercel project for the contact form, likes and analytics to work in production.

## Credits and license

Built on [Ahmed Nassar](https://github.com/AhmedNassar7)'s open-source portfolio, released under the MIT license, which this project keeps — see [LICENSE](./LICENSE). The signature uses [Great Vibes](https://fonts.google.com/specimen/Great+Vibes) under the SIL Open Font License.
