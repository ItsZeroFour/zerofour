'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Mast.module.css';

const LINES = ['Zero', 'Four'] as const;
const LETTERS = LINES.flatMap((word, line) => [...word].map((ch) => ({ ch, line })));

/* Параметры реакции на курсор. Это поведение, а не стиль, поэтому живут здесь. */
const WDTH_SWING = 64; // насколько литера под курсором шире соседей
const WGHT_SWING = 80;
const MISREG_RANGE_X = 0.06; // em, максимальный сдвиг оранжевого прогона
const MISREG_RANGE_Y = 0.035;
const SMOOTH_MS = 190; // постоянная сглаживания: медленно и плавно

type Props = { className?: string };

/**
 * Мачта ZEROFOUR: два прогона (тушь + акцент).
 * Загрузка — CSS (литеры садятся в строку). Курсор — один rAF-цикл,
 * который пишет CSS-переменные: ширину/вес каждой литеры и сдвиг приводки.
 */
export function Mast({ className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cleanup: (() => void) | null = null;

    const setup = () => {
      cleanup?.();
      cleanup = null;
      if (canHover.matches && !reduced.matches) cleanup = attach(root);
    };
    setup();
    let stopScatter = scatterOnScroll(root, reduced.matches);
    const onMotionChange = () => {
      setup();
      stopScatter();
      stopScatter = scatterOnScroll(root, reduced.matches);
    };
    canHover.addEventListener('change', setup);
    reduced.addEventListener('change', onMotionChange);
    return () => {
      cleanup?.();
      stopScatter();
      canHover.removeEventListener('change', setup);
      reduced.removeEventListener('change', onMotionChange);
    };
  }, []);

  const layer = (kind: 'ink' | 'accent') => (
    <span className={kind === 'ink' ? styles.ink : styles.accent} data-layer={kind}>
      {LINES.map((word, line) => (
        <span key={word} className={styles.line}>
          {LETTERS.map((l, i) =>
            l.line === line ? (
              <span
                key={i}
                className={styles.sort}
                data-i={i}
                style={
                  {
                    '--i': i,
                    fontVariationSettings: `'wdth' var(--w${i}, var(--mast-wdth)), 'wght' var(--g${i}, var(--display-wght-rest))`,
                  } as React.CSSProperties
                }
              >
                {l.ch}
              </span>
            ) : null,
          )}
        </span>
      ))}
    </span>
  );

  return (
    <div ref={ref} className={[styles.mast, className].filter(Boolean).join(' ')} aria-hidden="true">
      {layer('accent')}
      {layer('ink')}
    </div>
  );
}

const N = LETTERS.length;
const LINE_IDX = LINES.map((_, line) => LETTERS.map((l, i) => (l.line === line ? i : -1)).filter((i) => i >= 0));

/** Подключает курсорную реакцию; возвращает функцию отключения. */
function attach(root: HTMLDivElement) {
  const css = getComputedStyle(root);
  const num = (name: string, fallback: number) => parseFloat(css.getPropertyValue(name)) || fallback;
  const rest = { w: 118, g: 820, min: 62, max: 168, gMax: 900 };
  const cur = { w: new Float32Array(N), g: new Float32Array(N), mx: 0, my: 0 };
  const tgt = { w: new Float32Array(N), g: new Float32Array(N), mx: 0, my: 0 };
  const gauss = new Float32Array(N);
  // Центры литер в долях мачты: меряются в покое и масштабируются вместе с ней
  const cx = new Float32Array(N);
  const cy = new Float32Array(N);
  let sigma = 0.15; // в долях ширины мачты
  let box = root.getBoundingClientRect();
  let boxDirty = false;
  let raf = 0;
  let last = 0;
  let visible = true;
  let listening = false;
  let disposed = false;

  const readRest = () => {
    rest.w = num('--mast-wdth', 118);
    rest.g = num('--display-wght-rest', 820);
    rest.min = num('--display-wdth-min', 62);
    rest.max = num('--display-wdth-max', 168);
    rest.gMax = num('--display-wght-max', 900);
  };

  /** Замер центров — только когда литеры в покое (без деформации). */
  const measureCenters = () => {
    readRest();
    box = root.getBoundingClientRect();
    const ink = root.querySelectorAll<HTMLElement>('[data-layer="ink"] [data-i]');
    ink.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      cx[i] = (r.left + r.width / 2 - box.left) / box.width;
      cy[i] = (r.top + r.height / 2 - box.top) / box.height;
    });
    const oneLine = Math.abs(cy[0] - cy[N - 1]) < 0.25;
    sigma = (1 / (oneLine ? N : N / LINES.length)) * 1.3;
    boxDirty = false;
  };

  const toRest = () => {
    tgt.w.fill(rest.w);
    tgt.g.fill(rest.g);
    tgt.mx = 0;
    tgt.my = 0;
  };

  const aim = (x: number, y: number) => {
    if (boxDirty) {
      box = root.getBoundingClientRect();
      boxDirty = false;
    }
    const px = (x - box.left) / box.width;
    const py = (y - box.top) / box.height;
    const aspect = box.height / box.width;
    for (let i = 0; i < N; i++) {
      const dx = (px - cx[i]) / sigma;
      const dy = ((py - cy[i]) * aspect) / (sigma * 1.6);
      gauss[i] = Math.exp(-(dx * dx + dy * dy));
    }
    // Ширина строки сохраняется: прибавка одних литер = убыль других (по строке)
    for (const idx of LINE_IDX) {
      let mean = 0;
      for (const i of idx) mean += gauss[i];
      mean /= idx.length;
      for (const i of idx) {
        tgt.w[i] = Math.min(rest.max, Math.max(rest.min, rest.w + WDTH_SWING * (gauss[i] - mean)));
        tgt.g[i] = Math.min(rest.gMax, rest.g + WGHT_SWING * gauss[i]);
      }
    }
    tgt.mx = Math.max(-1, Math.min(1, px * 2 - 1)) * MISREG_RANGE_X;
    tgt.my = Math.max(-1, Math.min(1, py - 0.5)) * MISREG_RANGE_Y;
  };

  const tick = (t: number) => {
    const dt = last ? Math.min(t - last, 64) : 16;
    last = t;
    const k = 1 - Math.exp(-dt / SMOOTH_MS);
    let moving = false;
    for (let i = 0; i < N; i++) {
      cur.w[i] += (tgt.w[i] - cur.w[i]) * k;
      cur.g[i] += (tgt.g[i] - cur.g[i]) * k;
      if (Math.abs(tgt.w[i] - cur.w[i]) > 0.05 || Math.abs(tgt.g[i] - cur.g[i]) > 0.5) moving = true;
      root.style.setProperty(`--w${i}`, cur.w[i].toFixed(1));
      root.style.setProperty(`--g${i}`, cur.g[i].toFixed(0));
    }
    cur.mx += (tgt.mx - cur.mx) * k;
    cur.my += (tgt.my - cur.my) * k;
    if (Math.abs(tgt.mx - cur.mx) > 0.0005 || Math.abs(tgt.my - cur.my) > 0.0005) moving = true;
    root.style.setProperty('--mx', `${cur.mx.toFixed(4)}em`);
    root.style.setProperty('--my', `${cur.my.toFixed(4)}em`);
    raf = moving && visible ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  };

  const wake = () => {
    if (!raf && visible) raf = requestAnimationFrame(tick);
  };
  const onMove = (e: PointerEvent) => {
    aim(e.clientX, e.clientY);
    wake();
  };
  const onLeave = () => {
    toRest();
    wake();
  };
  const markDirty = () => {
    boxDirty = true;
  };
  /** На resize сбрасываем деформацию и меряем заново в покое. */
  const onResize = () => {
    for (let i = 0; i < N; i++) {
      root.style.removeProperty(`--w${i}`);
      root.style.removeProperty(`--g${i}`);
    }
    measureCenters();
    cur.w.fill(rest.w);
    cur.g.fill(rest.g);
    toRest();
  };

  readRest();
  cur.w.fill(rest.w);
  cur.g.fill(rest.g);
  toRest();

  // Слушаем курсор только после того, как литеры сели (анимация загрузки)
  const start = () => {
    if (disposed) return;
    measureCenters();
    if (listening) return;
    listening = true;
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
  };
  const startDelay = window.setTimeout(() => {
    if (document.fonts) document.fonts.ready.then(start);
    else start();
  }, 1400);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
  });
  io.observe(root);
  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', markDirty, { passive: true });

  return () => {
    disposed = true;
    window.clearTimeout(startDelay);
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', markDirty);
    for (let i = 0; i < N; i++) {
      root.style.removeProperty(`--w${i}`);
      root.style.removeProperty(`--g${i}`);
    }
    root.style.removeProperty('--mx');
    root.style.removeProperty('--my');
  };
}

/** Детерминированный «случай» для каждой литеры: рассыпание всегда одинаковое. */
const rand = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Литеры рассыпаются, пока обложка уходит вверх; в шапке появляется слово ZeroFour.
 * Обе краски (тушь и акцент) двигаются одинаково — приводка не теряется.
 */
function scatterOnScroll(root: HTMLDivElement, reduced: boolean) {
  gsap.registerPlugin(ScrollTrigger);
  const hero = root.closest('section') ?? root;
  const html = document.documentElement;

  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) delete html.dataset.mastOut;
    else html.dataset.mastOut = 'true';
  });
  io.observe(root);

  if (reduced) {
    return () => {
      io.disconnect();
      delete html.dataset.mastOut;
    };
  }

  let ctx: gsap.Context | null = null;
  // ждём, пока литеры сядут (CSS-анимация загрузки владеет transform первые ~1.3 с)
  const start = window.setTimeout(() => {
    ctx = gsap.context(() => {
      // Мачта держится на месте, пока обложка уезжает; литеры разлетаются,
      // портрет и текст наплывают поверх — как лист, который тянут из-под набора.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=75%',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      });
      // «Закрепление» без pin: обложка — контейнер (container-type), и fixed внутри
      // неё не работает. Сдвигаем мачту ровно на пройденный скролл.
      tl.to(root, { y: () => window.innerHeight * 0.75, ease: 'none', duration: 1 }, 0);
      for (let i = 0; i < N; i++) {
        const sorts = root.querySelectorAll(`[data-i="${i}"]`);
        const dir = rand(i, 3) < 0.5 ? -1 : 1;
        tl.to(
          sorts,
          {
            x: () => (rand(i, 1) - 0.5) * 0.5 * window.innerWidth,
            y: () => -(0.3 + rand(i, 2) * 0.6) * window.innerHeight,
            rotation: dir * (40 + rand(i, 5) * 70),
            scale: 0.6 + rand(i, 6) * 0.8,
            opacity: 0,
            ease: 'power1.in',
            duration: 0.75,
          },
          0.1 + i * 0.03,
        );
      }
    }, root);
  }, 1500);

  return () => {
    window.clearTimeout(start);
    ctx?.revert();
    io.disconnect();
    delete html.dataset.mastOut;
  };
}
