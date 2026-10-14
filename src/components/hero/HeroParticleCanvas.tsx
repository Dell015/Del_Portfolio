"use client";

import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, useAdaptiveDpr } from "@/components/perf/AdaptiveDpr";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { AnimatePresence } from "framer-motion";
import * as THREE from "three";
import type { PointCloud } from "@/lib/particles/sampleImageToPoints";
import { curlNoiseGLSL } from "@/lib/particles/curlNoise";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useVirtualScroll, LOCK_TRIGGER } from "@/lib/hooks/useVirtualScroll";
import { projects } from "@/lib/content/projects";
import { BigParticles } from "./BigParticles";
import { BackdropParticles } from "./BackdropParticles";
import { bloomValue, makeSwirlUniforms, swirlGlsl, syncSwirl } from "@/lib/swirl";
import { ProjectNodeCard } from "@/components/projects/sphere/ProjectNodeCard";
import { SphereOverlay } from "@/components/projects/sphere/SphereOverlay";
import { useSphereHoverStore } from "@/lib/store/sphereHover";
import {
  DEFAULT_SPHERE_SETTINGS,
  loadSphereSettings,
  saveSphereSettings,
  type SphereSettings,
} from "@/lib/sphere/settings";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPHERE_RADIUS = 2.2;
const _nodeColor = new THREE.Color();
// Scratch vectors, reused every frame, allocating per node per frame in the
// hover/projection code produced constant GC pressure (visible as micro-stutter).
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _v4 = new THREE.Vector3();

// Scroll progress breakpoints (for pre-lock phases only)
const SP = {
  DISSOLVE_START: 0.05,
  DISSOLVE_END: 0.4,
};

/** Tiny deterministic PRNG (mulberry32). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mapRange(value: number, inMin: number, inMax: number) {
  return Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
}

/**
 * Per-frame delta clamp. All time-based animation in this canvas accumulates
 * its own elapsed time from `delta` instead of reading `state.clock.elapsedTime`:
 * toggling `frameloop` (done when the sphere zone is left) resets R3F's clock to 0,
 * which would send any absolute-timestamp maths backwards.
 */
function stepTime(current: number, delta: number) {
  return current + Math.min(delta, 0.1);
}

/** Generate fibonacci sphere positions for the target */
function generateSpherePositions(count: number, radius: number): Float32Array {
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

/** Get positions for project nodes on sphere surface */
function getNodePositions(count: number, radius: number): [number, number, number][] {
  const positions: [number, number, number][] = [];
  // Evenly distribute across the sphere, excluding top/bottom poles (avoid ±30° from poles)
  // Use golden ratio spiral for even spacing
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const yMin = -0.7; // exclude bottom pole
  const yMax = 0.7;  // exclude top pole
  for (let i = 0; i < count; i++) {
    // Evenly space within the Y band
    const y = yMax - (i / (count - 1)) * (yMax - yMin);
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    positions.push([
      Math.cos(theta) * radiusAtY * radius,
      y * radius,
      Math.sin(theta) * radiusAtY * radius,
    ]);
  }
  return positions;
}


// ─── Shaders ───────────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  attribute vec3 positionA;
  attribute vec3 positionB;
  attribute vec3 colorA;
  attribute vec3 colorB;
  attribute float speed;
  attribute vec3 sphereTarget;

  uniform float uProgress;
  uniform float uTime;
  uniform float uPointSize;
  uniform vec2 uResolution;
  uniform float uDissolve;
  uniform float uAmbient;
  uniform float uGather;
  uniform float uCondense;
  uniform float uRingCompress;
  uniform float uExplode;
  uniform float uSmallFade;
  uniform float uScatter;
  uniform float uBloom;
${swirlGlsl}
  uniform float uSphere;
  uniform vec3 uMouse;
  uniform float uMouseActive;
  uniform float uPreReveal;
  uniform float uScale;
  uniform float uDpr;

  varying vec3 vColor;
  varying float vAlpha;

  ${curlNoiseGLSL}

  void main() {
    // Per-particle progress: speed variation with careful landing.
    float rawP = uProgress * (0.7 + speed * 0.6);
    float easeOut = 1.0 - pow(1.0 - clamp(rawP, 0.0, 1.0), 1.5 + speed * 0.8);
    float pProgress = easeOut;

    // Lerp position
    vec3 pos = mix(positionB, positionA, pProgress);

    // === IDLE FLOW (pre-reveal) ===
    float idleFactor = 1.0 - pProgress;
    if (idleFactor > 0.01) {
      vec3 bPos = positionB;
      float drift = uTime * 0.04 * (0.6 + speed * 0.4);
      float wrapWidth = 4.5;
      float wrappedX = mod(bPos.x + drift + wrapWidth * 0.5, wrapWidth) - wrapWidth * 0.5;
      float yBreath = sin(wrappedX * 2.0 + uTime * 0.12 + speed * 3.14) * 0.02;
      float yPulse = sin(uTime * 0.08 + bPos.x * 1.5) * 0.015;
      vec3 idlePos = vec3(wrappedX, bPos.y + yBreath + yPulse, bPos.z + sin(uTime * 0.1 + speed * 4.0) * 0.008);
      pos = mix(idlePos, positionA, pProgress);
    }

    // === MID-TRANSITION TURBULENCE ===
    float bell = transitionBell(pProgress);
    vec3 noiseInput = pos * 1.0 + vec3(uTime * 0.08 * speed);
    vec3 curl = curlNoise(noiseInput);
    pos += curl * 0.2 * bell;

    // === CURSOR VORTEX (only pre-reveal) ===
    if (uPreReveal > 0.5 && uMouseActive > 0.5) {
      vec3 toMouse = uMouse - pos;
      float dist = length(toMouse.xy);
      float radius = 0.5;
      if (dist < radius && dist > 0.01) {
        float influence = (1.0 - dist / radius);
        influence = influence * influence;
        vec2 perp = vec2(-toMouse.y, toMouse.x);
        vec2 swirlDir = normalize(perp);
        vec2 pullDir = normalize(toMouse.xy);
        float flingZone = 0.15;
        if (dist < flingZone) {
          float flingStrength = (1.0 - dist / flingZone) * 0.3;
          pos.xy -= pullDir * flingStrength;
        } else {
          pos.xy += swirlDir * influence * 0.08;
          pos.xy += pullDir * influence * 0.02;
        }
      }
    }

    // === DISSOLVE PHASE ===
    if (uDissolve > 0.0) {
      vec3 dissolveInput = pos * 2.5 + vec3(uTime * 0.06, uTime * 0.04, uTime * 0.03);
      vec3 dissolveCurl = curlNoise(dissolveInput);
      float twistStrength = uDissolve * 1.2;
      pos += dissolveCurl * twistStrength;
      float spreadFactor = uDissolve * 0.6;
      pos.xy += normalize(pos.xy + vec2(0.001)) * spreadFactor * (0.5 + speed * 0.5);
    }

    // === AMBIENT DRIFT MODE ===
    if (uAmbient > 0.0 && uGather <= 0.0) {
      float ambientTime = uTime * 0.02;
      vec3 ambientInput = pos * 0.8 + vec3(ambientTime, ambientTime * 0.7, ambientTime * 0.5);
      vec3 ambientCurl = curlNoise(ambientInput);
      float flowStrength = uAmbient * 0.15;
      pos += ambientCurl * flowStrength;
      float breath = sin(uTime * 0.05 + speed * 6.28) * 0.03 * uAmbient;
      pos *= 1.0 + breath;
      pos.x += sin(uTime * 0.08 + speed * 12.0) * 0.02 * uAmbient;
      pos.y += cos(uTime * 0.06 + speed * 8.0) * 0.015 * uAmbient;
    }

    // === SPHERE PHASES (new) ===
    // Phase: Gather, pull toward center
    if (uGather > 0.0) {
      float g = uGather * uGather; // ease-in
      pos = mix(pos, vec3(0.0), g * 0.85);
      // Add swirl as it gathers
      float angle = speed * 6.28 + uTime * 2.0 * g;
      float r = length(pos.xy) * (1.0 - g * 0.5);
      pos.x += cos(angle) * r * 0.1 * g;
      pos.z += sin(angle) * r * 0.1 * g;
    }

    // Phase: Condense, tight vortex at center
    if (uCondense > 0.0) {
      float swirlSpeed = 3.0 + uCondense * 5.0;
      float angle = speed * 20.0 + uTime * swirlSpeed;
      float r = 0.05 + (1.0 - uCondense) * 0.3 + sin(speed * 3.0) * 0.04;
      vec3 condensed = vec3(cos(angle) * r, sin(speed * 5.0 + uTime) * 0.1 * (1.0 - uCondense * 0.7), sin(angle) * r);
      pos = mix(pos, condensed, uCondense);
    }

    // Phase: Ring Compress, secondary ring closes inward (staggered behind condense)
    if (uRingCompress > 0.0) {
      // Affects a band of particles (speed 0.3–0.8) for a visible subset effect
      float bandMask = smoothstep(0.25, 0.45, speed) * (1.0 - smoothstep(0.7, 0.9, speed));
      float ringAngle = speed * 40.0 + uTime * (2.0 + uRingCompress * 4.0);
      float ringRadius = mix(1.2, 0.06, uRingCompress * uRingCompress);
      vec3 ringPos = vec3(
        cos(ringAngle) * ringRadius,
        sin(speed * 8.0 + uTime * 0.5) * 0.05 * (1.0 - uRingCompress),
        sin(ringAngle) * ringRadius
      );
      pos = mix(pos, ringPos, bandMask * uRingCompress * 0.7);
    }

    // Phase: Explode, burst outward
    if (uExplode > 0.0) {
      // Elastic ease-out
      float t = uExplode;
      float elastic = t < 0.001 ? 0.0 : pow(2.0, -10.0 * t) * sin((t - 0.1) * 5.0 * 3.14159) + 1.0;
      vec3 explodeDir = normalize(sphereTarget * uScale + vec3(speed * 0.5 - 0.25));
      pos = mix(pos, explodeDir * 5.0, elastic * 0.8);
    }

    // Phase: Scatter, settle into calm drift
    if (uScatter > 0.0) {
      vec3 scatterTarget = sphereTarget * uScale * 1.5;
      // Add gentle noise
      scatterTarget += vec3(
        sin(uTime * 0.3 + speed * 10.0) * 0.1,
        cos(uTime * 0.2 + speed * 7.0) * 0.1,
        sin(uTime * 0.25 + speed * 5.0) * 0.1
      );
      pos = mix(pos, scatterTarget, uScatter);
    }

    // Phase: Sphere formation, lerp to fibonacci sphere
    if (uSphere > 0.0) {
      float s = uSphere * uSphere * (3.0 - 2.0 * uSphere); // smoothstep
      pos = mix(pos, sphereTarget * uScale, s);
    }

    // Burst out of a single point (the black hole's centre) instead of out of the portrait
    pos *= uBloom;

    // === COLOR ===
    vec3 baseColor = mix(colorB, colorA, pProgress);
    float spherePhase = max(uGather, max(uCondense, max(uRingCompress, max(uExplode, max(uScatter, uSphere)))));
    // Shift toward white during sphere phases
    vec3 sphereColor = mix(vec3(0.95, 0.95, 0.95), vec3(1.0, 1.0, 1.0), speed);
    vec3 ambientColor = mix(baseColor, vec3(0.9, 0.9, 0.9), 0.15 * uAmbient);
    vColor = mix(ambientColor, sphereColor, spherePhase * 0.7);

    // === ALPHA ===
    float dissolveAlpha = 1.0 - uDissolve * 0.5;
    float ambientAlpha = mix(dissolveAlpha, 0.6, uAmbient);
    // During sphere phases, bring alpha back up
    float sphereAlpha = mix(ambientAlpha, 0.8, spherePhase);
    // SMALL_FADE: fade to invisible (crossfade with big particles)
    vAlpha = sphereAlpha * (1.0 - uSmallFade);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = swirlClip(projectionMatrix * mvPosition);
    vAlpha *= swirlFade();

    // Point size, adjust for sphere phases
    float baseSize = uPointSize * (uResolution.y / 900.0) * uDpr;
    float ambientSizeScale = mix(1.0, 0.7, uAmbient);
    float sphereSizeScale = mix(ambientSizeScale, 0.9, spherePhase);
    gl_PointSize = baseSize * sphereSizeScale * (1.0 / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));
    gl_FragColor = vec4(vColor, alpha * 0.6);
  }
`;


// ─── ParticleSystem Component ──────────────────────────────────────────────────

interface ParticleSystemProps {
  cloudA: PointCloud;
  cloudB: PointCloud;
  progressRef: React.MutableRefObject<number>;
  dissolveRef: React.MutableRefObject<number>;
  ambientRef: React.MutableRefObject<number>;
  gatherRef: React.MutableRefObject<number>;
  condenseRef: React.MutableRefObject<number>;
  ringCompressRef: React.MutableRefObject<number>;
  explodeRef: React.MutableRefObject<number>;
  smallFadeRef: React.MutableRefObject<number>;
  scatterRef: React.MutableRefObject<number>;
  sphereRef: React.MutableRefObject<number>;
  scaleRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<THREE.Vector3>;
  mouseActiveRef: React.MutableRefObject<boolean>;
  preRevealRef: React.MutableRefObject<boolean>;
  cursorNearSphereRef: React.MutableRefObject<boolean>;
  settingsRef: React.MutableRefObject<SphereSettings>;
  /** True while a project node (or its card) is hovered: the sphere must hold perfectly still. */
  holdRef: React.MutableRefObject<boolean>;
}

function ParticleSystem({
  cloudA, cloudB, progressRef, dissolveRef, ambientRef,
  gatherRef, condenseRef, ringCompressRef, explodeRef, smallFadeRef, scatterRef, sphereRef, scaleRef,
  mouseRef, mouseActiveRef, preRevealRef, cursorNearSphereRef, settingsRef, holdRef,
}: ParticleSystemProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const rotSpeedRef = useRef(-0.0015);
  /** Own elapsed clock, survives frameloop toggles (see stepTime). */
  const timeRef = useRef(0);
  const { size } = useThree();

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = cloudA.count;

    geo.setAttribute("position", new THREE.BufferAttribute(cloudB.positions, 3));
    geo.setAttribute("positionA", new THREE.BufferAttribute(cloudA.positions, 3));
    geo.setAttribute("positionB", new THREE.BufferAttribute(cloudB.positions, 3));
    geo.setAttribute("colorA", new THREE.BufferAttribute(cloudA.colors, 3));
    geo.setAttribute("colorB", new THREE.BufferAttribute(cloudB.colors, 3));

    // Per-particle speed variation
    // Seeded (not Math.random) so the render is pure and the cloud is identical every load.
    const rand = mulberry32(0x9e3779b1);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      speeds[i] = 0.3 + rand() * 1.4;
    }
    geo.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));

    // Sphere target positions (fibonacci sphere)
    const spherePositions = generateSpherePositions(count, SPHERE_RADIUS);
    geo.setAttribute("sphereTarget", new THREE.BufferAttribute(spherePositions, 3));

    return geo;
  }, [cloudA, cloudB]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPointSize: { value: 3.0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uDissolve: { value: 0 },
      uAmbient: { value: 0 },
      uGather: { value: 0 },
      uCondense: { value: 0 },
      uRingCompress: { value: 0 },
      uExplode: { value: 0 },
      uSmallFade: { value: 0 },
      uScatter: { value: 0 },
      uBloom: { value: 1 },
      ...makeSwirlUniforms(),
      uSphere: { value: 0 },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uMouseActive: { value: 0 },
      uPreReveal: { value: 1 },
      uScale: { value: 1 },
      uDpr: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    mat.uniforms.uProgress.value = progressRef.current;
    mat.uniforms.uDissolve.value = dissolveRef.current;
    mat.uniforms.uAmbient.value = ambientRef.current;
    mat.uniforms.uGather.value = gatherRef.current;
    mat.uniforms.uCondense.value = condenseRef.current;
    mat.uniforms.uRingCompress.value = ringCompressRef.current;
    mat.uniforms.uExplode.value = explodeRef.current;
    mat.uniforms.uSmallFade.value = smallFadeRef.current;
    mat.uniforms.uScatter.value = scatterRef.current;
    syncSwirl(mat.uniforms as unknown as Parameters<typeof syncSwirl>[0], size.width, size.height);
    mat.uniforms.uBloom.value = bloomValue(explodeRef.current);
    mat.uniforms.uSphere.value = sphereRef.current;
    mat.uniforms.uTime.value = timeRef.current = stepTime(timeRef.current, delta);
    mat.uniforms.uMouse.value.copy(mouseRef.current);
    mat.uniforms.uMouseActive.value = mouseActiveRef.current ? 1 : 0;
    mat.uniforms.uPreReveal.value = preRevealRef.current ? 1 : 0;
    mat.uniforms.uScale.value = scaleRef.current;
    // gl_PointSize is in device pixels: scale by DPR so particles look the same
    // size on standard and high-density screens.
    mat.uniforms.uDpr.value = state.viewport.dpr;

    // Rotate sphere (small particles), stops when cursor is near
    const group = groupRef.current;
    if (group && sphereRef.current > 0.5) {
      const targetSpeed = cursorNearSphereRef.current ? 0 : -0.0015 * settingsRef.current.spin;
      // Hovering a node stops the spin outright, not gradually, so the node stays under the cursor
      rotSpeedRef.current = holdRef.current ? 0 : THREE.MathUtils.lerp(rotSpeedRef.current, targetSpeed, 0.03);
      group.rotation.y += rotSpeedRef.current;
    } else if (group && group.rotation.y !== 0) {
      // Back at the top: the portrait must sit exactly where the headline expects it.
      // Unwind whatever spin the sphere phase accumulated (shortest way round) instead
      // of leaving the cloud turned.
      let r = group.rotation.y % (Math.PI * 2);
      if (r > Math.PI) r -= Math.PI * 2;
      else if (r < -Math.PI) r += Math.PI * 2;
      r *= Math.exp(-delta * 9);
      group.rotation.y = Math.abs(r) < 0.0004 ? 0 : r;
      rotSpeedRef.current = -0.0015;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}


// ─── Project Nodes (rendered in same canvas) ───────────────────────────────────

/** Pointer position in canvas pixels. Hover is tested in pixels, so a camera that is
 *  still easing or orbiting can't slide a node out from under a resting cursor. */
const _pointerPx = { x: 0, y: 0, valid: false };

interface ProjectNodesProps {
  sphereProgress: React.MutableRefObject<number>;
  onHover: (index: number | null, screenX: number, screenY: number) => void;
  isInteractingRef: React.MutableRefObject<boolean>;
  interactive: boolean;
  scaleRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<THREE.Vector3>;
  /** Set to true by the parent to force-dismiss hover (background click / Escape). */
  clearHoverRef: React.MutableRefObject<boolean>;
  /** Project whose card is on screen (until its exit animation ends). Other nodes can't be picked meanwhile. */
  cardIndexRef: React.MutableRefObject<number | null>;
  /** Whether the cursor is near the sphere, pauses node rotation. */
  cursorNearSphereRef: React.MutableRefObject<boolean>;
  settingsRef: React.MutableRefObject<SphereSettings>;
  /** 0 on screen -> 1 gone: nodes swell with the sphere as the section scrolls away. */
  exitRef: React.MutableRefObject<number>;
  holdRef: React.MutableRefObject<boolean>;
}

function ProjectNodes({ sphereProgress, onHover, isInteractingRef, interactive, scaleRef, mouseRef, clearHoverRef, cardIndexRef, cursorNearSphereRef, settingsRef, exitRef, holdRef }: ProjectNodesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodePositions = useMemo(() => getNodePositions(projects.length, SPHERE_RADIUS + 0.15), []);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const detectedIndex = useRef<number | null>(null);
  /** Node the cursor is sitting on but whose card was explicitly dismissed. */
  const suppressedIndex = useRef<number | null>(null);
  const { camera, size } = useThree();
  // Smooth rotation speed that lerps to 0 on hover
  const rotSpeedRef = useRef(0.002);

  useFrame(() => {
    if (!groupRef.current) return;
    const show = sphereProgress.current > 0.7;

    // External dismiss request (background click / Escape): drop hover immediately and
    // suppress the node under the cursor so the card doesn't instantly re-open.
    if (clearHoverRef.current) {
      clearHoverRef.current = false;
      suppressedIndex.current = detectedIndex.current;
      detectedIndex.current = null;
      setHoveredIndex(null);
      document.body.style.cursor = "auto";
    }

    // Rotation: opposite direction from sphere, stops on hover, drag, or cursor proximity
    const targetSpeed = (hoveredIndex !== null || isInteractingRef.current || cursorNearSphereRef.current) ? 0 : 0.003 * settingsRef.current.spin;
    // A hovered node (or its card) freezes the nodes outright: easing out would let the
    // node slide from under the cursor and drop the hover.
    rotSpeedRef.current = holdRef.current ? 0 : THREE.MathUtils.lerp(rotSpeedRef.current, targetSpeed, 0.03);

    if (sphereProgress.current > 0.5) {
      groupRef.current.rotation.y += rotSpeedRef.current;
    }

    // Apply sphere scale from slider
    const s = scaleRef.current * (1 + exitRef.current * exitRef.current * 0.9);
    groupRef.current.scale.setScalar(s);

    // Manual hover detection, compare in screen pixels for reliability
    if (interactive && sphereProgress.current > 0.7) {
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      
      // If mouse left the window, clear hover
      if (!_pointerPx.valid || Math.abs(mouseX) > 50 || Math.abs(mouseY) > 50) {
        suppressedIndex.current = null;
        if (detectedIndex.current !== null) {
          detectedIndex.current = null;
          document.body.style.cursor = "auto";
          onHover(null, 0, 0);
          setTimeout(() => setHoveredIndex(null), 300);
        }
      } else {
        const mousePxX = _pointerPx.x;
        const mousePxY = _pointerPx.y;

        let closestIdx: number | null = null;
        let closestDist = 60; // threshold in pixels

        groupRef.current.children.forEach((child, i) => {
          if (!(child instanceof THREE.Group)) return;
          child.getWorldPosition(_v2);
          const projected = _v3.copy(_v2).project(camera);
          const nodePxX = ((projected.x + 1) / 2) * size.width;
          const nodePxY = ((1 - projected.y) / 2) * size.height;
          const dx = nodePxX - mousePxX;
          const dy = nodePxY - mousePxY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }
        });

        // While a card is up, a node that happens to sit behind it can't take over: the
        // cursor has to leave, and the card has to be gone, before another node is picked.
        if (closestIdx !== null && cardIndexRef.current !== null && closestIdx !== cardIndexRef.current) {
          closestIdx = null;
        }

        // A dismissed node stays dismissed until the cursor moves off it
        if (suppressedIndex.current !== null) {
          if (closestIdx === suppressedIndex.current) {
            closestIdx = null;
          } else {
            suppressedIndex.current = null;
          }
        }

        if (closestIdx !== detectedIndex.current) {
          detectedIndex.current = closestIdx;
          if (closestIdx !== null) {
            setHoveredIndex(closestIdx);
            document.body.style.cursor = "pointer";
            const nodeGroup = groupRef.current.children[closestIdx];
            if (nodeGroup) {
              nodeGroup.getWorldPosition(_v4);
              _v4.project(camera);
              const screenX = ((_v4.x + 1) / 2) * size.width;
              const screenY = ((1 - _v4.y) / 2) * size.height;
              onHover(closestIdx, screenX, screenY);
            }
          } else {
            document.body.style.cursor = "auto";
            onHover(null, 0, 0);
            setTimeout(() => setHoveredIndex(null), 300);
          }
        }
      }
    } else if (detectedIndex.current !== null) {
      // The sphere stopped being interactive (scrolled away / dissolving) while a node
      // was hovered. Clear it, or the position-update block below keeps re-opening the
      // card every frame even though nothing can be hovered any more.
      detectedIndex.current = null;
      suppressedIndex.current = null;
      document.body.style.cursor = "auto";
      onHover(null, 0, 0);
      setHoveredIndex(null);
    }

    // Fade in/out + hover effects
    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Group)) return;
      const targetOpacity = show ? 0.9 : 0;
      const isHovered = hoveredIndex === i;
      const dimmed = hoveredIndex !== null && !isHovered;

      // Get project color for this node
      const projectColor = projects[i]?.identityGradient[0] || "#ffffff";

      child.children.forEach((mesh) => {
        if (mesh instanceof THREE.Mesh) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const finalOpacity = dimmed ? targetOpacity * 0.3 : targetOpacity;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, finalOpacity, 0.08);

          // Color: hovered node turns its project color, others stay white
          if (isHovered) {
            _nodeColor.set(projectColor);
          } else {
            _nodeColor.set("#ffffff");
          }
          mat.color.lerp(_nodeColor, 0.1);
        }
      });

      // Scale up hovered node
      const targetScale = isHovered ? 1.8 : 1;
      child.scale.setScalar(THREE.MathUtils.lerp(child.scale.x, targetScale, 0.1));
    });

    // Update card position while the cursor is STILL on the node.
    // Must key off detectedIndex (not the delayed `hoveredIndex` state), otherwise
    // this keeps firing onHover(index) after hover-out and cancels the dismiss timer,
    // which leaves the card stuck on screen forever.
    if (detectedIndex.current !== null && groupRef.current) {
      const nodeGroup = groupRef.current.children[detectedIndex.current];
      if (nodeGroup) {
        nodeGroup.getWorldPosition(_v4);
        _v4.project(camera);
        const screenX = ((_v4.x + 1) / 2) * size.width;
        const screenY = ((1 - _v4.y) / 2) * size.height;
        onHover(detectedIndex.current, screenX, screenY);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {nodePositions.map((pos, i) => (
        <group
          key={projects[i]?.slug || i}
          position={pos}
        >
          {/* Invisible hitbox for raycasting (prevents flicker from overlapping visual meshes) */}
          <mesh visible={false}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial />
          </mesh>
          {/* Core orb, white */}
          <mesh raycast={() => null}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial
              color="#ffffff"
              toneMapped={false}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Outer glow shell, soft white */}
          <mesh raycast={() => null}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshBasicMaterial
              color="#e0e0e0"
              toneMapped={false}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Morph Easing ──────────────────────────────────────────────────────────────

function morphEasing(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const p1 = 0.25;
  const p2 = 0.75;
  const v1 = 0.08;
  const v2 = 0.92;
  if (t < p1) {
    const local = t / p1;
    return v1 * Math.pow(local, 2.5);
  } else if (t < p2) {
    const local = (t - p1) / (p2 - p1);
    const smooth = local * local * (3 - 2 * local);
    return v1 + (v2 - v1) * smooth;
  } else {
    const local = (t - p2) / (1 - p2);
    return v2 + (1 - v2) * (1 - Math.pow(1 - local, 3));
  }
}

// ─── TweenDriver ───────────────────────────────────────────────────────────────

function TweenDriver({
  progressRef,
  triggered,
  instant = false,
  onComplete,
}: {
  progressRef: React.MutableRefObject<number>;
  triggered: boolean;
  instant?: boolean;
  onComplete: () => void;
}) {
  const completedRef = useRef(false);
  const elapsedRef = useRef(0);

  useFrame((state, delta) => {
    if (!triggered || completedRef.current) return;
    if (instant) {
      progressRef.current = 1;
      completedRef.current = true;
      onComplete();
      return;
    }
    // Delta-accumulated, NOT state.clock.elapsedTime: a frameloop toggle resets that
    // clock to 0, which would stall the reveal, and the reveal is what unlocks scroll.
    elapsedRef.current = stepTime(elapsedRef.current, delta);
    const duration = 4.5;
    const linearT = Math.min(1, elapsedRef.current / duration);
    progressRef.current = morphEasing(linearT);
    if (linearT >= 1) {
      progressRef.current = 1;
      completedRef.current = true;
      onComplete();
    }
  });

  return null;
}

// ─── Camera Adjust ─────────────────────────────────────────────────────────────

/** three.js cameras are mutable by design; these helpers keep that out of render scope. */
function setCameraZ(camera: THREE.Camera, z: number) {
  camera.position.z = z;
}

/** Eases an off-axis camera (left there by dragging) back onto the z axis. */
function easeCameraToAxis(camera: THREE.Camera, delta: number) {
  if (camera.position.x === 0 && camera.position.y === 0) return;
  const k = 1 - Math.exp(-delta * 8);
  camera.position.x += (0 - camera.position.x) * k;
  camera.position.y += (0 - camera.position.y) * k;
  if (Math.abs(camera.position.x) < 0.001) camera.position.x = 0;
  if (Math.abs(camera.position.y) < 0.001) camera.position.y = 0;
  camera.lookAt(0, 0, 0);
}

function CameraAdjust({ sphereProgress, sphereInteractive }: { sphereProgress: React.MutableRefObject<number>; sphereInteractive: boolean }) {
  const { camera, size } = useThree();
  /** Camera depth at the hero (depends on the viewport's aspect ratio). */
  const baseZRef = useRef(1.6);

  useEffect(() => {
    const aspect = size.width / size.height;
    const baseZ = 1.6;
    const adjustedZ = aspect < 1
      ? baseZ + (1 - aspect) * 0.5
      : baseZ - (aspect - 1) * 0.08;
    baseZRef.current = Math.max(1.2, Math.min(2.2, adjustedZ));
    // A canvas that mounts while the sphere is already formed (Refresh) starts
    // pulled back; otherwise it would open inside the sphere.
    setCameraZ(camera, sphereProgress.current > 0.9 || sphereInteractive ? 7 : baseZRef.current);
    camera.updateProjectionMatrix();
  }, [camera, size, sphereInteractive, sphereProgress]);

  // Zoom out as the sphere forms; once it is interactive DragRotate owns the camera.
  useFrame((_, delta) => {
    if (sphereInteractive) return;
    const sp = sphereProgress.current;
    // Always (also at sp = 0), so the camera lands on the hero's exact depth rather
    // than wherever the last non-zero frame left it.
    setCameraZ(camera, THREE.MathUtils.lerp(baseZRef.current, 7, sp * sp));
    // Dragging the sphere moved the camera off-axis; bring it back so the portrait
    // lines up with the headline again.
    easeCameraToAxis(camera, delta);
  });

  return null;
}

/** Mirrors "a node or its card is hovered" into one ref every rotating layer reads. */
function HoldSync({
  holdRef,
  nodeHoveredRef,
  cardHoveredRef,
}: {
  holdRef: React.MutableRefObject<boolean>;
  nodeHoveredRef: React.MutableRefObject<number | null>;
  cardHoveredRef: React.MutableRefObject<boolean>;
}) {
  useFrame(() => {
    holdRef.current = nodeHoveredRef.current !== null || cardHoveredRef.current;
  });
  return null;
}

// ─── Cursor Proximity Detection ────────────────────────────────────────────────

function CursorProximity({
  mouseRef,
  cursorNearSphereRef,
  sphereInteractive,
}: {
  mouseRef: React.MutableRefObject<THREE.Vector3>;
  cursorNearSphereRef: React.MutableRefObject<boolean>;
  sphereInteractive: boolean;
}) {
  useFrame(() => {
    if (!sphereInteractive) {
      cursorNearSphereRef.current = false;
      return;
    }
    // Check if cursor (in world space) is within proximity of sphere center (0,0,0)
    const dist = Math.sqrt(mouseRef.current.x ** 2 + mouseRef.current.y ** 2);
    // Sphere radius is ~2.2, detect when cursor is within ~4 units (generous zone)
    cursorNearSphereRef.current = dist < 4.0;
  });

  return null;
}

// ─── Mouse Tracker ─────────────────────────────────────────────────────────────

function MouseTracker({
  mouseRef,
  mouseActiveRef,
}: {
  mouseRef: React.MutableRefObject<THREE.Vector3>;
  mouseActiveRef: React.MutableRefObject<boolean>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const canvas = document.querySelector("#hero-particle-canvas") as HTMLElement;
    if (!canvas) return;

    function screenToWorld(clientX: number, clientY: number, out: THREE.Vector3): THREE.Vector3 {
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      _v1.set(ndcX, ndcY, 0.5).unproject(camera);
      const dir = _v1.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      return out.copy(camera.position).add(dir.multiplyScalar(dist));
    }

    // Pointer events cover mouse, pen AND touch, so project nodes can be tapped
    // on phones (the old mouse-only listeners made the sphere unusable there).
    function onPointerMove(e: PointerEvent) {
      screenToWorld(e.clientX, e.clientY, _v2);
      mouseRef.current.set(_v2.x, _v2.y, 0);
      mouseActiveRef.current = true;
      const r = canvas.getBoundingClientRect();
      _pointerPx.x = e.clientX - r.left;
      _pointerPx.y = e.clientY - r.top;
      _pointerPx.valid = true;
    }

    function onPointerLeave() {
      mouseActiveRef.current = false;
      mouseRef.current.set(999, 999, 0);
      _pointerPx.valid = false;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [camera, mouseRef, mouseActiveRef]);

  return null;
}


// ─── Drag-to-Rotate (no scroll interception) ──────────────────────────────────

function DragRotate({ isInteractingRef }: { isInteractingRef: React.MutableRefObject<boolean> }) {
  const { camera } = useThree();
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const spherical = useRef(new THREE.Spherical().setFromVector3(camera.position));
  const targetSpherical = useRef(new THREE.Spherical().setFromVector3(camera.position));

  useEffect(() => {
    spherical.current.setFromVector3(camera.position);
    targetSpherical.current.copy(spherical.current);
  }, [camera]);

  useEffect(() => {
    // Listen on window, the canvas has pointerEvents:none so we use window.
    // Pointer events (not mouse events) so touch drags rotate the sphere too.
    let releaseTimer: ReturnType<typeof setTimeout> | null = null;
    function onMouseDown(e: PointerEvent) {
      if (e.button !== 0) return;
      if (releaseTimer) { clearTimeout(releaseTimer); releaseTimer = null; }
      isDragging.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      isInteractingRef.current = true;
    }

    function onMouseMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      prevMouse.current = { x: e.clientX, y: e.clientY };

      const rotateSpeed = 0.005;
      targetSpherical.current.theta -= dx * rotateSpeed;
      targetSpherical.current.phi -= dy * rotateSpeed;
      targetSpherical.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, targetSpherical.current.phi));
    }

    function onMouseUp() {
      isDragging.current = false;
      if (releaseTimer) clearTimeout(releaseTimer);
      releaseTimer = setTimeout(() => { isInteractingRef.current = false; }, 2000);
    }

    window.addEventListener("pointerdown", onMouseDown);
    window.addEventListener("pointermove", onMouseMove);
    window.addEventListener("pointerup", onMouseUp);
    window.addEventListener("pointercancel", onMouseUp);

    return () => {
      if (releaseTimer) clearTimeout(releaseTimer);
      isInteractingRef.current = false;
      window.removeEventListener("pointerdown", onMouseDown);
      window.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("pointerup", onMouseUp);
      window.removeEventListener("pointercancel", onMouseUp);
    };
  }, [camera, isInteractingRef]);

  // Damped rotation update
  useFrame(() => {
    const dampFactor = 0.08;
    spherical.current.theta += (targetSpherical.current.theta - spherical.current.theta) * dampFactor;
    spherical.current.phi += (targetSpherical.current.phi - spherical.current.phi) * dampFactor;
    spherical.current.radius = targetSpherical.current.radius;

    camera.position.setFromSpherical(spherical.current);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface HeroParticleCanvasProps {
  cloudA: PointCloud;
  cloudB: PointCloud;
  revealTriggered: boolean;
  /** Skip the 4.5 s build-up and show the finished scene (used when the intro is skipped). */
  instantReveal?: boolean;
  onRevealComplete?: () => void;
  /** Max device-pixel-ratio the canvas may render at (lower = cheaper). */
  maxDpr?: number;
  /** Called if the GPU context is lost and doesn't come back, caller should fall back to the static page. */
  onFatalError?: () => void;
}

export function HeroParticleCanvas({
  cloudA,
  cloudB,
  revealTriggered,
  instantReveal = false,
  onRevealComplete,
  maxDpr = 1.75,
  onFatalError,
}: HeroParticleCanvasProps) {
  // Hero passes a lower DPR cap on weak devices; reuse that as the "go lighter" signal
  const lowPower = maxDpr <= 1;
  const adaptiveDpr = useAdaptiveDpr(maxDpr);
  const progressRef = useRef(0);
  const dissolveRef = useRef(0);
  const ambientRef = useRef(0);
  const gatherRef = useRef(0);
  const condenseRef = useRef(0);
  const ringCompressRef = useRef(0);
  const explodeRef = useRef(0);
  const smallFadeRef = useRef(0);
  const scatterRef = useRef(0);
  const sphereRef = useRef(0);
  const bigAlphaRef = useRef(0);
  const tintColorRef = useRef<string | null>(null);
  const isInteractingRef = useRef(false);
  const sphereScaleRef = useRef(1);
  const particleSizeRef = useRef(1);
  /** Background particles: fade-in level, and how far the scene has scrolled away. */
  const backdropAlphaRef = useRef(0);
  const exitRef = useRef(0);

  // ── Visitor customization (saved) + a remount key for the Refresh button ──
  const [settings, setSettings] = useState<SphereSettings>(() => loadSphereSettings());
  const settingsRef = useRef(settings);
  /** Rotation hold: a node or its card is hovered. */
  const holdRotationRef = useRef(false);
  const [canvasKey, setCanvasKey] = useState(0);
  /** Which canvas generation is live. A discarded canvas reports a lost WebGL context
   *  while it is torn down; that must not be mistaken for a GPU failure. */
  const canvasGenRef = useRef(0);
  useEffect(() => {
    return () => {
      canvasGenRef.current = -1;
    };
  }, []);
  const mouseRef = useRef(new THREE.Vector3(999, 999, 0));
  const mouseActiveRef = useRef(false);
  const preRevealRef = useRef(true);

  useEffect(() => {
    settingsRef.current = settings;
    sphereScaleRef.current = settings.scale;
    particleSizeRef.current = settings.size;
    saveSphereSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<SphereSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);
  const resetSettings = useCallback(() => setSettings(DEFAULT_SPHERE_SETTINGS), []);

  // ── Sphere hand-off: fade out + freeze once the Projects section scrolls away ──
  const wrapperRef = useRef<HTMLDivElement>(null);
  const projectsElRef = useRef<HTMLElement | null>(null);
  /** true = render loop stopped, canvas hidden (Skills / Activity / Resume / Footer) */
  const [frozen, setFrozen] = useState(false);
  const frozenRef = useRef(false);
  /** Latest card teardown fn, called when the sphere zone is left. */
  const closeCardRef = useRef<(() => void) | null>(null);
  const cursorNearSphereRef = useRef(false);

  // Sphere interactivity state
  const [sphereInteractive, setSphereInteractive] = useState(false);
  const [cardState, setCardState] = useState<{
    projectIndex: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  const { scrollProgress } = useSnapScroll();
  /** Latest scroll value for the rAF loops below, reading it from a ref means those
   *  loops no longer tear down and re-register on every scroll tick. */
  const scrollRef = useRef(scrollProgress);
  const lastSyncRef = useRef(0);
  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  // Virtual scroll, only enabled after portrait reveal completes (prevents blocking hero scroll)
  const [revealDone, setRevealDone] = useState(false);
  const virtualScroll = useVirtualScroll(revealDone);

  // Force all phase refs to 0 on mount, prevents stale state from scroll restoration
  useEffect(() => {
    progressRef.current = 0;
    dissolveRef.current = 0;
    ambientRef.current = 0;
    gatherRef.current = 0;
    condenseRef.current = 0;
    explodeRef.current = 0;
    scatterRef.current = 0;
    sphereRef.current = 0;
    preRevealRef.current = true;
  }, []);

  // Track pre-reveal state
  useEffect(() => {
    if (revealTriggered) {
      const timer = setTimeout(() => {
        preRevealRef.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [revealTriggered]);

  // Scroll-linked: DISSOLVE + AMBIENT only (pre-lock zone, driven by raw scroll)
  useEffect(() => {
    if (progressRef.current < 0.95) {
      // Not yet revealed, no phases
      dissolveRef.current = 0;
      ambientRef.current = 0;
      return;
    }

    const sp = scrollProgress;

    if (sp < SP.DISSOLVE_START) {
      dissolveRef.current = 0;
      ambientRef.current = 0;
    } else if (sp < SP.DISSOLVE_END) {
      const t = mapRange(sp, SP.DISSOLVE_START, SP.DISSOLVE_END);
      dissolveRef.current = Math.min(1, t * 2.5);
      ambientRef.current = t * 0.3;
    } else if (sp < LOCK_TRIGGER) {
      // Ambient drift, living background before lock zone
      dissolveRef.current = 1;
      ambientRef.current = Math.min(1, 0.3 + (sp - SP.DISSOLVE_END) * 0.5);
    } else {
      // In or past lock zone, keep dissolve/ambient at max
      dissolveRef.current = 1;
      ambientRef.current = 1;
    }
  }, [scrollProgress]);

  // Virtual-scroll-driven phases: GATHER → CONDENSE → EXPLODE → SMALL_FADE
  // These are updated by the useVirtualScroll hook directly via refs.
  // We just need to sync them into the refs that the ParticleSystem reads.
  useEffect(() => {
    // RAF loop to continuously sync virtual scroll refs → particle system refs
    let rafId: number;
    function sync() {
      gatherRef.current = virtualScroll.gatherRef.current;
      condenseRef.current = virtualScroll.condenseRef.current;
      ringCompressRef.current = virtualScroll.ringCompressRef.current;
      explodeRef.current = virtualScroll.explodeRef.current;
      smallFadeRef.current = virtualScroll.smallFadeRef.current;

      // Big particles fade in as small particles fade out (crossfade)
      bigAlphaRef.current = virtualScroll.smallFadeRef.current;
      // Background particles arrive with the sphere
      backdropAlphaRef.current = virtualScroll.smallFadeRef.current;

      // SPHERE_FORM: after lock releases (smallFade = 1), drive from continued scroll
      // Map scroll past the lock-trigger point → sphere formation
      // Use scatterRef as the "big particles appear" signal and sphereRef for formation
      // Targets for the big-particle phases. They are eased toward (not assigned) so
      // any jump in the target, releasing the interactive hold, a fast flick back up,
      // the rewind starting, glides instead of snapping.
      let scatterTarget = 0;
      let sphereTarget = 0;
      if (virtualScroll.smallFadeRef.current >= 1) {
        const postLockScroll = scrollRef.current - LOCK_TRIGGER;
        if (sphereInteractive && postLockScroll > 1.0) {
          // Sphere is formed and being explored: hold it so OrbitControls rotation and
          // zoom aren't fought by small scroll changes. Released once the user scrolls
          // clearly back up, so the sphere can dissolve on the way to the top.
          scatterTarget = 1;
          sphereTarget = 1;
        } else {
          // Give 0.5 scroll-pages for scatter to settle, then 1.0 for sphere formation
          scatterTarget = Math.min(1, Math.max(0, postLockScroll / 0.5));
          sphereTarget = Math.min(1, Math.max(0, (postLockScroll - 0.5) / 1.0));
        }
      }
      const now = performance.now();
      const dt = Math.min(64, now - lastSyncRef.current || 16);
      lastSyncRef.current = now;
      const k = 1 - Math.exp(-dt / 140);
      scatterRef.current += (scatterTarget - scatterRef.current) * k;
      sphereRef.current += (sphereTarget - sphereRef.current) * k;
      if (Math.abs(scatterTarget - scatterRef.current) < 0.002) scatterRef.current = scatterTarget;
      if (Math.abs(sphereTarget - sphereRef.current) < 0.002) sphereRef.current = sphereTarget;

      // ── Hand-off: fade the whole canvas out once the Projects section scrolls
      // past the viewport, then stop the render loop entirely. Reverses on scroll-up.
      // Never runs before the hero reveal finishes, the reveal is what unlocks scroll.
      const projectsEl = revealDone
        ? (projectsElRef.current ?? (projectsElRef.current = document.getElementById("projects")))
        : null;
      if (projectsEl) {
        const vh = window.innerHeight;
        // How far the section's bottom edge has travelled above the viewport bottom
        const past = vh - projectsEl.getBoundingClientRect().bottom;
        const fadeSpan = vh * 0.6;
        const hidden = Math.max(0, Math.min(1, past / fadeSpan));

        // The scene hands over as motion first (particles streak away, sphere swells,
        // see `exitRef`), and only fades once that is under way.
        exitRef.current = hidden;
        const fade = Math.max(0, Math.min(1, (hidden - 0.35) / 0.65));
        if (wrapperRef.current) {
          wrapperRef.current.style.opacity = String(1 - fade);
          wrapperRef.current.style.visibility = hidden >= 1 ? "hidden" : "visible";
        }

        if ((hidden >= 1) !== frozenRef.current) {
          frozenRef.current = hidden >= 1;
          setFrozen(frozenRef.current);
          if (frozenRef.current) {
            // Leaving the sphere zone, drop any open card and release the cursor
            closeCardRef.current?.();
            document.body.style.cursor = "auto";
          }
        }
      }

      rafId = requestAnimationFrame(sync);
    }
    rafId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(rafId);
  }, [virtualScroll, sphereInteractive, revealDone]);

  const handleComplete = useCallback(() => {
    preRevealRef.current = false;
    setRevealDone(true);
    onRevealComplete?.();
  }, [onRevealComplete]);

  // Track when sphere becomes interactive (sphere formed + post-lock)
  useEffect(() => {
    let rafId: number;
    let last = false;
    function check() {
      const isFormed = sphereRef.current > 0.9;
      const isPostLock = virtualScroll.smallFadeRef.current >= 1;
      const next = isFormed && isPostLock && !frozenRef.current;
      if (next !== last) {
        last = next;
        setSphereInteractive(next);
        if (!next) {
          // Sphere dissolved (scrolling back up), a project card has nothing to
          // point at any more, so drop it and release the pointer cursor.
          closeCardRef.current?.();
          document.body.style.cursor = "auto";
        }
      }
      rafId = requestAnimationFrame(check);
    }
    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, [virtualScroll.smallFadeRef]);

  // Handle node hover
  const setHoveredIndex = useSphereHoverStore((s) => s.setHoveredIndex);
  const cardDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Cursor is over the card itself, keeps it alive while the user reaches for the link. */
  const cardHoveredRef = useRef(false);
  /** Node currently under the cursor (null = none). */
  const nodeHoveredRef = useRef<number | null>(null);
  /** Project whose card is showing; cleared once the card's exit animation has finished. */
  const cardIndexRef = useRef<number | null>(null);
  /** Flag read by ProjectNodes to force-drop its hover state. */
  const clearNodeHoverRef = useRef(false);
  /** Where the last pointerdown landed, used to tell a click apart from a drag. */
  const pointerDownRef = useRef({ x: 0, y: 0 });

  const cancelDismiss = useCallback(() => {
    if (cardDismissTimer.current) {
      clearTimeout(cardDismissTimer.current);
      cardDismissTimer.current = null;
    }
  }, []);

  /** Immediate teardown of the card. */
  const closeCard = useCallback(() => {
    cancelDismiss();
    cardHoveredRef.current = false;
    nodeHoveredRef.current = null;
    setCardState(null);
    tintColorRef.current = null;
    setHoveredIndex(null);
    // Safety net in case the exit animation never reports back.
    setTimeout(() => { if (nodeHoveredRef.current === null) cardIndexRef.current = null; }, 700);
  }, [cancelDismiss, setHoveredIndex]);

  /**
   * Rebuilds the WebGL scene from scratch (new renderer, fresh geometry). Scroll
   * position and sphere phase live outside the canvas, so the visitor lands back on
   * the same sphere, just without whatever got stuck.
   */
  const refreshScene = useCallback(() => {
    closeCard();
    clearNodeHoverRef.current = true;
    isInteractingRef.current = false;
    document.body.style.cursor = "auto";
    canvasGenRef.current += 1;
    setCanvasKey(canvasGenRef.current);
  }, [closeCard]);

  /** Grace period so moving cursor node → card doesn't kill the card. */
  const scheduleDismiss = useCallback(() => {
    if (cardDismissTimer.current) return;
    cardDismissTimer.current = setTimeout(() => {
      cardDismissTimer.current = null;
      // Re-check: user may have landed on the card or another node in the meantime
      if (cardHoveredRef.current || nodeHoveredRef.current !== null) return;
      setCardState(null);
      tintColorRef.current = null;
      setHoveredIndex(null);
      setTimeout(() => { if (nodeHoveredRef.current === null) cardIndexRef.current = null; }, 700);
    }, 300);
  }, [setHoveredIndex]);

  const handleNodeHover = useCallback((index: number | null, screenX: number, screenY: number) => {
    if (index === null) {
      nodeHoveredRef.current = null;
      if (!cardHoveredRef.current) scheduleDismiss();
      return;
    }

    nodeHoveredRef.current = index;
    cardIndexRef.current = index;
    cancelDismiss();
    // Only re-render when the target or its screen position actually changed
    setCardState((prev) => {
      if (
        prev &&
        prev.projectIndex === index &&
        Math.abs(prev.screenX - screenX) < 0.5 &&
        Math.abs(prev.screenY - screenY) < 0.5
      ) {
        return prev;
      }
      return { projectIndex: index, screenX, screenY };
    });
    setHoveredIndex(index);
    const project = projects[index];
    if (project) {
      tintColorRef.current = project.identityGradient[0];
    }
  }, [cancelDismiss, scheduleDismiss, setHoveredIndex]);

  // Dismiss on background click (a click, not a sphere drag) and on Escape
  const cardVisible = cardState !== null;
  useEffect(() => {
    if (!cardVisible) return;

    function onPointerDown(e: PointerEvent) {
      pointerDownRef.current = { x: e.clientX, y: e.clientY };
    }

    function onPointerUp(e: PointerEvent) {
      // Ignore drags, rotating the sphere shouldn't close the card
      const moved = Math.hypot(
        e.clientX - pointerDownRef.current.x,
        e.clientY - pointerDownRef.current.y,
      );
      if (moved > 6) return;
      // A tap on a project node (touch) is the "open" gesture, don't dismiss it.
      if (e.pointerType === "touch" && nodeHoveredRef.current !== null) return;
      // Clicks inside the card belong to the card
      const target = e.target;
      if (target instanceof Element && target.closest("[data-project-node-card]")) return;
      clearNodeHoverRef.current = true;
      closeCard();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      clearNodeHoverRef.current = true;
      closeCard();
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [cardVisible, closeCard]);

  // Clean up the pending dismiss timer on unmount
  useEffect(() => () => cancelDismiss(), [cancelDismiss]);

  // Expose the teardown to the scroll loop (used when the sphere zone is left)
  useEffect(() => {
    closeCardRef.current = closeCard;
  }, [closeCard]);

  return (
    <div
      id="hero-particle-canvas"
      ref={wrapperRef}
      className="fixed inset-0 z-[1]"
      style={{
        // Must stay "none": this is a fixed, full-viewport layer, so its scroll chain is
        // the document (overflow:hidden) rather than the SmoothScroll container, making it
        // hit-testable swallows the wheel and scrolling dies. Hover/drag are handled by
        // window listeners, and the project card re-enables pointer events on itself.
        pointerEvents: "none",
        transition: "opacity 0.15s linear",
      }}
    >
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 0, 1.6], fov: 60 }}
        dpr={adaptiveDpr.dpr}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        frameloop={frozen ? "never" : "always"}
        onCreated={({ gl }) => {
          // If the GPU drops the context (tab backgrounded on mobile, driver reset),
          // allow the browser to restore it; if it never comes back, fall back to the
          // static page instead of leaving a black hole where the hero was.
          const el = gl.domElement;
          const generation = canvasGenRef.current;
          let timer: ReturnType<typeof setTimeout> | null = null;
          el.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            // Lost because this canvas was replaced (Refresh) or unmounted: expected.
            if (canvasGenRef.current !== generation) return;
            timer = setTimeout(() => {
              if (canvasGenRef.current === generation) onFatalError?.();
            }, 4000);
          });
          el.addEventListener("webglcontextrestored", () => {
            if (timer) clearTimeout(timer);
          });
        }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <CameraAdjust sphereProgress={sphereRef} sphereInteractive={sphereInteractive} />
        <HoldSync holdRef={holdRotationRef} nodeHoveredRef={nodeHoveredRef} cardHoveredRef={cardHoveredRef} />
        <MouseTracker mouseRef={mouseRef} mouseActiveRef={mouseActiveRef} />
        <CursorProximity mouseRef={mouseRef} cursorNearSphereRef={cursorNearSphereRef} sphereInteractive={sphereInteractive} />
        <ParticleSystem
          cloudA={cloudA}
          cloudB={cloudB}
          progressRef={progressRef}
          dissolveRef={dissolveRef}
          ambientRef={ambientRef}
          gatherRef={gatherRef}
          condenseRef={condenseRef}
          ringCompressRef={ringCompressRef}
          explodeRef={explodeRef}
          smallFadeRef={smallFadeRef}
          scatterRef={scatterRef}
          sphereRef={sphereRef}
          scaleRef={sphereScaleRef}
          mouseRef={mouseRef}
          mouseActiveRef={mouseActiveRef}
          preRevealRef={preRevealRef}
          cursorNearSphereRef={cursorNearSphereRef}
          settingsRef={settingsRef}
          holdRef={holdRotationRef}
        />
        <BackdropParticles
          alphaRef={backdropAlphaRef}
          exitRef={exitRef}
          settingsRef={settingsRef}
          lowPower={lowPower}
        />
        <ProjectNodes
          sphereProgress={sphereRef}
          onHover={handleNodeHover}
          isInteractingRef={isInteractingRef}
          interactive={sphereInteractive}
          scaleRef={sphereScaleRef}
          mouseRef={mouseRef}
          clearHoverRef={clearNodeHoverRef}
          cardIndexRef={cardIndexRef}
          cursorNearSphereRef={cursorNearSphereRef}
          settingsRef={settingsRef}
          exitRef={exitRef}
          holdRef={holdRotationRef}
        />
        <BigParticles
          alphaRef={bigAlphaRef}
          sphereFormRef={sphereRef}
          tintColorRef={tintColorRef}
          sizeRef={particleSizeRef}
          scaleRef={sphereScaleRef}
          cursorNearSphereRef={cursorNearSphereRef}
          settingsRef={settingsRef}
          exitRef={exitRef}
          holdRef={holdRotationRef}
        />
        <AdaptiveDpr dpr={adaptiveDpr.dpr} onSlow={adaptiveDpr.stepDown} />
        <TweenDriver
          progressRef={progressRef}
          triggered={revealTriggered}
          instant={instantReveal}
          onComplete={handleComplete}
        />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.2 * settings.glow}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
        {/* Custom drag-to-rotate, doesn't intercept scroll events */}
        {sphereInteractive && (
          <DragRotate
            isInteractingRef={isInteractingRef}
          />
        )}
      </Canvas>

      {/* Words and controls around the sphere */}
      <SphereOverlay
        visible={sphereInteractive && !frozen}
        settings={settings}
        onChange={updateSettings}
        onReset={resetSettings}
        onRefresh={refreshScene}
      />

      {/* HTML overlay for project node card */}
      <AnimatePresence onExitComplete={() => { cardIndexRef.current = null; }}>
        {cardState && (
          <ProjectNodeCard
            key="project-node-card"
            project={projects[cardState.projectIndex]!}
            screenX={cardState.screenX}
            screenY={cardState.screenY}
            onPointerEnter={() => {
              cardHoveredRef.current = true;
              cancelDismiss();
            }}
            onPointerLeave={() => {
              cardHoveredRef.current = false;
              if (nodeHoveredRef.current === null) scheduleDismiss();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
