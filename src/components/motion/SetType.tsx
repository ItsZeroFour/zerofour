'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const sorts = el.querySelectorAll<HTMLElement>('[data-sort]');
    const ctx = gsap.context(() => {
      gsap.fromTo(
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
      );
    }, el);
    return () => ctx.revert();
  }, []);

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
