'use client';

import { useId, useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { useTranslations } from 'next-intl';
import styles from './PortraitAssembly.module.css';

export function PortraitAssembly({ children, className, numberClassName }: { children: ReactNode; className: string; numberClassName: string }) {
  const t = useTranslations('assembly');
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();

  const reset = () => {
    root.current?.style.removeProperty('--look-x');
    root.current?.style.removeProperty('--look-y');
  };
  const look = (event: PointerEvent<HTMLDivElement>) => {
    if (!expanded || event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--look-x', `${(event.clientX - box.left) / box.width - .5}`);
    event.currentTarget.style.setProperty('--look-y', `${(event.clientY - box.top) / box.height - .5}`);
  };

  return (
    <div ref={root} className={`${className} ${styles.assembly}`} data-expanded={expanded} onPointerMove={look} onPointerLeave={reset}>
      <div id={id} className={styles.stage}>
        <svg className={styles.blueprint} viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0H400V500H0ZM100 0V500M200 0V500M300 0V500M0 100H400M0 200H400M0 300H400M0 400H400" />
          <path d="M0 0L400 500M400 0L0 500" strokeDasharray="3 8" />
        </svg>
        <div className={styles.backplane} aria-hidden="true" />
        <span className={`${numberClassName} ${styles.number}`} aria-hidden="true">04</span>
        <div className={styles.portrait}>{children}</div>
      </div>
      <div id={`${id}-notes`} className={styles.notes} hidden={!expanded}>
        <span className={styles.note}><b>01</b> {t('type')}</span>
        <span className={styles.note}><b>02</b> {t('layout')}</span>
        <span className={styles.note}><b>03</b> {t('image')}</span>
      </div>
      <button type="button" className={styles.inspect} aria-expanded={expanded} aria-controls={`${id} ${id}-notes`} onClick={() => { reset(); setExpanded(!expanded); }}>
        <span aria-hidden="true" className={styles.symbol}>{expanded ? '−' : '+'}</span>
        <span>{t(expanded ? 'close' : 'open')}</span>
      </button>
    </div>
  );
}
