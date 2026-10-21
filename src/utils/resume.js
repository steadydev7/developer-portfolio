// RESUME_URL is the self-hosted PDF, used for both Download (and as the
// file_download event's link_url) and View, which opens it in a new tab with
// the browser's own PDF viewer.
export const RESUME_URL = '/assets/PDFs/Noah_Thomas_Resume.pdf';
export const RESUME_FILE_NAME = 'Noah_Thomas_Resume.pdf';

export const downloadResume = () => {
  const link = document.createElement('a');
  link.href = RESUME_URL;
  link.download = RESUME_FILE_NAME;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const viewResume = () => {
  const link = document.createElement('a');
  link.href = RESUME_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
