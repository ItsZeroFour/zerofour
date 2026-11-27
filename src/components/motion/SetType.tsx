'use client';

import { useEffect, useRef } from 'react';
import styles from './SetType.module.css';

const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 91.7 + salt * 271.3) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Заголовок, который «набирается» из рассыпанных литер, пока доезжает до экрана.
 * Скринридер читает текст целиком; литеры — декоративные.
 */
export function SetType({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let live = true;
    let near = false;
    let started = false;
    let dispose: (() => void) | undefined;
    const start = async () => {
      if (!near || reduced.matches || started) return;
      started = true;
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
        if (!live) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add('(prefers-reduced-motion: no-preference)', () => {
          if (el.getBoundingClientRect().bottom < 0) return;
          const sorts = el.querySelectorAll<HTMLElement>('[data-sort]');
          const ctx = gsap.context(() => gsap.fromTo(
        sorts,
        {
          xPercent: (i) => (rand(i, 1) - 0.5) * 220,
          yPercent: (i) => 120 + rand(i, 2) * 260,
          rotation: (i) => (rand(i, 3) - 0.5) * 120,
          opacity: 0,
        },
        {
          xPercent: 0,
          yPercent: 0,
          rotation: 0,
          opacity: 1,
          ease: 'power3.out',
          stagger: { each: 0.04, from: 'random' },
          scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 55%', scrub: 0.8 },
        },
          ), el);
          return () => ctx.revert();
        });
        dispose = () => media.revert();
      } catch { /* Contact text is visible without animation. */ }
    };
    const observer = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; if (near) void start(); }, { rootMargin: '200px' });
    observer.observe(el);
    reduced.addEventListener('change', start);
    return () => { live = false; observer.disconnect(); reduced.removeEventListener('change', start); dispose?.(); };
  }, [text]);

  return (
    <span ref={ref} className={[styles.set, className].filter(Boolean).join(' ')}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {[...text].map((ch, i) =>
          ch === ' ' ? (
            <span key={i}> </span>
          ) : (
            <span key={i} data-sort className={styles.sort}>
              {ch}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
