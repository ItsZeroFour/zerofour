import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { asImageMedia, asMedia, type SiteContent } from '@/lib/content';
import portrait from '../../../public/images/portrait-tie.png';
import styles from './Profile.module.css';

export async function Profile({ site }: { site: SiteContent }) {
  const t = await getTranslations('profile');
  const locale = await getLocale();
  const nav = await getTranslations('palette');
  const p = site.profile;
  const resume = asMedia(site.resume);
  const media = asImageMedia(site.portrait);
  return (
    <>
      <section id="about" className={styles.about} aria-labelledby="about-title">
        <p className={styles.kicker}>{t('index')} / {t('label')}</p>
        <h2 id="about-title" className={styles.title}>{p?.title || t('title')}</h2>
        <figure className={styles.portrait}>
          <Image src={media?.url || portrait} width={media?.width ?? portrait.width} height={media?.height ?? portrait.height} alt={media?.alt || site.name} sizes="(min-width: 80rem) 35vw, (min-width: 48rem) 40vw, 90vw" className={styles.photo} />
          <figcaption>{site.name} / {site.city}</figcaption>
        </figure>
        <div className={styles.story}>
          <p className={styles.intro}>{p?.intro || t('intro')}</p>
          <p>{p?.body || t('body')}</p>
          <div className={styles.note}><h3>{t('focusLabel')}</h3><p>{p?.focus || t('focusText')}</p></div>
        </div>
      </section>
      <section id="experience" className={styles.experience} aria-labelledby={p?.experience?.length ? 'experience-title' : 'team-title'}>
        {p?.experience?.length ? <><div className={styles.experienceHead}>
          <p className={styles.kicker}>{t('experienceIndex')} / {t('experienceLabel')}</p>
          <h2 id="experience-title">{t('experienceLabel')}</h2>
          <p>{t('experienceIntro')}</p>
        </div>
        <ol className={styles.roles}>
          {p.experience.map((row, i) => <li key={row.id ?? i}><span>{row.period}</span><div><h3>{row.title}</h3>{row.text ? <p>{row.text}</p> : null}</div></li>)}
        </ol>
        </> : null}
        <div className={styles.team}>
          <h2 id="team-title">{t('teamLabel')}</h2><p>{p?.team || t('teamText')}</p>
          {resume?.mimeType === 'application/pdf' ? <a href={`/${locale}/resume`} download className={styles.resume}>{t('resume')} <span aria-hidden="true">↓</span></a> : <a href="#contacts" className={styles.resume}>{nav('contacts')} <span aria-hidden="true">↗</span></a>}
        </div>
      </section>
    </>
  );
}
