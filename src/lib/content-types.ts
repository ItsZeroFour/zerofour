/* Shared CMS shapes; kept separate from server-only database access. */
export type MediaDoc = {
  id: number | string;
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  sizes?: Record<string, { url?: string | null; width?: number | null; height?: number | null }>;
};

export type Fact = { id?: string; value: string; label: string };

export type SiteContent = {
  name: string;
  role: string;
  lead: string;
  cta: string;
  clients?: string | null;
  portrait?: MediaDoc | number | null;
  portraitCaption?: string | null;
  index?: string | null;
  edition?: string | null;
  city?: string | null;
  location?: string | null;
  openToWork?: boolean | null;
  statusText?: string | null;
  facts?: Fact[] | null;
  principles?: { id?: string; title: string; text: string; proof?: string | null }[] | null;
  profile?: {
    title?: string | null;
    intro?: string | null;
    body?: string | null;
    focus?: string | null;
    team?: string | null;
    experience?: { id?: string; period: string; title: string; text?: string | null }[] | null;
  } | null;
  telegram?: string | null;
  email?: string | null;
  github?: string | null;
  linkedin?: string | null;
  hh?: string | null;
  resume?: MediaDoc | number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: MediaDoc | number | null;
};

export type Project = {
  id: number | string;
  slug: string;
  order?: number | null;
  featured?: boolean | null;
  nda?: boolean | null;
  title: string;
  client?: string | null;
  year?: string | null;
  role?: string | null;
  summary: string;
  challenge?: string | null;
  decision?: string | null;
  outcome?: string | null;
  stages?: { id?: string; title: string; text?: string | null }[] | null;
  highlights?: { id?: string; text: string }[] | null;
  metrics?: Fact[] | null;
  stack?: string[] | null;
  cover?: MediaDoc | number | null;
  gallery?: { id?: string; image: MediaDoc | number; caption?: string | null }[] | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
};

export const asMedia = (m: MediaDoc | number | null | undefined): MediaDoc | null =>
  m && typeof m === 'object' && m.url ? m : null;

export const asImageMedia = (value: MediaDoc | number | null | undefined): MediaDoc | null => {
  const media = asMedia(value);
  return media && (media.mimeType?.startsWith('image/') || (!media.mimeType && media.width && media.height)) ? media : null;
};
