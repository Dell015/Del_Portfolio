"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { projects as projectsData } from "@/lib/content/projects";

// ─── Constants ────────────────────────────────────────────────────────────────

const SPHERE_RADIUS = 2.2;
const COUNT_DESKTOP = 800;
const COUNT_MOBILE = 400;

// Default palette — each orb gets its own color, mostly white with subtle variations
const DEFAULT_PALETTE = [
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
  /** Whether cursor is near the sphere */
  cursorNearSphereRef: React.MutableRefObject<boolean>;
  /** Whether on mobile (reduces count) */
  isMobile?: boolean;
}

const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _color2 = new THREE.Color();

export function BigParticles({ alphaRef, sphereFormRef, tintColorRef, sizeRef, scaleRef, cursorNearSphereRef, isMobile = false }: BigParticlesProps) {
  const count = isMobile ? COUNT_MOBILE : COUNT_DESKTOP;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  // Per-instance color tracking for lerp
  const currentColors = useRef<Float32Array | null>(null);
  const baseColors = useRef<Float32Array | null>(null);
  // Track cascade progress (how many particles have started transitioning)
  const cascadeStartTime = useRef<number>(0);
  const isCascading = useRef(false);
  // Rotation speed ref for smooth lerp to 0
  const rotSpeedRef = useRef(-0.0015);

  // Precompute positions and base colors once
  const { scatterPositions, spherePositions, defaultColors } = useMemo(() => {
    const scatter = randomScatter(count, 6);
    const sphere = fibonacciSphere(count, SPHERE_RADIUS);

    // Each orb gets its own default color (white with subtle variation)
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const c = DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { scatterPositions: scatter, spherePositions: sphere, defaultColors: colors };
  }, [count]);

  // Initialize per-instance colors
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Set up instanceColor buffer
    const colorArray = new Float32Array(count * 3);
    colorArray.set(defaultColors);
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
    mesh.instanceColor.needsUpdate = true;

    // Track current and base for lerping
    currentColors.current = new Float32Array(colorArray);
    baseColors.current = new Float32Array(defaultColors);
  }, [count, defaultColors]);

  useFrame((state) => {
    const mesh = meshRef.current;
    const mat = materialRef.current;
    if (!mesh || !mat || !mesh.instanceColor || !currentColors.current || !baseColors.current) return;

    const time = state.clock.elapsedTime;
    const alpha = alphaRef.current;
    const sp = sphereFormRef.current;
    const scale = scaleRef.current;
    // Smooth ease for sphere formation
    const spEased = sp * sp * (3 - 2 * sp); // smoothstep

    // Rotate the mesh — stops when cursor is near sphere
    const targetRotSpeed = cursorNearSphereRef.current ? 0 : -0.0015;
    rotSpeedRef.current = THREE.MathUtils.lerp(rotSpeedRef.current, targetRotSpeed, 0.03);
    if (sp > 0.5) {
      mesh.rotation.y += rotSpeedRef.current;
    }

    // Material opacity
    mat.opacity = alpha * 0.55;

    // Determine target tint per orb — cascade effect
    const hasTint = tintColorRef.current !== null;

    // Track cascade state
    if (hasTint && !isCascading.current) {
      isCascading.current = true;
      cascadeStartTime.current = time;
    } else if (!hasTint) {
      isCascading.current = false;
    }

    // Parse gradient colors if tinting
    let gradColor1 = _color;
    let gradColor2 = _color;
    if (hasTint) {
      // tintColorRef stores the first gradient color; we need both
      // The gradient is stored as identityGradient[0] and [1] on the project
      // tintColorRef.current is identityGradient[0]
      gradColor1 = _color.set(tintColorRef.current!);
      gradColor2 = _color2.set(tintColorRef.current!);
      // Try to find the second gradient color from the projects data
      for (const p of projectsData) {
        if (p.identityGradient[0] === tintColorRef.current) {
          gradColor2 = _color2.set(p.identityGradient[1]);
          break;
        }
      }
    }

    const colors = currentColors.current;
    const base = baseColors.current;
    const instanceColor = mesh.instanceColor as THREE.InstancedBufferAttribute;

    // Cascade timing: each particle starts its transition with a slight delay
    const cascadeElapsed = isCascading.current ? time - cascadeStartTime.current : 0;
    const cascadeDuration = 1.5; // total time for all particles to start transitioning
    const particleTransitionSpeed = 0.08; // how fast each particle lerps once started

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // ─── Position ───
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

      // ─── Per-instance color ───
      // Cascade: each particle starts its transition at a staggered time
      if (hasTint && isCascading.current) {
        const particleDelay = (i / count) * cascadeDuration;
        const particleElapsed = cascadeElapsed - particleDelay;

        if (particleElapsed > 0) {
          // This particle has started — lerp toward its gradient target
          // Distribute particles across the gradient (first half → color1, second half → color2)
          const gradientT = i / count;
          const targetR = gradColor1.r + (gradColor2.r - gradColor1.r) * gradientT;
          const targetG = gradColor1.g + (gradColor2.g - gradColor1.g) * gradientT;
          const targetB = gradColor1.b + (gradColor2.b - gradColor1.b) * gradientT;

          colors[i3] += (targetR - colors[i3]) * particleTransitionSpeed;
          colors[i3 + 1] += (targetG - colors[i3 + 1]) * particleTransitionSpeed;
          colors[i3 + 2] += (targetB - colors[i3 + 2]) * particleTransitionSpeed;
        }
        // Particles that haven't started yet stay at their current color
      } else {
        // No tint — lerp back to base color
        colors[i3] += (base[i3] - colors[i3]) * 0.04;
        colors[i3 + 1] += (base[i3 + 1] - colors[i3 + 1]) * 0.04;
        colors[i3 + 2] += (base[i3 + 2] - colors[i3 + 2]) * 0.04;
      }

      // Write to the instance color buffer
      (instanceColor.array as Float32Array)[i3] = colors[i3];
      (instanceColor.array as Float32Array)[i3 + 1] = colors[i3 + 1];
      (instanceColor.array as Float32Array)[i3 + 2] = colors[i3 + 2];
    }

    mesh.instanceMatrix.needsUpdate = true;
    instanceColor.needsUpdate = true;
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
