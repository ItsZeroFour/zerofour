import { getTranslations } from 'next-intl/server';
import type { SiteContent } from '@/lib/content-types';
import styles from './FAQ.module.css';

export async function FAQ({ site }: { site: SiteContent }) {
  const t = await getTranslations('faq');
  const authored = site.faq?.filter(item => item.question.trim() && item.answer.trim());
  const items = authored?.length ? authored : ['role', 'experience', 'stack', 'materials', 'backend', 'tooling', 'ai', 'quality', 'accessibility', 'english', 'jobSearch'].map(key => ({
    id: key,
    question: t(`${key}.question`),
    answer: t(`${key}.answer`),
  }));

  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>{t('label')}</p>
          <h2 id="faq-title">{t('title')}</h2>
        </header>
        <div className={styles.list}>
          {items.map(item => (
            <details key={item.id ?? item.question} className={styles.item}>
              <summary className={styles.question}><span>{item.question}</span><span className={styles.symbol} aria-hidden="true" /></summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
