import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { getProjects } from '@/lib/content';
import { absoluteUrl } from '@/lib/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects(routing.defaultLocale);
  return ['', ...projects.map(project => `/work/${encodeURIComponent(project.slug)}`)].flatMap(path =>
    routing.locales.map(locale => ({
      url: absoluteUrl(`/${locale}${path}`),
      alternates: { languages: Object.fromEntries(routing.locales.map(language => [language, absoluteUrl(`/${language}${path}`)])) },
    })),
  );
}
