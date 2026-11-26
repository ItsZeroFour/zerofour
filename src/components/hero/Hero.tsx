import { getTranslations } from 'next-intl/server';
import type { SiteContent } from '@/lib/content';
import { Mast } from './Mast';
import { MarkSculpture } from './MarkSculpture';
import styles from './Hero.module.css';

export async function Hero({ site }: { site: SiteContent }) {
  const t = await getTranslations('hero');
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.byline}>
        <span>{site.name}</span><span>{site.role}</span>
        <span className={styles.location}>{site.city}</span>
      </div>
      <Mast className={styles.mast} />
      <div className={styles.body}>
        <div className={styles.intro}>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.name}>{site.name}</span>
            <span className={styles.role}>{site.role}</span>
          </h1>
          <p className={styles.lead}>{site.lead}</p>
          <a href="#work" className={styles.cta}>
            <span>{site.cta}</span><span className={styles.arrow} aria-hidden="true">↘</span>
          </a>
        </div>
        <MarkSculpture />
      </div>
      <div className={styles.foot}>
        {site.clients ? <p><span className={styles.clientsLabel}>{t('clientsLabel')} </span>{site.clients}</p> : <span>{site.edition}</span>}
        <a href="#work"><span>{t('scrollHint')}</span><span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
