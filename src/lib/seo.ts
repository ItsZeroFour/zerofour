import type { Metadata } from 'next';
import type { Locale } from '@/i18n/routing';
import { asImageMedia, type Project, type SiteContent } from './content-types';

export function siteOrigin(): URL {
  for (const value of [process.env.NEXT_PUBLIC_SERVER_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]) {
    if (!value) continue;
    try {
      const url = new URL(value.includes('://') ? value : `https://${value}`);
      if (url.protocol === 'http:' || url.protocol === 'https:') return new URL(url.origin);
    } catch { /* Try the next configured deployment URL. */ }
  }
  return new URL('http://localhost:3000');
}

export const absoluteUrl = (path: string) => new URL(path, siteOrigin()).href;

export function metadataFor(site: SiteContent, locale: Locale, project?: Project): Metadata {
  const path = project ? `/work/${encodeURIComponent(project.slug)}` : '';
  const title = project ? `${project.title} · ZeroFour` : site.seoTitle || `${site.name} — ${site.role}`;
  const description = project?.summary || site.seoDescription || site.lead;
  const image = asImageMedia(project?.cover) || asImageMedia(site.ogImage);
  const url = absoluteUrl(`/${locale}${path}`);
  const images = [{
    url: absoluteUrl(image?.sizes?.og?.url || image?.url || `/images/og-${locale}.jpg`),
    alt: image?.alt || (project ? project.title : `${site.name} — ${site.role}`),
    ...(image ? {} : { width: 1200, height: 630 }),
  }];
  return {
    metadataBase: siteOrigin(),
    title,
    description,
    applicationName: 'ZeroFour',
    authors: [{ name: site.name, url: absoluteUrl(`/${locale}#about`) }],
    alternates: {
      canonical: url,
      languages: { ru: absoluteUrl(`/ru${path}`), en: absoluteUrl(`/en${path}`), 'x-default': absoluteUrl(`/ru${path}`) },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'ZeroFour',
      type: project ? 'article' : 'website',
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      alternateLocale: locale === 'ru' ? 'en_US' : 'ru_RU',
      images,
    },
    twitter: { card: 'summary_large_image', title, description, images },
    robots: { index: true, follow: true },
  };
}

export const safeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c');

export function siteSchema(site: SiteContent, locale: Locale) {
  const portrait = asImageMedia(site.portrait);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': absoluteUrl('/#person'),
        name: site.name,
        jobTitle: site.role,
        description: site.lead,
        url: absoluteUrl(`/${locale}#about`),
        image: absoluteUrl(portrait?.url || '/images/portrait-front.png'),
        sameAs: [site.github, site.linkedin, site.hh].filter(Boolean),
      },
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: 'ZeroFour',
        url: absoluteUrl(`/${locale}`),
        inLanguage: ['ru', 'en'],
        author: { '@id': absoluteUrl('/#person') },
      },
    ],
  };
}

export function projectSchema(site: SiteContent, project: Project, locale: Locale) {
  const cover = asImageMedia(project.cover);
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`/${locale}/work/${encodeURIComponent(project.slug)}#case-study`),
    name: project.title,
    description: project.summary,
    genre: locale === 'ru' ? 'Разбор проекта' : 'Project case study',
    url: absoluteUrl(`/${locale}/work/${encodeURIComponent(project.slug)}`),
    inLanguage: locale,
    author: { '@type': 'Person', '@id': absoluteUrl('/#person'), name: site.name },
    isPartOf: { '@id': absoluteUrl('/#website') },
    ...(cover ? { image: absoluteUrl(cover.url!) } : {}),
  };
}
