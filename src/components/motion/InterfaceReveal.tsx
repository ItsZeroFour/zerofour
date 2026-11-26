'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './InterfaceReveal.module.css';

export function InterfaceReveal({ children, label, title, summary }: { children: ReactNode; label: string; title: string; summary: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', () => {
      // Do not cover content the visitor has already reached before hydration.
      const box = el.getBoundingClientRect();
      if (box.top + box.height / 2 < window.innerHeight / 2) return;
      const doors = el.querySelectorAll<HTMLElement>('[data-shutter]');
      const reveal = gsap.to(doors, {
        xPercent: (i) => (i === 0 ? -101 : 101),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'center center',
          end: () => `+=${window.innerHeight * Number(getComputedStyle(el).getPropertyValue('--gate-scroll-factor'))}`,
          pin: true,
          anticipatePin: 1,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      el.dataset.interfaceReveal = 'on';
      let frame = 0;
      // Inspection modes change page height, so the doors must follow their new center.
      const resize = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      resize.observe(el.closest('main') ?? el);
      resize.observe(el);
      if (el.firstElementChild) resize.observe(el.firstElementChild);

      return () => {
        resize.disconnect();
        cancelAnimationFrame(frame);
        reveal.scrollTrigger?.kill();
        reveal.kill();
        delete el.dataset.interfaceReveal;
      };
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={root} className={styles.reveal}>
      {children}
      <div className={styles.shutters} aria-hidden="true">
        {[0, 1].map((side) => (
          <div key={side} className={styles.shutter} data-shutter>
            <div className={styles.sheet}>
              <span className={styles.index}>01</span>
              <div className={styles.project}>
                <span className={styles.title}>{title}</span>
                <p className={styles.summary}>{summary}</p>
              </div>
              <span className={styles.label}>{label}</span>
              <span className={styles.direction}>↗</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
