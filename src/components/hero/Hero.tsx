import { getTranslations } from 'next-intl/server';
import { asImageMedia, type SiteContent } from '@/lib/content';
import { PortraitStage } from './PortraitStage';
import styles from './Hero.module.css';

export async function Hero({ site }: { site: SiteContent }) {
  const t = await getTranslations('portrait');
  const portrait = asImageMedia(site.portrait);
  const words = site.name.trim().split(/\s+/);
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.topline}><span>{site.role}</span><span>{site.city}</span></div>
      <h1 id="hero-title" className={styles.name}>{words.map((word, i) => <span key={`${word}-${i}`} style={{ '--word': i } as React.CSSProperties}>{word}{i < words.length - 1 ? ' ' : ''}</span>)}</h1>
      <PortraitStage src={portrait?.url || '/images/portrait-front.png'} alternate="/images/portrait-tie.png" name={site.name}>
        <a className={styles.cta} href="#work"><span>{site.cta}</span><span aria-hidden="true">↘</span></a>
      </PortraitStage>
      <div className={styles.intro}>
        <p className={styles.lead}>{site.lead}</p>
      </div>
      <div className={styles.bottom}><span>{t('portfolio')}</span><span>{t('scroll')}</span></div>
    </section>
  );
}
