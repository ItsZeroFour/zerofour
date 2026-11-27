'use client';

import { useEffect } from 'react';
import type Lenis from 'lenis';

export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let lenis: Lenis | undefined;
    let revision = 0;

    const setup = async () => {
      const current = ++revision;
      lenis?.destroy();
      lenis = undefined;
      delete window.__lenis;
      if (reduced.matches || !finePointer.matches) return;
      const { default: Lenis } = await import('lenis');
      if (current !== revision) return;
      lenis = new Lenis({ duration: 0.85, smoothWheel: true, syncTouch: false, autoRaf: true, anchors: true });
      window.__lenis = lenis;
      if (document.documentElement.hasAttribute('data-menu-open')) lenis.stop();
    };

    void setup();
    reduced.addEventListener('change', setup);
    finePointer.addEventListener('change', setup);
    return () => {
      revision++;
      reduced.removeEventListener('change', setup);
      finePointer.removeEventListener('change', setup);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}
