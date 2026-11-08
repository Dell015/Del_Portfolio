"use client";

import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, useAdaptiveDpr } from "@/components/perf/AdaptiveDpr";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { PointCloud } from "@/lib/particles/sampleImageToPoints";
import { curlNoiseGLSL } from "@/lib/particles/curlNoise";
import { navTransit, useSnapScroll } from "@/components/SmoothScroll";
import { useVirtualScroll, LOCK_TRIGGER } from "@/lib/hooks/useVirtualScroll";
import { projects } from "@/lib/content/projects";
import { BackdropParticles } from "./BackdropParticles";
import { bloomValue, makeSwirlUniforms, swirlGlsl, syncSwirl } from "@/lib/swirl";
import { DEFAULT_SPHERE_SETTINGS, type SphereSettings } from "@/lib/sphere/settings";
import { partsFor } from "@/lib/content/planets";
import {
  SolarSystem,
  SystemCamera,
  createSystemScreen,
  type SystemScreen,
  type SystemSelection,
} from "@/components/projects/system/SolarSystem";
import { SystemOverlay } from "@/components/projects/system/SystemOverlay";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPHERE_RADIUS = 2.2;
// Scratch vectors, reused every frame, allocating per node per frame in the
// hover/projection code produced constant GC pressure (visible as micro-stutter).
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

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


/** Pointer position in canvas pixels (written by MouseTracker). */
const _pointerPx = { x: 0, y: 0, valid: false, touch: false, tap: false };

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
    let tapDown: { x: number; y: number } | null = null;
    const isUi = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("a, button, input, textarea, [data-project-node-card], [data-sphere-ui], [role=dialog]");

    function onPointerMove(e: PointerEvent) {
      if (e.pointerType === "touch") {
        // Touch never "hovers"; only a tap (see onPointerUp) can pick a node.
        _pointerPx.touch = true;
        return;
      }
      _pointerPx.touch = false;
      screenToWorld(e.clientX, e.clientY, _v2);
      mouseRef.current.set(_v2.x, _v2.y, 0);
      mouseActiveRef.current = true;
      const r = canvas.getBoundingClientRect();
      _pointerPx.x = e.clientX - r.left;
      _pointerPx.y = e.clientY - r.top;
      _pointerPx.valid = true;
    }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType === "touch") {
        _pointerPx.touch = true;
        tapDown = { x: e.clientX, y: e.clientY };
      } else {
        onPointerMove(e);
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (e.pointerType !== "touch" || !tapDown) return;
      const moved = Math.hypot(e.clientX - tapDown.x, e.clientY - tapDown.y);
      tapDown = null;
      if (moved > 8 || isUi(e.target)) return;
      const r = canvas.getBoundingClientRect();
      _pointerPx.x = e.clientX - r.left;
      _pointerPx.y = e.clientY - r.top;
      _pointerPx.tap = true;
    }

    function onPointerLeave() {
      mouseActiveRef.current = false;
      mouseRef.current.set(999, 999, 0);
      _pointerPx.valid = false;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [camera, mouseRef, mouseActiveRef]);

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

const SELECTION_KEY = "system-selection";

function loadSelection(): SystemSelection {
  try {
    if (typeof window === "undefined") return { planet: 0, part: 0 };
    const raw = sessionStorage.getItem(SELECTION_KEY);
    if (!raw) return { planet: 0, part: 0 };
    const v = JSON.parse(raw) as Partial<SystemSelection>;
    const planet = Number.isInteger(v.planet) && v.planet! >= 0 && v.planet! < projects.length ? v.planet! : 0;
    const n = partsFor(projects[planet]!.slug).length;
    const part = Number.isInteger(v.part) && v.part! >= 0 && v.part! < n ? v.part! : 0;
    return { planet, part };
  } catch {
    return { planet: 0, part: 0 };
  }
}

/** Reads the OS "reduce motion" setting once on mount (and follows changes). */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
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
  const reducedMotion = useReducedMotion();
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
  const sphereScaleRef = useRef(1);
  /** Background particles: fade-in level, and how far the scene has scrolled away. */
  const backdropAlphaRef = useRef(0);
  const exitRef = useRef(0);
  /** Fixed look for the hero layers that used to follow the sphere's Customize panel. */
  const settingsRef = useRef<SphereSettings>(DEFAULT_SPHERE_SETTINGS);
  /** The hero layer still reads these; the solar system never holds or slows it. */
  const holdRef = useRef(false);
  const cursorNearRef = useRef(false);

  /** A discarded canvas reports a lost WebGL context while it is torn down; that must not be mistaken for a GPU failure. */
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);
  const mouseRef = useRef(new THREE.Vector3(999, 999, 0));
  const mouseActiveRef = useRef(false);
  const preRevealRef = useRef(true);

  // ── Solar system selection ──
  // Remembered for the session, so "back" from a case study lands on the same planet.
  const [selection, setSelection] = useState<SystemSelection>(() => loadSelection());
  const selRef = useRef(selection);
  useEffect(() => {
    selRef.current = selection;
    try {
      sessionStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
    } catch {
      // storage unavailable: the system just starts on the first planet
    }
  }, [selection]);
  const screenRef = useRef<SystemScreen>(createSystemScreen());
  const pickPlanet = useCallback((i: number) => {
    setSelection((s) => (s.planet === i ? s : { planet: i, part: 0 }));
  }, []);
  const pickPart = useCallback((i: number) => {
    setSelection((s) => {
      const n = partsFor(projects[s.planet]?.slug ?? "").length || 1;
      return { planet: s.planet, part: ((i % n) + n) % n };
    });
  }, []);
  const stepPlanet = useCallback((d: number) => {
    setSelection((s) => ({ planet: (s.planet + d + projects.length) % projects.length, part: 0 }));
  }, []);
  const stepPart = useCallback((d: number) => {
    setSelection((s) => {
      const n = partsFor(projects[s.planet]?.slug ?? "").length || 1;
      return { planet: s.planet, part: (s.part + d + n) % n };
    });
  }, []);

  // ── Hand-off: fade out + freeze once the Projects section scrolls away ──
  const wrapperRef = useRef<HTMLDivElement>(null);
  const projectsElRef = useRef<HTMLElement | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  /** true = render loop stopped, canvas hidden (Skills / Activity / Resume / Footer) */
  const [frozen, setFrozen] = useState(false);
  const frozenRef = useRef(false);

  const { scrollProgress, containerRef } = useSnapScroll();

  // Explorable once the system has formed (post-lock)
  const [sphereInteractive, setSphereInteractive] = useState(false);
  /** The page is held still while the system is on screen; About and Skills are the exits. */
  const [locked, setLocked] = useState(false);
  const lockedRef = useRef(false);
  /** True while the page is easing onto the landing spot (the pins must not fight it). */
  const settlingRef = useRef(false);
  /** An exit was pressed: the page unlocks and the system fades while it scrolls away. */
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const leavingToRef = useRef<string | null>(null);
  const live = sphereInteractive && !frozen && !leaving;

  /** When the lock last engaged: it holds for a moment even if the scene briefly reads as gone. */
  const lockedAtRef = useRef(0);
  const applyLock = useCallback((v: boolean) => {
    lockedRef.current = v;
    if (v) lockedAtRef.current = performance.now();
    setLocked(v);
  }, []);
  const glideRef = useRef(0);
  const graceRef = useRef(0);
  useEffect(
    () => () => {
      cancelAnimationFrame(glideRef.current);
      clearTimeout(graceRef.current);
    },
    [],
  );
  /**
   * Carry the page to a section ourselves. The browser's own smooth scroll is cancelled
   * by any wheel or touch input, even a blocked one, so it could stop half way.
   */
  const leaveTo = useCallback(
    (to: "about" | "skills") => {
      const c = containerRef.current;
      const el = document.getElementById(to);
      leavingRef.current = true;
      leavingToRef.current = to;
      setLeaving(true);
      applyLock(false);
      if (!c || !el) return;
      const from = c.scrollTop;
      const target = from + (el.getBoundingClientRect().top - c.getBoundingClientRect().top);
      const dur = reducedMotion ? 1 : Math.min(1200, 450 + Math.abs(target - from) * 0.14);
      const t0 = performance.now();
      cancelAnimationFrame(glideRef.current);
      const run = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        c.scrollTop = from + (target - from) * e;
        if (t < 1) {
          glideRef.current = requestAnimationFrame(run);
        } else {
          // Trackpad momentum keeps sending wheel events for a moment after the finger
          // lifts, so keep the page still a little longer instead of letting it leak in.
          graceRef.current = window.setTimeout(() => {
            leavingRef.current = false;
            setLeaving(false);
          }, 800);
        }
      };
      glideRef.current = requestAnimationFrame(run);
    },
    [containerRef, applyLock, reducedMotion],
  );
  // Safety net: if the scroll never happened, give the system back after a moment.
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => {
      leavingRef.current = false;
      setLeaving(false);
    }, 5000);
    return () => clearTimeout(t);
  }, [leaving]);

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
    // revealDone: the page can already be scrolled when the reveal ends (coming back
    // from a case study), and no scroll event will follow to dissolve the portrait.
  }, [scrollProgress, revealDone]);

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
          // The system is formed and being explored: hold it so small scroll changes
          // don't pull it apart. Released once the user scrolls
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
          if (frozenRef.current) document.body.style.cursor = "auto";
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
    /** Where the landing spot was last frame, to catch a scroll that jumps right over it. */
    let prevDelta: number | null = null;
    function check() {
      const isFormed = sphereRef.current > 0.9;
      const isPostLock = virtualScroll.smallFadeRef.current >= 1;
      const next = isFormed && isPostLock && !frozenRef.current;
      if (next !== last) {
        last = next;
        setSphereInteractive(next);
        if (!next) document.body.style.cursor = "auto";
      }

      // Lock the page once the system sits on its landing spot (#projects-sphere), and
      // let go when the visitor is clearly away from it or the scene is gone.
      const container = containerRef.current;
      const anchor = anchorRef.current ?? (anchorRef.current = document.getElementById("projects-sphere"));
      if (container && anchor) {
        const vh = container.clientHeight;
        let delta = anchor.getBoundingClientRect().top - container.getBoundingClientRect().top;
        // Content above can still grow while locked (coming back from a case study, the
        // About scene gets taller once the particles load). That moves the landing spot
        // without any scroll event, so re-pin from here every frame.
        if (lockedRef.current && !settlingRef.current && !leavingRef.current && performance.now() >= navTransit.until && Math.abs(delta) > 1) {
          container.scrollTop += delta;
          delta = 0;
        }
        // The exit is over once the destination section sits at the top.
        if (leavingRef.current) {
          const dest = leavingToRef.current ? document.getElementById(leavingToRef.current) : null;
          const arrived = !dest || Math.abs(dest.getBoundingClientRect().top - container.getBoundingClientRect().top) < 8;
          if (arrived) {
            leavingRef.current = false;
            setLeaving(false);
          }
        }
        // Engage as soon as the visitor is near the landing spot from either side (up to a
        // third of a screen before it, or almost a screen past it, coming back up from
        // Skills), without waiting for the planets to finish forming: a fast scroll or a
        // phone fling can't slip past it that way. The settle below glides the rest.
        // Once locked, only the About/Skills buttons (or the scene going away) let go.
        const nearSpot = delta < vh * 0.35 && delta > -vh * 0.9;
        // A slow frame can let a fast scroll jump over the whole zone in one step, so
        // crossing the spot in either direction since last frame counts too.
        const crossed = prevDelta !== null && ((prevDelta > 2 && delta < -2) || (prevDelta < -2 && delta > 2));
        prevDelta = delta;
        // The site's own navigation (nav links, section buttons) passes straight through.
        const navigating = performance.now() < navTransit.until;
        const holding = performance.now() - lockedAtRef.current < 1500;
        const want = lockedRef.current
          ? isPostLock && !navigating && (!frozenRef.current || holding || settlingRef.current)
          : isPostLock && !leavingRef.current && !navigating && ((nearSpot && !frozenRef.current) || crossed);
        if (want !== lockedRef.current) applyLock(want);
      }
      rafId = requestAnimationFrame(check);
    }
    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, [virtualScroll.smallFadeRef, containerRef, applyLock]);

  // While the system is locked, and while an exit is scrolling away, wheel, touch-drag
  // and the scrolling keys do nothing, so nothing can fight the transition.
  const blocking = locked || leaving;
  // A blocked scroll attempt tells the overlay which way the visitor wanted to go, so it
  // can point at the matching way out (About above, Skills below).
  const [nudge, setNudge] = useState<{ dir: "up" | "down"; n: number } | null>(null);
  const lastNudge = useRef(0);
  useEffect(() => {
    if (!blocking) return;
    const signal = (dir: "up" | "down") => {
      if (leaving) return;
      const now = performance.now();
      if (now - lastNudge.current < 700) return;
      lastNudge.current = now;
      setNudge((p) => ({ dir, n: (p?.n ?? 0) + 1 }));
    };
    let touchX = 0;
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchX = e.touches[0]?.clientX ?? 0;
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const stop = (e: Event) => {
      if (e.target instanceof Element && e.target.closest("[data-native-scroll], textarea")) return;
      e.preventDefault();
      e.stopPropagation();
      if (e instanceof WheelEvent && Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 2) {
        signal(e.deltaY > 0 ? "down" : "up");
      } else if (typeof TouchEvent !== "undefined" && e instanceof TouchEvent) {
        const dx = (e.touches[0]?.clientX ?? 0) - touchX;
        const dy = (e.touches[0]?.clientY ?? 0) - touchY;
        if (Math.abs(dy) > 24 && Math.abs(dy) > Math.abs(dx) * 1.3) signal(dy < 0 ? "down" : "up");
      }
    };
    const SCROLL_KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const space = e.key === " " && !(t instanceof HTMLElement && /^(BUTTON|A)$/.test(t.tagName));
      if (space || SCROLL_KEYS.includes(e.key)) {
        e.preventDefault();
        signal(e.key === "ArrowUp" || e.key === "PageUp" || e.key === "Home" || (space && e.shiftKey) ? "up" : "down");
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("wheel", stop, { passive: false, capture: true });
    window.addEventListener("touchmove", stop, { passive: false, capture: true });
    window.addEventListener("keydown", onKey, { capture: true });
    // The container stops being scrollable by the visitor at all. This also kills a phone's
    // momentum that started before the lock, and scrollbar dragging; code (the settle and
    // the exit glide) can still move it. The container keeps its scrollbar gutter, so
    // nothing shifts sideways.
    const c = containerRef.current;
    if (c) c.style.overflowY = "hidden";
    return () => {
      if (c) c.style.overflowY = "";
      window.removeEventListener("touchstart", onTouchStart, { capture: true });
      window.removeEventListener("wheel", stop, { capture: true });
      window.removeEventListener("touchmove", stop, { capture: true });
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, [blocking, leaving, containerRef]);


  // Whatever moves the page while it is locked (scrollbar drag, middle-click scroll,
  // find-in-page, focus jumps) is put straight back on the landing spot.
  useEffect(() => {
    if (!locked) return;
    const c = containerRef.current;
    if (!c) return;
    const pin = () => {
      // The site's own navigation (a nav link clicked while here) is allowed to leave.
      if (!lockedRef.current || settlingRef.current || performance.now() < navTransit.until) return;
      const a = document.getElementById("projects-sphere");
      if (!a) return;
      const want = c.scrollTop + (a.getBoundingClientRect().top - c.getBoundingClientRect().top);
      if (Math.abs(want - c.scrollTop) > 1) c.scrollTop = want;
    };
    c.addEventListener("scroll", pin, { passive: true });
    return () => c.removeEventListener("scroll", pin);
  }, [locked, containerRef]);

  // Settle onto the exact landing spot so the scene always looks the same.
  useEffect(() => {
    if (!locked) return;
    const container = containerRef.current;
    let raf = 0;
    settlingRef.current = true;
    // Let any wheel momentum already in flight finish before nudging the page.
    const timer = setTimeout(() => {
      const anchor = document.getElementById("projects-sphere");
      if (!container || !anchor) {
        settlingRef.current = false;
        return;
      }
      const from = container.scrollTop;
      const to = from + (anchor.getBoundingClientRect().top - container.getBoundingClientRect().top);
      if (Math.abs(to - from) < 2) {
        settlingRef.current = false;
        return;
      }
      // Longer glides for longer distances (it can start almost a screen away).
      const dur = Math.min(900, 380 + Math.abs(to - from) * 0.45);
      const t0 = performance.now();
      const run = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        container.scrollTop = from + (to - from) * (1 - Math.pow(1 - t, 3));
        if (t < 1) raf = requestAnimationFrame(run);
        else settlingRef.current = false;
      };
      raf = requestAnimationFrame(run);
    }, 200);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      settlingRef.current = false;
    };
  }, [locked, containerRef]);

  // Keyboard: left/right step through parts, shift + left/right through planets.
  // Touch: a sideways swipe steps through parts (vertical drags still scroll).
  useEffect(() => {
    if (!live) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const d = e.key === "ArrowLeft" ? -1 : 1;
      e.preventDefault();
      if (e.shiftKey) stepPlanet(d);
      else stepPart(d);
    }
    let start: { x: number; y: number } | null = null;
    function onDown(e: PointerEvent) {
      if (e.pointerType === "touch") start = { x: e.clientX, y: e.clientY };
    }
    function onUp(e: PointerEvent) {
      if (e.pointerType !== "touch" || !start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) stepPart(dx < 0 ? 1 : -1);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [live, stepPart, stepPlanet]);

  return (
    <div
      id="hero-particle-canvas"
      ref={wrapperRef}
      className="fixed inset-0 z-[1]"
      style={{
        // Must stay "none": this is a fixed, full-viewport layer, so its scroll chain is
        // the document (overflow:hidden) rather than the SmoothScroll container, making it
        // hit-testable swallows the wheel and scrolling dies. Picking is done from window
        // listeners, and the overlay's buttons re-enable pointer events on themselves.
        pointerEvents: "none",
        transition: "opacity 0.15s linear",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 1.6], fov: 60 }}
        dpr={adaptiveDpr.dpr}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        frameloop={frozen ? "never" : "always"}
        onCreated={({ gl }) => {
          // If the GPU drops the context (tab backgrounded on mobile, driver reset),
          // allow the browser to restore it; if it never comes back, fall back to the
          // static page instead of leaving a black hole where the hero was.
          const el = gl.domElement;
          let timer: ReturnType<typeof setTimeout> | null = null;
          el.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            // Lost because this canvas unmounted: expected.
            if (!aliveRef.current) return;
            timer = setTimeout(() => {
              if (aliveRef.current) onFatalError?.();
            }, 4000);
          });
          el.addEventListener("webglcontextrestored", () => {
            if (timer) clearTimeout(timer);
          });
        }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <SystemCamera formRef={sphereRef} selRef={selRef} reducedMotion={reducedMotion} />
        <MouseTracker mouseRef={mouseRef} mouseActiveRef={mouseActiveRef} />
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
          cursorNearSphereRef={cursorNearRef}
          settingsRef={settingsRef}
          holdRef={holdRef}
        />
        <BackdropParticles
          alphaRef={backdropAlphaRef}
          exitRef={exitRef}
          settingsRef={settingsRef}
          lowPower={lowPower}
        />
        <SolarSystem
          alphaRef={bigAlphaRef}
          formRef={sphereRef}
          exitRef={exitRef}
          selRef={selRef}
          interactive={live}
          lowPower={lowPower}
          reducedMotion={reducedMotion}
          screenRef={screenRef}
          onPickPlanet={pickPlanet}
          onPickPart={pickPart}
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
            intensity={1.2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>

      {/* Words and controls around the solar system */}
      <SystemOverlay
        visible={live}
        selection={selection}
        onPlanet={pickPlanet}
        onPart={pickPart}
        screenRef={screenRef}
        onLeave={leaveTo}
        nudge={nudge}
      />
    </div>
  );
}
