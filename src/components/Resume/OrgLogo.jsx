import { useState } from 'react';
import PropTypes from 'prop-types';
import { slugify } from '../../utils/slugify';
import { getInitials } from '../../utils/initials';

// Auto-discovers any logo dropped in assets/images/logos, keyed by the
// slugified company/school name (e.g. "Nanyang Technological University" ->
// nanyang_technological_university.png).
// Orgs without a matching file just fall back to an initials badge, so this
// never breaks the build while logos are being sourced.
//
// Standard for new logo files:
// - Name the file `${slugify(companyName)}.<ext>` (see utils/slugify) so it's
//   picked up automatically — no code changes needed elsewhere.
// - Prefer SVG (the official wordmark/logo, not a favicon or app icon) with
//   a transparent background. If only a raster version is available, it
//   must also have a transparent background: strip any baked-in white/
//   colored box so only the mark itself is opaque (e.g. make near-white
//   pixels transparent), the same as every other raster logo here.
// - Normalize raster logos to a consistent size: trim to the mark's
//   content bounds (no surrounding padding) and scale the longer side to
//   ~570px so nothing renders blurry or out of proportion at the marquee's
//   display height.
// - Keep the source's real brand colors — don't flatten a colored mark to
//   black/grey.
// - If the mark is near-black or very dark, it'll still render fine in
//   light mode; check it against the dark theme's card background too. The
//   marquee already puts every logo on a small white plate in dark mode
//   (see .interview-icon .org-logo-photo in Resume.scss) for contrast.
const logoModules = import.meta.glob(
  '../../assets/images/logos/*.{png,jpg,jpeg,svg,webp}',
  { eager: true, import: 'default' },
);
const logosByKey = Object.fromEntries(
  Object.entries(logoModules).map(([path, url]) => [
    path
      .split('/')
      .pop()
      .replace(/\.[^.]+$/, ''),
    url,
  ]),
);

const OrgLogo = ({ name }) => {
  const [failed, setFailed] = useState(false);
  const key = slugify(name);
  const src = logosByKey[key];

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="org-logo-photo"
        width="48"
        height="48"
        loading="lazy"
        decoding="async"
        draggable="false"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="org-logo-fallback" aria-hidden="true">
      {getInitials(name)}
    </div>
  );
};

OrgLogo.propTypes = {
  name: PropTypes.string.isRequired,
};

export default OrgLogo;
