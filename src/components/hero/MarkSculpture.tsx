'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Sculpture } from './mark-sculpture';
import styles from './MarkSculpture.module.css';

export function MarkSculpture() {
  const t = useTranslations('sculpture');
  const id = useId();
  const host = useRef<HTMLDivElement>(null);
  const sculpture = useRef<Sculpture | null>(null);
  const [ready, setReady] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let live = true;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      import('./mark-sculpture').then(({ mountSculpture }) => {
        if (!live) return;
        sculpture.current = mountSculpture(element, () => { if (live) setReady(true); }, () => { if (live) setReady(false); });
      }).catch(() => { /* The static render remains available without WebGL. */ });
    }, { rootMargin: '100px' });
    observer.observe(element);
    return () => {
      live = false;
      observer.disconnect();
      sculpture.current?.dispose();
      sculpture.current = null;
    };
  }, []);

  return (
    <figure className={styles.sculpture} data-scene-ready={ready || undefined}>
      <div ref={host} id={id} className={styles.stage} role="img" aria-label={t('description')}>
        <Image src="/images/mark-sculpture.webp" alt="" width={720} height={720} priority sizes="(min-width: 80rem) 55vw, (min-width: 48rem) 60vw, 100vw" className={styles.fallback} />
      </div>
      <figcaption className={styles.caption}>
        <span>{t('label')}</span>
        <button type="button" disabled={!ready} aria-expanded={expanded} aria-controls={id} onClick={() => {
          sculpture.current?.setExpanded(!expanded);
          setExpanded(!expanded);
        }}>
          {t(expanded ? 'close' : 'open')}<span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
      </figcaption>
      <p className={styles.hint} aria-live="polite">{ready ? t(expanded ? 'layers' : 'hint') : '\u00a0'}</p>
    </figure>
  );
}
