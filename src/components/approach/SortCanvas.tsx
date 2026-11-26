'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { MARK_PATH } from '@/components/brand/mark-path';

/* Цвета 3D-сцены — это материалы, а не UI-токены; берём значения из токенов при монтировании */
const readToken = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* Размеры литеры (условные единицы): лицо 1.7 × 1.5, длина «ножки» 3 */
const W = 1.7;
const H = 1.5;
const D = 3;
const FACE = 0.2;

function useMarkGeometry() {
  return useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="${MARK_PATH}"/></svg>`;
    const data = new SVGLoader().parse(svg);
    const shapes = data.paths.flatMap((path) => path.toShapes());
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: FACE * 100,
      bevelEnabled: true,
      bevelThickness: 1.2,
      bevelSize: 0.8,
      bevelSegments: 2,
      curveSegments: 10,
    });
    geo.center();
    // SVG: ось Y вниз → переворачиваем; плюс зеркалим по X — как настоящая литера
    const s = (W * 0.72) / 116;
    geo.scale(-s, -s, 0.01);
    geo.computeVertexNormals();
    return geo;
  }, []);
}

type CanvasProps = {
  progress: MutableRefObject<number>;
  redrawRef: MutableRefObject<(() => void) | null>;
};

function Sort({ progress, redrawRef }: CanvasProps) {
  const group = useRef<THREE.Group>(null);
  const mark = useMarkGeometry();
  const { invalidate } = useThree();
  const colors = useMemo(
    () => ({
      metal: readToken('--color-metal', '#4a4842'),
      ink: readToken('--color-accent', '#ff4d00'),
      nick: readToken('--color-ink', '#14140f'),
    }),
    [],
  );

  useEffect(() => {
    redrawRef.current = invalidate;
    invalidate();
    return () => {
      redrawRef.current = null;
    };
  }, [invalidate, redrawRef]);

  useFrame(({ camera, viewport }) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current;
    const turn = ease(p / 0.7); // кувырок, лицо разворачивается к зрителю
    const press = ease((p - 0.7) / 0.1); // «удар» о бумагу
    const lift = ease((p - 0.8) / 0.12); // литера уходит, к 0.92 в кадре только оттиск
    const depth = lerp(-1.2, 0.6, turn) + Math.sin(press * Math.PI) * 0.6 - lift * 14;
    const halfWidth = viewport.getCurrentViewport(camera, [0, 0, depth]).width / 2;
    g.rotation.set(
      lerp(-1.15, -0.2, turn) - lift * 0.5,
      lerp(Math.PI * 2.35, 0.32, turn) + lift * 0.4,
      lerp(0.55, 0.04, turn),
    );
    g.position.set(
      lerp(0.15, 0, turn) + lift * (halfWidth + D),
      lerp(0.35, 0, turn) + lift * 2.2,
      depth,
    );
  });

  return (
    <group ref={group}>
      {/* ножка литеры: лицо смотрит на +Z */}
      <RoundedBox args={[W, H, D]} radius={0.035} smoothness={3} position={[0, 0, -D / 2]}>
        <meshStandardMaterial color={colors.metal} metalness={0.86} roughness={0.24} envMapIntensity={1.5} />
      </RoundedBox>
      {/* «нос» — две выемки на боку, по ним наборщик узнаёт ориентацию */}
      {[-0.9, -1.25].map((z) => (
        <mesh key={z} position={[0, -H / 2 - 0.004, z]}>
          <boxGeometry args={[W * 1.002, 0.012, 0.08]} />
          <meshStandardMaterial color={colors.nick} metalness={0.6} roughness={0.6} />
        </mesh>
      ))}
      {/* рельефный зеркальный знак, покрытый краской */}
      {/* группа 0 — лицевая плоскость (краска), группа 1 — бока рельефа (металл) */}
      <mesh geometry={mark} position={[0, 0, FACE / 2]}>
        <meshStandardMaterial attach="material-0" color={colors.ink} metalness={0.1} roughness={0.6} />
        <meshStandardMaterial attach="material-1" color={colors.metal} metalness={0.86} roughness={0.24} envMapIntensity={1.5} />
      </mesh>
    </group>
  );
}

export default function SortCanvas({ progress, redrawRef }: CanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop="demand"
      camera={{ position: [0, 0, 11], fov: 28 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <hemisphereLight args={['#ffffff', '#8a877d', 0.9]} />
      <directionalLight position={[4, 5, 6]} intensity={2.2} />
      <directionalLight position={[-5, -2, 3]} intensity={0.8} />
      <Sort progress={progress} redrawRef={redrawRef} />
      {/* Студийный свет без загрузки HDR — генерируется на месте */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, 4]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[5, -1, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={2} position={[0, 0, -6]} scale={4} />
      </Environment>
    </Canvas>
  );
}
