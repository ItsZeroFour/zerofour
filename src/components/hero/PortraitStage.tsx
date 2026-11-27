'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { PortraitScene } from './portrait-scene';
import styles from './PortraitStage.module.css';

export function PortraitStage({ src, alternate, name, children }: { src: string; alternate: string; name: string; children?: ReactNode }) {
  const t = useTranslations('portrait');
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<PortraitScene | null>(null);
  const frame = useRef(false);
  const [second, setSecond] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    const host = root.current;
    if (!host) return;
    const start = async () => {
      try {
        const images = [...host.querySelectorAll('img')];
        await Promise.all(images.map(image => image.decode().catch(() => undefined)));
        const { mountPortrait } = await import('./portrait-scene');
        if (!live) return;
        const mounted = await mountPortrait(host, images.map(image => image.currentSrc || image.src), () => { if (live) setReady(true); }, () => { if (live) setReady(false); });
        if (!live) { mounted.dispose(); return; }
        scene.current = mounted;
        scene.current.setFrame(frame.current);
      } catch { /* The two photographs work without WebGL. */ }
    };
    const timer = window.setTimeout(start, 1000);
    return () => { live = false; clearTimeout(timer); scene.current?.dispose(); scene.current = null; };
  }, [src, alternate]);

  return (
    <>
    <figure className={styles.figure} data-frame={second ? 'second' : 'first'} data-portrait-ready={ready || undefined}>
      <div ref={root} className={styles.stage} role="img" aria-label={name}>
        <Image src={src} alt="" width={1024} height={1536} priority fetchPriority="high" sizes="(min-width: 48rem) 65vw, 100vw" className={`${styles.image} ${styles.first}`} />
        <Image src={alternate} alt="" width={1024} height={1536} loading="eager" sizes="(min-width: 48rem) 65vw, 100vw" className={`${styles.image} ${styles.second}`} />
      </div>
    </figure>
      <div className={styles.controls}>
        {children}
        <button type="button" aria-pressed={second} onClick={() => { const next = !second; frame.current = next; setSecond(next); scene.current?.setFrame(next); }}>
          <span className={styles.symbol} aria-hidden="true">↔</span><span>{t('changeFrame')}</span><span className={styles.counter} aria-hidden="true">{second ? '02' : '01'}</span>
        </button>
      </div>
    </>
  );
}
