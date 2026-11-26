'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Плавный скролл (Lenis) на одном тике с GSAP ScrollTrigger.
 * При prefers-reduced-motion — обычный нативный скролл.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop: (() => void) | undefined;

    const setup = () => {
      stop?.();
      stop = undefined;
      if (reduced.matches) return;

      const lenis = new Lenis({
        duration: 1.15,
        easing: (t) => 1 - Math.pow(1 - t, 4), // медленно и плавно, без отскока
        smoothWheel: true,
        anchors: { offset: 0 },
      });
      window.__lenis = lenis;
      if (document.documentElement.hasAttribute('data-menu-open')) lenis.stop();

      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      stop = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
        delete window.__lenis;
      };
    };

    setup();
    reduced.addEventListener('change', setup);
    return () => {
      reduced.removeEventListener('change', setup);
      stop?.();
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}
