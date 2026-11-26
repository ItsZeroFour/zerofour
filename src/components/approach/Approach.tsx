import { getTranslations } from 'next-intl/server';
import type { SiteContent } from '@/lib/content';
import { SetType } from '@/components/motion/SetType';
import { ApproachScene } from './ApproachScene';
import styles from './Approach.module.css';

export async function Approach({ site }: { site: SiteContent }) {
  const t = await getTranslations('approach');
  const principles = site.principles ?? [];
  if (!principles.length) return null;

  return (
    <section id="approach" className={styles.section} aria-labelledby="approach-title">
      <header className={styles.head}>
        <p className={styles.kicker}>
          <span>{t('index')}</span>
          <span aria-hidden="true">—</span>
          <span>{t('label')}</span>
        </p>
        <h2 id="approach-title" className={styles.title}>
          <SetType text={t('title')} />
        </h2>
        <p className={styles.intro}>{t('intro')}</p>
      </header>
      <ApproachScene
        principles={principles}
        labels={{ kicker: `${t('index')} — ${t('label')}`, mirror: t('mirror'), print: t('print') }}
      />
    </section>
  );
}
