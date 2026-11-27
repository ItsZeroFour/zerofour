import { getLocale, getTranslations } from 'next-intl/server';
import styles from './VerifiedSkills.module.css';

const certificates = [
  { skill: 'JavaScript', level: 'advanced', file: 'javascript', until: '2027-11-25' },
  { skill: 'HTML', level: 'advanced', file: 'html', until: '2027-10-13' },
  { skill: 'CSS', level: 'advanced', file: 'css', until: '2027-10-13' },
  { skill: 'Git', level: 'intermediate', file: 'git', until: '2027-10-13' },
  { skill: 'API', level: 'intermediate', file: 'api', until: '2027-10-13' },
  { skill: 'Linux', level: 'basic', file: 'linux', until: '2027-10-14' },
] as const;

export async function VerifiedSkills() {
  const [t, locale] = await Promise.all([getTranslations('verifiedSkills'), getLocale()]);
  const date = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  return (
    <section id="skills" className={styles.section} aria-labelledby="skills-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>{t('label')} / {String(certificates.length).padStart(2, '0')}</p>
          <h2 id="skills-title">{t('title')}</h2>
          <p className={styles.description}>{t('description')}</p>
          <p className={styles.issuer}>{t('issuer')}</p>
        </header>
        <ol className={styles.list}>
          {certificates.map((certificate, index) => (
            <li key={certificate.file}>
              <a className={styles.document} href={`/certificates/${certificate.file}.pdf`} target="_blank" rel="noopener noreferrer" type="application/pdf" aria-label={t('open', { skill: certificate.skill })} aria-describedby={`skill-${certificate.file}-details`}>
                <span className={styles.index} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.skill}>{certificate.skill}</span>
                <span className={styles.details} id={`skill-${certificate.file}-details`}><span>{t(certificate.level)}</span><span>{t('validUntil')} <time dateTime={certificate.until}>{date.format(new Date(certificate.until))}</time></span></span>
                <span className={styles.format} aria-hidden="true">PDF <span>↗</span></span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
