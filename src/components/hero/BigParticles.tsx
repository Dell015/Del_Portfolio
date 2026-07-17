"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPHERE_RADIUS = 2.8;
const COUNT_DESKTOP = 800;
const COUNT_MOBILE = 400;

// White/light palette for sphere particles
const PALETTE = [
  new THREE.Color("#ffffff"), // pure white
  new THREE.Color("#f0f0f0"), // soft white
  new THREE.Color("#e8e8e8"), // light gray
  new THREE.Color("#f5f0ff"), // hint lavender
  new THREE.Color("#fff5f5"), // hint rose
  new THREE.Color("#f0f8ff"), // hint blue-white
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    positions[i * 3] = Math.cos(theta) * radiusAtY * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
  }
  return positions;
}

function randomScatter(count: number, range: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = range * (0.3 + Math.random() * 0.7);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  return positions;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface BigParticlesProps {
  /** 0 = hidden, 1 = fully visible. Fades in as small particles fade out. */
  alphaRef: React.MutableRefObject<number>;
  /** 0 = scattered, 1 = fibonacci sphere. Driven post-unlock. */
  sphereFormRef: React.MutableRefObject<number>;
  /** Hex color string to tint toward on hover, or null for no tint (white). */
  tintColorRef: React.MutableRefObject<string | null>;
  /** Multiplier for individual particle size (from slider). */
  sizeRef: React.MutableRefObject<number>;
  /** Multiplier for sphere radius (from slider). */
  scaleRef: React.MutableRefObject<number>;
  /** Whether on mobile (reduces count) */
  isMobile?: boolean;
}

const _dummy = new THREE.Object3D();

export function BigParticles({ alphaRef, sphereFormRef, tintColorRef, sizeRef, scaleRef, isMobile = false }: BigParticlesProps) {
  const count = isMobile ? COUNT_MOBILE : COUNT_DESKTOP;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Tint lerp state
  const currentTint = useRef(new THREE.Color("#ffffff"));
  const targetTint = useRef(new THREE.Color("#ffffff"));

  // Precompute positions and colors once
  const { scatterPositions, spherePositions, colors } = useMemo(() => {
    const scatter = randomScatter(count, 6);
    const sphere = fibonacciSphere(count, SPHERE_RADIUS);
    const cols = new Array(count).fill(null).map((_, i) =>
      PALETTE[i % PALETTE.length].clone()
    );
    return { scatterPositions: scatter, spherePositions: sphere, colors: cols };
  }, [count]);

  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = materialRef.current;
    if (!mesh || !mat) return;

    const time = state.clock.elapsedTime;
    const alpha = alphaRef.current;
    const sp = sphereFormRef.current;
    const scale = scaleRef.current;
    // Smooth ease for sphere formation
    const spEased = sp * sp * (3 - 2 * sp); // smoothstep

    // Material opacity
    mat.opacity = alpha * 0.85;

    // Tint lerp toward hovered project color
    if (tintColorRef.current) {
      targetTint.current.set(tintColorRef.current);
    } else {
      targetTint.current.set("#ffffff");
    }
    currentTint.current.lerp(targetTint.current, 0.06);
    mat.color.copy(currentTint.current);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Lerp scatter → sphere (with scale applied to sphere target)
      let x = scatterPositions[i3] + (spherePositions[i3] * scale - scatterPositions[i3]) * spEased;
      let y = scatterPositions[i3 + 1] + (spherePositions[i3 + 1] * scale - scatterPositions[i3 + 1]) * spEased;
      let z = scatterPositions[i3 + 2] + (spherePositions[i3 + 2] * scale - scatterPositions[i3 + 2]) * spEased;

      // Gentle drift when not fully formed
      if (spEased < 0.9) {
        const drift = 0.05 * (1 - spEased);
        x += Math.sin(time * 0.3 + i * 0.11) * drift;
        y += Math.cos(time * 0.2 + i * 0.07) * drift;
        z += Math.sin(time * 0.25 + i * 0.05) * drift;
      }

      // Size: base + subtle pulse when formed, multiplied by sizeRef
      const baseScale = (0.04 + Math.sin(i * 0.7) * 0.015) * sizeRef.current;
      const pulse = spEased > 0.8
        ? baseScale * (1 + Math.sin(time * 1.5 + i * 0.3) * 0.08 * spEased)
        : baseScale;

      _dummy.position.set(x, y, z);
      _dummy.scale.setScalar(pulse);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#ffffff"
        toneMapped={false}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
