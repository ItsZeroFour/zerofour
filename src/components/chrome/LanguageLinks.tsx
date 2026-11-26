'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import styles from './SiteHeader.module.css';

export function LanguageLinks() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('a11y');
  return <nav className={styles.lang} aria-label={t('lang')}>{routing.locales.map((l) => <Link key={l} href={pathname} locale={l} className={styles.langLink} aria-current={l === locale ? 'true' : undefined} hrefLang={l}>{l.toUpperCase()}</Link>)}</nav>;
}
