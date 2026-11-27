import { getTranslations } from 'next-intl/server';
import type { Project } from '@/lib/content';
import { WorkGallery } from './WorkGallery';
import styles from './Work.module.css';

export async function Work({ projects }: { projects: Project[] }) {
  const t = await getTranslations('work');
  if (!projects.length) return null;

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <header className={styles.head}>
        <p className={styles.kicker}><span>01 / {t('selected')}</span><span>{String(projects.length).padStart(2, '0')}</span></p>
        <h2 id="work-title" className={styles.title}>{t('title')}</h2>
        <p className={styles.intro}>{t('intro', { count: projects.length })}</p>
      </header>
      <WorkGallery projects={projects} />
    </section>
  );
}
