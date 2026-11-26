'use client';

import { Fragment, useId, useState, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import type { ProjectEngineering } from '@/lib/project-engineering';
import styles from './EngineeringDiagram.module.css';

export function EngineeringDiagram({ diagram, nda }: { diagram: ProjectEngineering; nda?: boolean | null }) {
  const t = useTranslations('engineering');
  const [selected, setSelected] = useState(0);
  const id = useId();
  const node = diagram.nodes[selected];
  const count = diagram.nodes.length;
  const points = diagram.nodes.map((_, i) => ({ x: (i + .5) * 100 / count, y: i % 2 ? 68 : 32 }));
  const route = points.map((p, i) => i === 0 ? `M${p.x} ${p.y}` : `H${(p.x + points[i - 1].x) / 2}V${p.y}H${p.x}`).join(' ');
  const detail = <div key={node.id} className={styles.description}><p className={styles.nodeTitle}>{node.label}</p><p>{node.detail}</p><div className={styles.edge}><span>{t('edgeCase')}</span><p>{node.edgeCase}</p></div></div>;

  return (
    <div className={styles.engineering}>
      <header className={styles.head}><p>{t('kicker')}</p><p className={styles.title}>{diagram.title}</p><span>{t('hint')}</span></header>
      <div className={styles.circuit} role="group" aria-label={t('select')} style={{ '--node-count': count } as CSSProperties}>
        <svg className={styles.wires} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={route} />
          <path key={selected} d={route} className={styles.signal} pathLength="1" />
        </svg>
        {diagram.nodes.map((item, i) => <Fragment key={item.id}><button type="button" className={styles.node} aria-pressed={selected === i} aria-controls={`${id}-detail ${id}-mobile-${i}`} onClick={() => setSelected(i)}>
          <span className={styles.index}>{String(i + 1).padStart(2, '0')}<span aria-hidden="true">↗</span></span><span>{item.label}</span>
        </button><div id={`${id}-mobile-${i}`} className={`${styles.detail} ${styles.mobileDetail}`} hidden={selected !== i} aria-live="polite" aria-atomic="true">{selected === i ? detail : null}</div></Fragment>)}
      </div>
      <div id={`${id}-detail`} className={`${styles.detail} ${styles.desktopDetail}`} aria-live="polite" aria-atomic="true">
        <span className={styles.number} aria-hidden="true">{String(selected + 1).padStart(2, '0')}</span>
        {detail}
      </div>
      <footer className={styles.foot}><span>{t('verified')}</span>{!nda ? <div>{diagram.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}</div> : null}</footer>
    </div>
  );
}
