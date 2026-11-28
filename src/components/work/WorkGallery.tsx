'use client';

import Image from 'next/image';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { asImageMedia, type Project } from '@/lib/content-types';
import type { Dossier, DossierContent } from './project-dossier';
import styles from './WorkGallery.module.css';

export function WorkGallery({ projects }: { projects: Project[] }) {
  const t = useTranslations('gallery');
  const initial = projects.find(project => project.featured) ?? projects[0];
  const [selected, setSelected] = useState(initial?.id);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const active = projects.find(project => project.id === selected) ?? initial;
  const id = useId();
  const host = useRef<HTMLDivElement>(null);
  const dossier = useRef<Dossier | null>(null);
  const cover = asImageMedia(active?.cover);
  const content = useMemo<DossierContent>(() => ({
    title: active?.title ?? '',
    subtitle: active?.client || active?.role || '',
    summary: active?.summary ?? '',
    contribution: active?.highlights?.[0]?.text || active?.role || '',
    number: String(projects.findIndex(project => project.id === active?.id) + 1).padStart(2, '0'),
    imageUrl: cover?.sizes?.card?.url || cover?.url || undefined,
    metric: active?.metrics?.[0],
    insideLabel: t('inside'),
  }), [active, cover, projects, t]);
  const latest = useRef(content);

  useEffect(() => {
    latest.current = content;
    dossier.current?.setProject(content);
  }, [content]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let live = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      import('./project-dossier').then(({ mountDossier }) => {
        if (!live) return;
        dossier.current = mountDossier(element, latest.current, () => { if (live) setReady(true); }, () => { if (live) setReady(false); });
      }).catch(() => { /* Project images and links remain available without WebGL. */ });
    }, { rootMargin: '200px' });
    observer.observe(element);
    return () => {
      live = false;
      observer.disconnect();
      dossier.current?.dispose();
      dossier.current = null;
    };
  }, []);

  if (!active) return null;
  const choose = (value: Project['id']) => {
    if (value === active.id) return;
    setSelected(value);
    setOpen(false);
    dossier.current?.setOpen(false);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mobilePicker}>
        <label htmlFor={`${id}-choose`}>{t('choose')}</label>
        <select id={`${id}-choose`} value={String(active.id)} aria-controls={`${id}-preview`} onChange={event => {
          const project = projects.find(item => String(item.id) === event.target.value);
          if (project) choose(project.id);
        }}>
          {projects.map(project => <option key={project.id} value={String(project.id)}>{project.title}</option>)}
        </select>
      </div>
      <ol className={styles.projects} id="archive" aria-label={t('list')}>
        {projects.map((project, index) => (
          <li key={project.id} className={styles.row} data-active={project.id === active.id || undefined}>
            <button type="button" className={styles.choose} aria-pressed={project.id === active.id} aria-controls={`${id}-preview`} onClick={() => choose(project.id)}>
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.rowCopy}><span className={styles.rowTitle}>{project.title}</span><span className={styles.rowRole}>{project.role || project.client}</span></span>
            </button>
            <Link href={`/work/${project.slug}`} className={styles.caseLink} aria-label={t('view', { title: project.title })}>
              <span className={styles.mobileTitle}>{project.title}</span><span aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ol>
      <div id={`${id}-preview`} className={styles.preview} data-dossier-ready={ready || undefined} aria-labelledby={`${id}-title`}>
        <Link href={`/work/${active.slug}`} className={styles.visualLink} aria-label={t('view', { title: active.title })}>
          <div ref={host} id={`${id}-object`} className={styles.visual} role="img" aria-label={t('preview', { title: active.title })}>
            <div className={styles.fallback}>
              {cover ? <Image key={cover.id} src={cover.sizes?.card?.url || cover.url!} width={cover.sizes?.card?.width ?? cover.width ?? 1280} height={cover.sizes?.card?.height ?? cover.height ?? 800} sizes="(min-width: 80rem) 55vw, (min-width: 48rem) 60vw, 100vw" alt="" loading="eager" className={styles.cover} /> : <div className={styles.typeCover}><span>{content.number} / {active.client}</span><strong>{active.title}</strong><p>{active.role}</p></div>}
            </div>
          </div>
        </Link>
        <div className={styles.controls}>
          <span>{t('counter', { current: content.number, total: String(projects.length).padStart(2, '0') })}</span>
          <button type="button" disabled={!ready} aria-expanded={open} aria-controls={`${id}-object`} onClick={() => {
            dossier.current?.setOpen(!open);
            setOpen(!open);
          }}>{t(open ? 'close' : 'open')}<span aria-hidden="true">{open ? '−' : '+'}</span></button>
        </div>
        <div className={styles.story}>
          <div className={styles.activeMeta}><span>{active.client}</span>{active.nda ? <span>NDA</span> : active.year ? <span>{active.year}</span> : null}</div>
          <h3 id={`${id}-title`} key={active.id} aria-live="polite">{active.title}</h3>
          <p>{active.summary}</p>
          <Link href={`/work/${active.slug}`} className={styles.readCase}>{t('read')}<span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </div>
  );
}
