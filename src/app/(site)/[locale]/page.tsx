import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getProjects, getSite } from '@/lib/content';
import { Hero } from '@/components/hero/Hero';
import { Work } from '@/components/work/Work';
import { Profile } from '@/components/profile/Profile';
import { Contacts } from '@/components/contacts/Contacts';
import { FAQ } from '@/components/faq/FAQ';
import { Recommendations } from '@/components/recommendations/Recommendations';
import { PageTransition } from '@/components/motion/PageTransition';
import { safeJsonLd, siteSchema } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [site, projects] = await Promise.all([getSite(locale), getProjects(locale)]);

  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(siteSchema(site, locale)) }} />
      <Hero site={site} />
      <Work projects={projects} />
      <Profile site={site} />
      <Recommendations site={site} />
      <FAQ site={site} />
      <Contacts site={site} />
    </PageTransition>
  );
}
