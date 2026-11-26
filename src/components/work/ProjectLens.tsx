'use client';

import Image from 'next/image';
import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { asImageMedia, type Project } from '@/lib/content-types';
import type { ProjectEngineering } from '@/lib/project-engineering';
import { EngineeringDiagram } from './EngineeringDiagram';
import styles from './ProjectLens.module.css';

export function ProjectLens({ project: p, number = 1, engineering }: { project: Project; number?: number; engineering?: ProjectEngineering }) {
  const t = useTranslations('project');
  const [view, setView] = useState<'product' | 'inside' | 'engineering'>('product');
  const id = useId();
  const cover = asImageMedia(p.cover);
  const metric = p.metrics?.[0];
  return (
    <div className={styles.lens} data-inside={view !== 'product' ? '' : undefined}>
      <div className={styles.toolbar}>
        <span className={styles.identifier}>{String(number).padStart(2, '0')} / {p.slug}</span>
        <div className={styles.switch} role="group" aria-label={t('switchLabel')}>
          <button type="button" aria-pressed={view === 'product'} aria-controls={`${id}-product`} onClick={() => setView('product')}>{t(cover ? 'product' : 'overview')}</button>
          <button type="button" aria-pressed={view === 'inside'} aria-controls={`${id}-inside`} onClick={() => setView('inside')}>{t('contribution')} <span aria-hidden="true">↗</span></button>
          {engineering ? <button type="button" className={styles.engineeringButton} aria-pressed={view === 'engineering'} aria-controls={`${id}-engineering`} onClick={() => setView('engineering')}>{t('howItWorks')} <span aria-hidden="true">+</span></button> : null}
        </div>
      </div>
      <div id={`${id}-product`} className={styles.product} hidden={view !== 'product'}>
        {cover ? <Image src={cover.sizes?.wide?.url || cover.url!} alt={cover.alt ?? ''} width={cover.sizes?.wide?.width ?? cover.width ?? 1600} height={cover.sizes?.wide?.height ?? cover.height ?? 1000} sizes="(min-width: 80rem) 85vw, 100vw" className={styles.cover} /> : p.stages?.length ? <div className={styles.flow}><p className={styles.insideLabel}>{t('flow')}</p><ol className={styles.workflow}>{p.stages.map((stage, i) => <li key={stage.id ?? i}><span className={styles.stageIndex}>{String(i + 1).padStart(2, '0')} <span aria-hidden="true">↘</span></span><strong>{stage.title}</strong>{stage.text ? <p>{stage.text}</p> : null}</li>)}</ol></div> : (
          <div className={styles.poster}>
            <span className={styles.posterIndex} aria-hidden="true">{String(number).padStart(2, '0')}</span>
            <div className={styles.posterLead}><p className={styles.posterTitle}>{metric?.value || p.title}</p>{metric ? <p className={styles.metricCaption}>{metric.label}</p> : null}</div>
            <div className={styles.posterFoot}><span>{p.client}</span><p className={styles.posterContribution}>{p.highlights?.[0]?.text || p.summary}</p></div>
          </div>
        )}
      </div>
      <div id={`${id}-inside`} className={styles.inside} hidden={view !== 'inside'}>
        <p className={styles.insideLabel}>{t(p.highlights?.length ? 'contribution' : 'overview')}</p>
        <ol className={styles.steps}>
          {(p.highlights?.length ? p.highlights : [{ text: p.summary }]).map((h, i) => <li key={h.id ?? i}><span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><p>{h.text}</p></li>)}
        </ol>
        <p className={styles.stack}>{p.stack?.join(' / ')}</p>
      </div>
      {engineering ? <div id={`${id}-engineering`} hidden={view !== 'engineering'}>{view === 'engineering' ? <EngineeringDiagram diagram={engineering} nda={p.nda} /> : null}</div> : null}
    </div>
  );
}
