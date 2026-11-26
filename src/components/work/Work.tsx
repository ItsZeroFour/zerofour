import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/lib/content';
import { ProjectLens } from './ProjectLens';
import { InterfaceReveal } from '@/components/motion/InterfaceReveal';
import { projectEngineering } from '@/lib/project-engineering';
import styles from './Work.module.css';

export async function Work({ projects }: { projects: Project[] }) {
  const t = await getTranslations('work');
  const c = await getTranslations('project');
  const locale = (await getLocale()) === 'en' ? 'en' : 'ru';
  if (!projects.length) return null;
  const featured = projects.find((p) => p.featured) ?? projects[0];
  const selected = [featured, ...projects.filter((p) => p.id !== featured.id)].slice(0, 2);

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <header className={styles.head}>
        <p className={styles.kicker}><span>01 / {t('selected')}</span><span>{String(projects.length).padStart(2, '0')}</span></p>
        <h2 id="work-title" className={styles.title}>{t('title')}<span aria-hidden="true">↙</span></h2>
        <nav className={styles.map} aria-label={t('mapLabel')}>
          <a href="#archive"><span>{String(projects.length).padStart(2, '0')} / {t('archive')}</span><span aria-hidden="true">↓</span></a>
        </nav>
      </header>
      {selected.map((p, i) => (
        <article id={`case-${p.slug}`} key={p.id} className={styles.feature} data-alternate={i === 1 ? '' : undefined} aria-labelledby={`title-${p.slug}`}>
          <div className={styles.projectHead}>
            <p className={styles.kicker}>{String(i + 1).padStart(2, '0')} / {p.client}{p.nda ? ` · ${t('ndaShort')}` : ''}</p>
            <h3 id={`title-${p.slug}`}>{p.title}</h3>
            <p className={styles.summary}>{p.summary}</p>
            <Link href={`/work/${p.slug}`} className={styles.caseLink}>{c('viewCase')}<span aria-hidden="true">↗</span></Link>
          </div>
          <div className={styles.visual}>
            {i === 0 ? <InterfaceReveal label={t('inspect')} title={p.title} summary={p.summary}><ProjectLens project={p} number={i + 1} engineering={projectEngineering[p.slug]?.[locale]} /></InterfaceReveal> : <ProjectLens project={p} number={i + 1} engineering={projectEngineering[p.slug]?.[locale]} />}
          </div>
          <div className={styles.projectFoot}><span>{p.role}</span><span>{p.stack?.slice(0, 4).join(' / ')}</span></div>
        </article>
      ))}
      <section id="archive" className={styles.archive} aria-labelledby="archive-title">
        <header className={styles.archiveHead}><h3 id="archive-title">{t('archive')}</h3><p>{t('intro', { count: projects.length })}</p></header>
        <ol>{projects.map((p, i) => (
          <li key={p.id}><Link href={`/work/${p.slug}`} className={styles.archiveLink}>
            <span className={styles.archiveIndex}>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.archiveName}>{p.title}<small>{p.role}</small></span>
            <span className={styles.archiveStack}>{p.stack?.slice(0, 2).join(' / ')}</span>
            <span aria-hidden="true">↗</span>
          </Link></li>
        ))}</ol>
      </section>
    </section>
  );
}
