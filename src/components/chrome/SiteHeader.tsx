import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Mark } from '@/components/brand/Mark';
import { CommandPalette } from './CommandPalette';
import { LanguageLinks } from './LanguageLinks';
import type { SiteContent } from '@/lib/content';
import styles from './SiteHeader.module.css';

export async function SiteHeader({ site }: { site: SiteContent }) {
  const t = await getTranslations();

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand} aria-label={t('a11y.home')}>
        <Mark className={styles.mark} />
        <span className={styles.word}>ZeroFour</span>
      </Link>

      {site.openToWork && site.statusText ? (
        <p className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />
          {site.statusText}
        </p>
      ) : null}

      <nav className={styles.sections} aria-label={t('palette.groupNav')}>
        <Link href="/#work">{t('palette.work')}</Link>
        <Link href="/#about">{t('header.about')}</Link>
      </nav>
      <LanguageLinks />

      <CommandPalette label={t('header.menu')} telegram={site.telegram} email={site.email} />
    </header>
  );
}
