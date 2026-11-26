'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mark } from '@/components/brand/Mark';
import styles from './Approach.module.css';

const SortCanvas = dynamic(() => import('./SortCanvas'), { ssr: false });

const motionQuery = '(prefers-reduced-motion: no-preference)';
function subscribeMotion(notify: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const allowsMotion = () => window.matchMedia(motionQuery).matches;
const staticOnServer = () => false;

function canRenderSort() {
  const context = document.createElement('canvas').getContext('webgl2', { powerPreference: 'high-performance' });
  if (!context) return false;
  context.getExtension('WEBGL_lose_context')?.loseContext();
  return true;
}

class CanvasBoundary extends Component<{ children: ReactNode; onFailure: () => void }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export type Principle = { id?: string; title: string; text: string; proof?: string | null };

type Labels = { kicker: string; mirror: string; print: string };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Окно прогресса [a, b] → 0..1 */
const span = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/**
 * Закреплённая сцена: литера кувыркается по скроллу, принципы сменяются,
 * затем литера «бьёт» по бумаге и уходит — остаётся оранжевый оттиск «04».
 * Всё, что зависит от скролла, пишется в CSS-переменные — без перерисовки React.
 */
export function ApproachScene({ principles, labels }: { principles: Principle[]; labels: Labels }) {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const redrawRef = useRef<(() => void) | null>(null);
  const [active, setActive] = useState(0);
  const [mount3d, setMount3d] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const motion = useSyncExternalStore(subscribeMotion, allowsMotion, staticOnServer) && !canvasFailed;

  useEffect(() => {
    const el = root.current;
    if (!el || !motion) return;
    // 3D грузим только на подлёте к сцене
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          if (canRenderSort()) setMount3d(true);
          else setCanvasFailed(true);
        }
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(el);

    gsap.registerPlugin(ScrollTrigger);
    const n = Math.max(principles.length, 1);
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        progress.current = p;
        redrawRef.current?.();
        setActive(Math.min(n - 1, Math.floor(p * n * 0.999)));
        // удар: оттиск проступает ровно в момент контакта и держится
        const hit = span(p, 0.735, 0.775);
        const shake = Math.sin(span(p, 0.735, 0.8) * Math.PI * 3) * (1 - span(p, 0.735, 0.8));
        el.style.setProperty('--print', hit.toFixed(3));
        el.style.setProperty('--shake', `${(shake * 5).toFixed(2)}px`);
        // подпись «зеркально» — пока литера смотрит лицом
        el.style.setProperty('--mirror', (span(p, 0.42, 0.5) * (1 - span(p, 0.72, 0.76))).toFixed(3));
        el.style.setProperty('--printed', span(p, 0.8, 0.86).toFixed(3));
      },
    });
    return () => {
      io.disconnect();
      st.kill();
    };
  }, [principles.length, motion]);

  return (
    <div ref={root} className={styles.track} data-static={motion ? undefined : ''}>
      <div className={styles.stage}>
        <div className={styles.visual}>
          <p className={styles.stageKicker} aria-hidden="true">
            {labels.kicker}
          </p>

          {/* Фильтр «краски»: неровный край оттиска */}
          <svg className={styles.defs} aria-hidden="true" focusable="false">
            <filter id="zf-ink" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
            </filter>
          </svg>

          <div className={styles.imprint} aria-hidden="true">
            <Mark className={styles.imprintMark} />
            <Mark className={styles.imprintGhost} />
          </div>

          {mount3d && motion ? (
            <div className={styles.canvas}>
              <CanvasBoundary onFailure={() => setCanvasFailed(true)}>
                <SortCanvas progress={progress} redrawRef={redrawRef} />
              </CanvasBoundary>
            </div>
          ) : null}

          <p className={styles.mirror} aria-hidden="true">
            {labels.mirror}
          </p>
          <p className={styles.printed} aria-hidden="true">
            {labels.print}
          </p>

          <p className={styles.counter} aria-hidden="true">
            <span>{String(active + 1).padStart(2, '0')}</span>
            <span className={styles.counterOf}>/ {String(principles.length).padStart(2, '0')}</span>
          </p>
        </div>

        <ol className={styles.list}>
          {principles.map((p, i) => (
            <li key={p.id ?? i} className={styles.principle} data-active={i === active ? 'true' : undefined}>
              <span className={styles.pNum} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.pTitle}>{p.title}</h3>
              <p className={styles.pText}>{p.text}</p>
              {p.proof ? <p className={styles.pProof}>{p.proof}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
