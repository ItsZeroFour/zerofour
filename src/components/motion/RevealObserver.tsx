'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Один наблюдатель на страницу: элементы с [data-reveal] ниже первого экрана
 * получают [data-revealed], когда въезжают в кадр. Всё, что видно сразу,
 * не прячется — без мигания и без вреда LCP.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const html = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.revealed = 'true';
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.dataset.revealed = 'true';
      } else {
        el.dataset.pending = 'true';
        io.observe(el);
      }
    });
    html.dataset.motion = 'on';
    return () => {
      io.disconnect();
      delete html.dataset.motion;
      // всё, что не успело проявиться, возвращаем видимым (повторный монтаж / StrictMode)
      document.querySelectorAll<HTMLElement>('[data-pending]').forEach((el) => delete el.dataset.pending);
    };
  }, [pathname]);

  return null;
}
