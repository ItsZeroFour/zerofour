import * as THREE from 'three';
import type { Fact } from '@/lib/content-types';

export type DossierContent = { title: string; subtitle: string; summary: string; contribution: string; number: string; imageUrl?: string; metric?: Fact; insideLabel: string };
export type Dossier = { setProject(project: DossierContent): void; setOpen(value: boolean): void; dispose(): void };

export function mountDossier(host: HTMLDivElement, initial: DossierContent, onReady: () => void, onUnavailable: () => void): Dossier {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string) => css.getPropertyValue(name).trim();
  const paper = color('--color-paper');
  const ink = color('--color-ink');
  const signal = color('--color-signal');
  const textFont = css.getPropertyValue('--font-text').trim();
  const displayFont = css.getPropertyValue('--font-display').trim();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let duration = parseFloat(css.getPropertyValue('--dur-slow')) / 6;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(paper, color('--color-stage'), 2.5));
  const key = new THREE.DirectionalLight(paper, 3);
  key.position.set(-3, 4, 7);
  const rim = new THREE.DirectionalLight(signal, .8);
  rim.position.set(4, -2, 4);
  scene.add(key, rim);
  const group = new THREE.Group();
  scene.add(group);
  const edge = new THREE.MeshStandardMaterial({ color: ink, roughness: .6, metalness: .12 });
  const pages = new THREE.MeshStandardMaterial({ color: paper, roughness: .9 });
  const front = new THREE.MeshStandardMaterial({ roughness: .75 });
  const inside = new THREE.MeshStandardMaterial({ roughness: .85 });
  const lining = new THREE.MeshStandardMaterial({ roughness: .85 });
  const materials = [edge, pages, front, inside, lining];
  const geometries: THREE.BufferGeometry[] = [];
  const box = (width: number, height: number, depth: number, material: THREE.Material | THREE.Material[]) => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    geometries.push(geometry);
    return new THREE.Mesh(geometry, material);
  };
  const back = box(4.4, 2.85, .12, edge);
  back.position.z = -.16;
  group.add(back);
  for (let index = 0; index < 3; index++) {
    const page = box(4.2, 2.66, .045, pages);
    page.position.set(.025 * index, 0, -.065 + index * .05);
    group.add(page);
  }
  const spread = box(4.18, 2.64, .016, [pages, pages, pages, pages, inside, pages]);
  spread.position.z = .105;
  group.add(spread);
  const hinge = new THREE.Group();
  hinge.position.set(-2.2, 0, .17);
  const cover = box(4.4, 2.85, .085, [edge, edge, edge, edge, front, lining]);
  cover.position.x = 2.2;
  hinge.add(cover);
  group.add(hinge);
  const spineGeometry = new THREE.CylinderGeometry(.075, .075, 2.85, 16);
  geometries.push(spineGeometry);
  const spine = new THREE.Mesh(spineGeometry, edge);
  spine.position.set(-2.2, 0, 0);
  group.add(spine);

  let open = false, progress = 0, aimX = 0, aimY = 0, lookX = 0, lookY = 0;
  let raf = 0, last = 0, visible = true, disposed = false, ready = false, revision = 0;
  let frontTexture: THREE.CanvasTexture | null = null;
  let insideTexture: THREE.CanvasTexture | null = null;
  let current = initial;

  function lines(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number, maxLines: number) {
    const words = text.split(/\s+/);
    let line = '', lineIndex = 0;
    for (let index = 0; index < words.length; index++) {
      const next = line ? `${line} ${words[index]}` : words[index];
      if (ctx.measureText(next).width > width && line) {
        ctx.fillText(line, x, y + lineIndex * lineHeight);
        line = words[index];
        lineIndex++;
        if (lineIndex === maxLines - 1) {
          const rest = [line, ...words.slice(index + 1)].join(' ');
          let ending = rest;
          while (ctx.measureText(ending + '…').width > width && ending.length) ending = ending.slice(0, -1);
          ctx.fillText(ending === rest ? rest : ending + '…', x, y + lineIndex * lineHeight);
          return;
        }
      } else line = next;
    }
    if (lineIndex < maxLines) ctx.fillText(line, x, y + lineIndex * lineHeight);
  }
  function canvas() { const element = document.createElement('canvas'); element.width = 1280; element.height = 830; return element; }
  function makeTexture(element: HTMLCanvasElement) {
    const texture = new THREE.CanvasTexture(element);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    return texture;
  }
  function setProject(project: DossierContent) {
    if (disposed) return;
    current = project;
    const version = ++revision;
    const face = canvas();
    const ctx = face.getContext('2d')!;
    ctx.fillStyle = paper; ctx.fillRect(0, 0, 1280, 830);
    ctx.fillStyle = ink; ctx.font = `500 26px ${textFont}`;
    ctx.fillText(`${project.number} / ${project.subtitle}`, 58, 58, 1164);
    ctx.font = `550 88px ${displayFont}`;
    lines(ctx, project.title, 56, 218, 1164, 102, 4);
    ctx.fillStyle = signal; ctx.fillRect(58, 744, 1164, 6);
    ctx.fillStyle = ink; ctx.font = `400 25px ${textFont}`;
    ctx.fillText('ZeroFour', 58, 790);
    const updateFace = () => {
      if (disposed || revision !== version) return;
      frontTexture?.dispose(); frontTexture = makeTexture(face); front.map = frontTexture; lining.map = frontTexture; front.needsUpdate = lining.needsUpdate = true; wake();
    };
    updateFace();
    if (project.imageUrl) {
      const image = new Image();
      image.onload = () => {
        if (disposed || revision !== version) return;
        ctx.fillStyle = paper; ctx.fillRect(0, 0, 1280, 830);
        ctx.fillStyle = ink; ctx.font = `500 33px ${textFont}`;
        lines(ctx, project.title, 58, 57, 1164, 38, 2);
        const scale = Math.min(1164 / image.naturalWidth, 612 / image.naturalHeight);
        const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
        ctx.drawImage(image, 58 + (1164 - width) / 2, 112 + (612 - height) / 2, width, height);
        ctx.fillStyle = signal; ctx.fillRect(58, 744, 1164, 6);
        ctx.fillStyle = ink; ctx.font = `400 24px ${textFont}`;
        ctx.fillText(`${project.number} / ${project.subtitle}`, 58, 790, 1164);
        updateFace();
      };
      // Use the site's image endpoint so remote CMS media can be used as a canvas texture.
      image.src = `/_next/image?url=${encodeURIComponent(project.imageUrl)}&w=1080&q=75`;
    }
    const page = canvas();
    const inner = page.getContext('2d')!;
    inner.fillStyle = paper; inner.fillRect(0, 0, 1280, 830);
    inner.fillStyle = ink; inner.font = `500 36px ${textFont}`;
    inner.fillText(`${project.number} / ${project.insideLabel}`, 64, 70);
    inner.font = `550 104px ${displayFont}`;
    lines(inner, project.title, 64, 180, 1148, 112, 3);
    inner.font = `400 64px ${textFont}`;
    lines(inner, project.contribution, 64, 520, 1148, 72, 2);
    if (project.metric) {
      inner.fillStyle = signal; inner.font = `600 88px ${displayFont}`;
      inner.fillText(project.metric.value, 64, 730, 1148);
      inner.fillStyle = ink; inner.font = `400 36px ${textFont}`;
      inner.fillText(project.metric.label, 64, 780, 1148);
    }
    insideTexture?.dispose(); insideTexture = makeTexture(page); inside.map = insideTexture; inside.needsUpdate = true;
    wake();
  }
  function frame(time: number) {
    const k = reduced.matches ? 1 : 1 - Math.exp(-Math.min(last ? time - last : 16, 64) / duration);
    last = time;
    progress += ((open ? 1 : 0) - progress) * k;
    lookX += (aimX - lookX) * k; lookY += (aimY - lookY) * k;
    hinge.rotation.y = -progress * 1.95;
    group.position.x = progress;
    group.rotation.set(-.16 + lookY * .16, -.2 + lookX * .25, .035);
    const mobile = window.innerWidth < 768;
    camera.position.z = (8.4 + progress * 6.4) * Math.max(mobile ? .8 : 1, 1.05 / camera.aspect) + (mobile ? progress : 0);
    renderer.render(scene, camera);
    if (!ready) { ready = true; onReady(); }
    const moving = Math.abs((open ? 1 : 0) - progress) + Math.abs(aimX - lookX) + Math.abs(aimY - lookY) > .001;
    raf = moving ? requestAnimationFrame(frame) : 0;
    if (!raf) last = 0;
  }
  function wake() { if (!disposed && visible && !document.hidden && !raf) raf = requestAnimationFrame(frame); }
  function pause() { cancelAnimationFrame(raf); raf = last = 0; }
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); wake();
  });
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else pause(); });
  const look = (event: PointerEvent) => {
    if (reduced.matches || !hover.matches || event.pointerType !== 'mouse') return;
    const box = host.getBoundingClientRect();
    aimX = (event.clientX - box.left) / box.width - .5; aimY = (event.clientY - box.top) / box.height - .5; wake();
  };
  const reset = () => { aimX = aimY = 0; if (reduced.matches) lookX = lookY = 0; wake(); };
  const motion = () => { duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-slow')) / 6; reset(); };
  const visibility = () => { if (document.hidden) pause(); else wake(); };
  const contextLost = (event: Event) => { event.preventDefault(); onUnavailable(); dispose(); };
  function dispose() {
    if (disposed) return;
    disposed = true; revision++; pause(); resize.disconnect(); intersection.disconnect();
    host.removeEventListener('pointermove', look); host.removeEventListener('pointerleave', reset);
    reduced.removeEventListener('change', motion); hover.removeEventListener('change', reset);
    document.removeEventListener('visibilitychange', visibility);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
    frontTexture?.dispose(); insideTexture?.dispose(); renderer.dispose(); renderer.domElement.remove();
  }
  host.appendChild(renderer.domElement); resize.observe(host); intersection.observe(host);
  host.addEventListener('pointermove', look, { passive: true }); host.addEventListener('pointerleave', reset);
  reduced.addEventListener('change', motion); hover.addEventListener('change', reset);
  document.addEventListener('visibilitychange', visibility); renderer.domElement.addEventListener('webglcontextlost', contextLost);
  setProject(initial);
  document.fonts.ready.then(() => { if (!disposed) setProject(current); });
  return { setProject, setOpen(value) { open = value; reset(); }, dispose };
}
