import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { scienceGothic, golos, martian } from './fonts';
import NotFound from './(site)/[locale]/not-found';
import styles from './(site)/[locale]/not-found.module.css';
import './(site)/globals.css';

export const metadata: Metadata = { title: '404 · ZeroFour', robots: { index: false, follow: true } };

export default async function GlobalNotFound() {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${scienceGothic.variable} ${golos.variable} ${martian.variable}`}>
      <body><main className={styles.standalone}><NotFound /></main></body>
    </html>
  );
}
