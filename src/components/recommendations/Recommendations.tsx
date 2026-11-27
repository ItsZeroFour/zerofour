import { getTranslations } from 'next-intl/server';
import type { SiteContent } from '@/lib/content-types';
import styles from './Recommendations.module.css';

export async function Recommendations({ site }: { site: SiteContent }) {
  const items = site.recommendations?.filter(item => item.author.trim() && item.quote.trim());
  const hasAlexander = items?.some(item => /александр|alexander|alexandr/i.test(item.author));
  const t = await getTranslations('recommendations');

  return (
    <section id="recommendations" className={styles.section} aria-labelledby="recommendations-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>{t('label')}</p>
          <h2 id="recommendations-title">{t('title')}</h2>
        </header>
        <ol className={styles.list}>
          {(items ?? []).map((item, index) => (
            <li key={item.id ?? index}>
              <figure className={styles.recommendation}>
                <blockquote><p>{item.quote}</p></blockquote>
                <figcaption>
                  <strong>{item.author}</strong>
                  {item.role?.trim() ? <span>{item.role}</span> : null}
                  {item.source?.trim() ? <cite>{t('source')}: {item.source}</cite> : null}
                </figcaption>
              </figure>
            </li>
          ))}
          {!hasAlexander ? <li className={styles.reference}>
            <p>{t('reference')}</p>
            <div><strong>{t('alexander')}</strong><span>{t('alexanderRole')}</span><span>{t('contactOnRequest')}</span></div>
          </li> : null}
        </ol>
      </div>
    </section>
  );
}
