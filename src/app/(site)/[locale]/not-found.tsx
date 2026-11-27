import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import styles from './not-found.module.css';

export default function NotFound() {
  const locale = useLocale() === 'en' ? 'en' : 'ru';
  const t = useTranslations('notFound');
  return (
    <section className={styles.page} aria-labelledby="not-found-title">
      <p className={styles.number} aria-hidden="true">404</p>
      <h1 id="not-found-title">{t('title')}</h1>
      <p className={styles.description}>{t('description')}</p>
      <nav className={styles.links} aria-label={t('navigation')}>
        <Link href={`/${locale}`}>{t('home')} <span aria-hidden="true">↗</span></Link>
        <Link href={`/${locale}#work`}>{t('work')} <span aria-hidden="true">↗</span></Link>
        <Link href={`/${locale}#contacts`}>{t('contacts')} <span aria-hidden="true">↗</span></Link>
      </nav>
    </section>
  );
}
