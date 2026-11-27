import { getTranslations } from 'next-intl/server';
import { asMedia, type SiteContent } from '@/lib/content';
import { Mark } from '@/components/brand/Mark';
import { SetType } from '@/components/motion/SetType';
import styles from './Contacts.module.css';

export async function Contacts({ site }: { site: SiteContent }) {
  const t = await getTranslations('contacts');
  const resume = asMedia(site.resume);
  const links = [
    site.telegram ? { label: 'Telegram', value: `@${site.telegram}`, href: `https://t.me/${site.telegram}` } : null,
    site.github ? { label: 'GitHub', value: site.github.replace(/^https?:\/\/(www\.)?/, ''), href: site.github } : null,
    site.linkedin ? { label: 'LinkedIn', value: site.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: site.linkedin } : null,
    site.hh ? { label: 'hh.ru', value: site.hh.replace(/^https?:\/\/(www\.)?/, ''), href: site.hh } : null,
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <section id="contacts" className={styles.section} aria-labelledby="contacts-title">
      <header className={styles.head}>
        <p className={styles.kicker}>
          <span>{t('index')}</span>
          <span aria-hidden="true">—</span>
          <span>{t('label')}</span>
        </p>
        <h2 id="contacts-title" className={styles.title}>
          <SetType text={t('title')} />
        </h2>
        <p className={styles.lead}>{t('lead')}</p>
      </header>

      {site.email ? (
        <a
          className={styles.email}
          href={`mailto:${site.email}`}
          style={{ '--chars': site.email.length } as React.CSSProperties}
        >
          <span className={styles.emailLabel}>{t('email')}</span>
          <span className={styles.emailValue}>{site.email}</span>
          <span className={styles.emailArrow} aria-hidden="true">
            ↗
          </span>
        </a>
      ) : null}

      <ul className={styles.links}>
        {links.map((l) => (
          <li key={l.label}>
            <a className={styles.link} href={l.href} target="_blank" rel="noopener noreferrer">
              <span className={styles.linkLabel}>{l.label}</span>
              <span className={styles.linkValue}>{l.value}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
        {resume ? (
          <li>
            <a className={styles.link} href={resume.url!} download>
              <span className={styles.linkLabel}>{t('resume')}</span>
              <span className={styles.linkValue}>PDF</span>
              <span aria-hidden="true">↓</span>
            </a>
          </li>
        ) : null}
      </ul>

      <footer className={styles.footer}>
        <Mark className={styles.footMark} accent />
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
      </footer>
    </section>
  );
}
