import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { scienceGothic, golos, martian } from '@/app/fonts';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { RevealObserver } from '@/components/motion/RevealObserver';
import { asMedia, getSite } from '@/lib/content';
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
  const og = asMedia(site.ogImage);
  return {
    title: site.seoTitle || `${site.name} — ${site.role}`,
    description: site.seoDescription || site.lead,
    alternates: { languages: { ru: '/ru', en: '/en' } },
    openGraph: og ? { images: [{ url: og.sizes?.og?.url || og.url! }] } : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: '#f4f3ee',
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'a11y' });
  const site = await getSite(locale);

  return (
    <html
      lang={locale}
      className={`${scienceGothic.variable} ${golos.variable} ${martian.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          {t('skip')}
        </a>
        <NextIntlClientProvider>
          <SiteHeader site={site} />
          <main id="main">{children}</main>
          <SmoothScroll />
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
