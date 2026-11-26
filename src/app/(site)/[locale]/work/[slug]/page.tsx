import type { Metadata } from 'next';
import Image from 'next/image';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { asImageMedia, getProject, getProjects, getSite } from '@/lib/content';
import { ProjectLens } from '@/components/work/ProjectLens';
import { projectEngineering } from '@/lib/project-engineering';
import { Contacts } from '@/components/contacts/Contacts';
import styles from './page.module.css';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const p = await getProject(locale, slug);
  if (!p) return {};
  const image = asImageMedia(p.cover);
  return {
    title: `${p.title} · ZeroFour`, description: p.summary,
    alternates: { canonical: `/${locale}/work/${slug}`, languages: { ru: `/ru/work/${slug}`, en: `/en/work/${slug}` } },
    openGraph: { title: p.title, description: p.summary, ...(image ? { images: [{ url: image.url! }] } : {}) },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [p, projects, site, t, w] = await Promise.all([getProject(locale, slug), getProjects(locale), getSite(locale), getTranslations('project'), getTranslations('work')]);
  if (!p) notFound();
  const index = projects.findIndex((item) => item.id === p.id);
  const next = projects.length > 1 ? projects[(index + 1) % projects.length] : null;
  const story = [{ label: t('challenge'), text: p.challenge }, { label: t('decision'), text: p.decision }, { label: t('outcome'), text: p.outcome }].filter((row) => row.text);
  const gallery = (p.gallery ?? []).flatMap((row) => { const media = asImageMedia(row.image); return media ? [{ ...row, media }] : []; });
  return (
    <>
      <article className={styles.case}>
        <Link href="/#work" className={styles.back}>↙ {t('back')}</Link>
        <header className={styles.head}>
          <p className={styles.kicker}>{String(index + 1).padStart(2, '0')} / {p.client}{p.nda ? ` / ${w('ndaShort')}` : ''}</p>
          <h1>{p.title}</h1>
          <p className={styles.summary}>{p.summary}</p>
          <dl className={styles.meta}>
            {p.role ? <div><dt>{w('role')}</dt><dd>{p.role}</dd></div> : null}
            {p.year ? <div><dt>{w('years')}</dt><dd>{p.year.replace(/[—–-]\s*$/, `— ${w('now')}`)}</dd></div> : null}
            {p.stack?.length ? <div><dt>{w('stack')}</dt><dd>{p.stack.join(' / ')}</dd></div> : null}
          </dl>
        </header>
        <ProjectLens project={p} number={index + 1} engineering={projectEngineering[p.slug]?.[locale === 'en' ? 'en' : 'ru']} />
        {p.metrics?.length ? <dl className={styles.metrics} aria-label={w('results')}>{p.metrics.map((metric, i) => <div key={metric.id ?? i}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>)}</dl> : null}
        <section className={styles.contribution} aria-labelledby="contribution-title">
          <h2 id="contribution-title">{t('contribution')}</h2>
          <ol>{(p.highlights ?? []).map((row, i) => <li key={row.id ?? i}><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><p>{row.text}</p></li>)}</ol>
        </section>
        {story.length ? <section className={styles.story} aria-label={t('inside')}>{story.map((row) => <div key={row.label}><h2>{row.label}</h2><p>{row.text}</p></div>)}</section> : null}
        {gallery.length ? <section className={styles.gallery} aria-labelledby="gallery-title"><h2 id="gallery-title">{t('gallery')}</h2>{gallery.map((row, i) => <figure key={row.id ?? i}><Image src={row.media.sizes?.wide?.url || row.media.url!} width={row.media.sizes?.wide?.width ?? row.media.width ?? 1600} height={row.media.sizes?.wide?.height ?? row.media.height ?? 1000} alt={row.media.alt ?? ''} sizes="(min-width: 80rem) 90vw, 100vw" />{row.caption ? <figcaption>{row.caption}</figcaption> : null}</figure>)}</section> : null}
        {!p.nda && (p.liveUrl || p.repoUrl) ? <div className={styles.external}>{p.liveUrl ? <a href={p.liveUrl} target="_blank" rel="noopener noreferrer">{w('live')} ↗</a> : null}{p.repoUrl ? <a href={p.repoUrl} target="_blank" rel="noopener noreferrer">{w('repo')} ↗</a> : null}</div> : null}
        {next ? <Link href={`/work/${next.slug}`} className={styles.next}><span>{t('next')}</span><strong>{next.title}</strong><span aria-hidden="true">↗</span></Link> : <Link href="/#work" className={styles.back}>{t('all')} ↗</Link>}
      </article>
      <Contacts site={site} />
    </>
  );
}
