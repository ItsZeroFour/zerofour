import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Mark } from '@/components/brand/Mark';
import { CommandPalette } from './CommandPalette';
import { LanguageLinks } from './LanguageLinks';
import type { SiteContent } from '@/lib/content';
import styles from './SiteHeader.module.css';

export async function SiteHeader({ site, projectCount }: { site: SiteContent; projectCount: number }) {
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
        <Link href="/#work">{t('palette.work')} <span className={styles.count}>{String(projectCount).padStart(2, '0')}</span></Link>
        <Link href="/#about">{t('header.about')}</Link>
      </nav>
      {site.telegram ? <a className={styles.telegram} href={`https://t.me/${site.telegram}`} target="_blank" rel="noopener noreferrer" aria-label={`Telegram: @${site.telegram}`}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 10 17-7-4 18-5-7-8-4Z" /><path d="m11 14 9-11" /></svg><span>Telegram</span></a> : null}
      <LanguageLinks />

      <CommandPalette label={t('header.menu')} telegram={site.telegram} email={site.email} projectCount={projectCount} />
    </header>
  );
}
