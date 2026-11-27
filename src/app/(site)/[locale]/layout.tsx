import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { scienceGothic, golos, martian } from '@/app/fonts';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { RevealObserver } from '@/components/motion/RevealObserver';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { Metrika } from '@/components/analytics/Metrika';
import { getProjects, getSite } from '@/lib/content';
import { metadataFor } from '@/lib/seo';
import '../globals.css';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const site = await getSite(locale);
  return metadataFor(site, locale);
}

export const viewport: Viewport = {
  themeColor: '#f4f3ee',
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'a11y' });
  const [site, projects] = await Promise.all([getSite(locale), getProjects(locale)]);

  return (
    <html
      data-scroll-behavior="smooth"
      lang={locale}
      className={`${scienceGothic.variable} ${golos.variable} ${martian.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          {t('skip')}
        </a>
        <NextIntlClientProvider>
          <SiteHeader site={site} projectCount={projects.length} />
          <main id="main">{children}</main>
          <RevealObserver />
          <SmoothScroll />
          <Metrika />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
