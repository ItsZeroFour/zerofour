import { getLocale, getTranslations } from 'next-intl/server';
import { asImageMedia, asMedia, type SiteContent } from '@/lib/content';
import { PortraitStage } from './PortraitStage';
import styles from './Hero.module.css';

export async function Hero({ site }: { site: SiteContent }) {
  const t = await getTranslations('portrait');
  const locale = await getLocale();
  const resume = asMedia(site.resume);
  const portrait = asImageMedia(site.portrait);
  const words = site.name.trim().split(/\s+/);
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.topline}>
        <span>{site.role}</span><span className={styles.location}>{site.city}</span>
        {resume?.mimeType === 'application/pdf' ? <a className={styles.resumeCompact} href={`/${locale}/resume`} download aria-label={t('resume')}>{t('resumeShort')} <span aria-hidden="true">↓</span></a> : null}
      </div>
      <h1 id="hero-title" className={styles.name}>{words.map((word, i) => <span key={`${word}-${i}`} style={{ '--word': i } as React.CSSProperties}>{word}{i < words.length - 1 ? ' ' : ''}</span>)}</h1>
      <PortraitStage src={portrait?.url || '/images/portrait-front.png'} alternate="/images/portrait-tie.png" name={site.name} />
      <div className={styles.intro}>
        <p className={styles.lead}>{site.lead}</p>
        <div className={styles.actions}>
          <a className={styles.cta} href="#work"><span>{site.cta}</span><span aria-hidden="true">↘</span></a>
          {resume?.mimeType === 'application/pdf' ? <a className={styles.resume} href={`/${locale}/resume`} download>{t('resume')}<span aria-hidden="true">↓</span></a> : null}
        </div>
      </div>
      <div className={styles.bottom}><span>{t('portfolio')}</span><span>{t('scroll')}</span></div>
    </section>
  );
}
