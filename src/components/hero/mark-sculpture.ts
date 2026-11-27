import * as THREE from 'three';
import { cssMilliseconds } from '@/components/motion/css-time';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MARK_PATH } from '@/components/brand/mark-path';

export type Sculpture = { setExpanded(value: boolean): void; dispose(): void };

export function mountSculpture(host: HTMLDivElement, onReady: () => void, onUnavailable: () => void): Sculpture {
  const css = getComputedStyle(document.documentElement);
  const color = (name: string) => css.getPropertyValue(name).trim();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let settleTime = cssMilliseconds(css.getPropertyValue('--dur-slow')) / 6;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(color('--color-paper'), color('--color-metal'), 1.3));
  const key = new THREE.DirectionalLight(color('--color-paper'), 2.5);
  key.position.set(-3, 5, 8);
  const rim = new THREE.DirectionalLight(color('--color-accent'), 2);
  rim.position.set(5, -2, 0);
  scene.add(key, rim);
  const materials = [
    new THREE.MeshStandardMaterial({ color: color('--color-ink'), roughness: .4, metalness: .25 }),
    new THREE.MeshStandardMaterial({ color: color('--color-accent'), roughness: .38, metalness: .32 }),
    new THREE.MeshStandardMaterial({ color: color('--color-paper'), roughness: .7 }),
  ];
  const paths = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${MARK_PATH}"/></svg>`).paths;
  const shapes = paths.flatMap(path => path.toShapes());
  const group = new THREE.Group();
  const layers = [14, 3, 2].map((depth, index) => {
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelSize: .65, bevelThickness: .55, bevelSegments: 3, curveSegments: 20 });
    geometry.translate(-58, -50, -depth / 2);
    geometry.scale(.035, .035, .035);
    geometry.rotateX(Math.PI);
    const mesh = new THREE.Mesh(geometry, materials[index]);
    if (index === 1) mesh.scale.setScalar(1.015);
    group.add(mesh);
    return { mesh, z: index === 0 ? .2 : index === 1 ? -.06 : -.34, spread: index === 1 ? 1.5 : index === 2 ? -1.3 : 0 };
  });
  scene.add(group);
  let expanded = false, spread = 0, aimX = 0, aimY = 0, lookX = 0, lookY = 0;
  let raf = 0, last = 0, visible = true, disposed = false, ready = false;

  function frame(time: number) {
    const k = reduced.matches ? 1 : 1 - Math.exp(-Math.min(last ? time - last : 16, 64) / settleTime);
    last = time;
    lookX += (aimX - lookX) * k;
    lookY += (aimY - lookY) * k;
    spread += ((expanded ? 1 : 0) - spread) * k;
    group.rotation.set(-.15 + lookY * .25, -.45 + lookX * .5, -.16);
    for (const layer of layers) layer.mesh.position.z = layer.z + spread * layer.spread;
    camera.position.z = (8.2 + spread * 2.3) * Math.max(1, .9 / camera.aspect);
    renderer.render(scene, camera);
    if (!ready) { ready = true; onReady(); }
    const moving = Math.abs(aimX - lookX) + Math.abs(aimY - lookY) + Math.abs((expanded ? 1 : 0) - spread) > .001;
    raf = moving ? requestAnimationFrame(frame) : 0;
    if (!raf) last = 0;
  }
  function wake() { if (!disposed && visible && !document.hidden && !raf) raf = requestAnimationFrame(frame); }
  function pause() { cancelAnimationFrame(raf); raf = last = 0; }
  const resize = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    wake();
  });
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else pause(); });
  const look = (event: PointerEvent) => {
    if (reduced.matches || !hover.matches || event.pointerType !== 'mouse') return;
    const box = host.getBoundingClientRect();
    aimX = (event.clientX - box.left) / box.width - .5;
    aimY = (event.clientY - box.top) / box.height - .5;
    wake();
  };
  const reset = () => { aimX = aimY = 0; if (reduced.matches) lookX = lookY = 0; wake(); };
  const motionChanged = () => { settleTime = cssMilliseconds(getComputedStyle(document.documentElement).getPropertyValue('--dur-slow')) / 6; reset(); };
  const visibility = () => { if (document.hidden) pause(); else wake(); };
  const contextLost = (event: Event) => { event.preventDefault(); onUnavailable(); dispose(); };
  function dispose() {
    if (disposed) return;
    disposed = true;
    pause();
    resize.disconnect();
    intersection.disconnect();
    host.removeEventListener('pointermove', look);
    host.removeEventListener('pointerleave', reset);
    reduced.removeEventListener('change', motionChanged);
    hover.removeEventListener('change', reset);
    document.removeEventListener('visibilitychange', visibility);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    layers.forEach(({ mesh }) => mesh.geometry.dispose());
    materials.forEach(material => material.dispose());
    environment.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
  host.appendChild(renderer.domElement);
  resize.observe(host);
  intersection.observe(host);
  host.addEventListener('pointermove', look, { passive: true });
  host.addEventListener('pointerleave', reset);
  reduced.addEventListener('change', motionChanged);
  hover.addEventListener('change', reset);
  document.addEventListener('visibilitychange', visibility);
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  return { setExpanded(value) { expanded = value; reset(); }, dispose };
}
