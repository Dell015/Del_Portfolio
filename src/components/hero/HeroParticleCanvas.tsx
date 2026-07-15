"use client";

import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PointCloud } from "@/lib/particles/sampleImageToPoints";
import { curlNoiseGLSL } from "@/lib/particles/curlNoise";
import { useSnapScroll } from "@/components/SmoothScroll";

interface HeroParticleCanvasProps {
  cloudA: PointCloud;
  cloudB: PointCloud;
  revealTriggered: boolean;
  onRevealComplete?: () => void;
}

const vertexShader = /* glsl */ `
  attribute vec3 positionA;
  attribute vec3 positionB;
  attribute vec3 colorA;
  attribute vec3 colorB;
  attribute float speed;

  uniform float uProgress;
  uniform float uTime;
  uniform float uPointSize;
  uniform vec2 uResolution;
  uniform float uDissolve;
  uniform float uAmbient;     // 0.0 = portrait mode, 1.0 = full ambient drift
  uniform float uFadeOut;     // 0.0 = visible, 1.0 = faded out
  uniform vec3 uMouse;
  uniform float uMouseActive;
  uniform float uPreReveal;

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

      vec3 idlePos = vec3(
        wrappedX,
        bPos.y + yBreath + yPulse,
        bPos.z + sin(uTime * 0.1 + speed * 4.0) * 0.008
      );

      pos = mix(idlePos, positionA, pProgress);
    }

    // === MID-TRANSITION TURBULENCE ===
    float bell = transitionBell(pProgress);
    vec3 noiseInput = pos * 1.0 + vec3(uTime * 0.08 * speed);
    vec3 curl = curlNoise(noiseInput);
    pos += curl * 0.2 * bell;

    // === CURSOR VORTEX + FLING (only pre-reveal) ===
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
          float swirlStrength = influence * 0.08;
          float pullStrength = influence * 0.02;
          pos.xy += swirlDir * swirlStrength;
          pos.xy += pullDir * pullStrength;
        }
      }
    }

    // === DISSOLVE + AMBIENT TRANSITION ===
    if (uDissolve > 0.0) {
      // Phase 1: Fast twist/scatter (dissolve 0→1)
      vec3 dissolveInput = pos * 2.5 + vec3(uTime * 0.06, uTime * 0.04, uTime * 0.03);
      vec3 dissolveCurl = curlNoise(dissolveInput);

      // Rapid twist — particles spiral outward fast
      float twistStrength = uDissolve * 1.2;
      pos += dissolveCurl * twistStrength;

      // Spread particles outward from center
      float spreadFactor = uDissolve * 0.6;
      pos.xy += normalize(pos.xy + vec2(0.001)) * spreadFactor * (0.5 + speed * 0.5);
    }

    // === AMBIENT DRIFT MODE ===
    if (uAmbient > 0.0) {
      // Beautiful flowing drift — particles become a living background
      float ambientTime = uTime * 0.02;
      vec3 ambientInput = pos * 0.8 + vec3(ambientTime, ambientTime * 0.7, ambientTime * 0.5);
      vec3 ambientCurl = curlNoise(ambientInput);

      // Gentle continuous flow
      float flowStrength = uAmbient * 0.15;
      pos += ambientCurl * flowStrength;

      // Slow breathing — expand and contract subtly
      float breath = sin(uTime * 0.05 + speed * 6.28) * 0.03 * uAmbient;
      pos *= 1.0 + breath;

      // Per-particle gentle oscillation
      pos.x += sin(uTime * 0.08 + speed * 12.0) * 0.02 * uAmbient;
      pos.y += cos(uTime * 0.06 + speed * 8.0) * 0.015 * uAmbient;
    }

    // Color — in ambient mode, shift toward muted accent tones
    vec3 baseColor = mix(colorB, colorA, pProgress);
    vec3 ambientColor = mix(baseColor, vec3(0.82, 0.16, 0.22), 0.15 * uAmbient); // subtle accent tint
    vColor = ambientColor;

    // Alpha — dissolve reduces, ambient keeps it visible, fadeOut kills it
    float dissolveAlpha = 1.0 - uDissolve * 0.5;
    float ambientAlpha = mix(dissolveAlpha, 0.6, uAmbient); // ambient is semi-transparent
    vAlpha = ambientAlpha * (1.0 - uFadeOut);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point size — slightly smaller in ambient mode for subtlety
    float baseSize = uPointSize * (uResolution.y / 900.0);
    float ambientSizeScale = mix(1.0, 0.7, uAmbient);
    gl_PointSize = baseSize * ambientSizeScale * (1.0 / -mvPosition.z);
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
    gl_FragColor = vec4(vColor, alpha * 0.85);
  }
`;

function ParticleSystem({
  cloudA,
  cloudB,
  progressRef,
  dissolveRef,
  ambientRef,
  fadeOutRef,
  mouseRef,
  mouseActiveRef,
  preRevealRef,
}: {
  cloudA: PointCloud;
  cloudB: PointCloud;
  progressRef: React.MutableRefObject<number>;
  dissolveRef: React.MutableRefObject<number>;
  ambientRef: React.MutableRefObject<number>;
  fadeOutRef: React.MutableRefObject<number>;
  mouseRef: React.MutableRefObject<THREE.Vector3>;
  mouseActiveRef: React.MutableRefObject<boolean>;
  preRevealRef: React.MutableRefObject<boolean>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = cloudA.count;

    geo.setAttribute("position", new THREE.BufferAttribute(cloudB.positions, 3));
    geo.setAttribute("positionA", new THREE.BufferAttribute(cloudA.positions, 3));
    geo.setAttribute("positionB", new THREE.BufferAttribute(cloudB.positions, 3));
    geo.setAttribute("colorA", new THREE.BufferAttribute(cloudA.colors, 3));
    geo.setAttribute("colorB", new THREE.BufferAttribute(cloudB.colors, 3));

    // Per-particle speed variation (0.3 – 1.7)
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      speeds[i] = 0.3 + Math.random() * 1.4;
    }
    geo.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));

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
      uFadeOut: { value: 0 },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uMouseActive: { value: 0 },
      uPreReveal: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    mat.uniforms.uProgress.value = progressRef.current;
    mat.uniforms.uDissolve.value = dissolveRef.current;
    mat.uniforms.uAmbient.value = ambientRef.current;
    mat.uniforms.uFadeOut.value = fadeOutRef.current;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uMouse.value.copy(mouseRef.current);
    mat.uniforms.uMouseActive.value = mouseActiveRef.current ? 1 : 0;
    mat.uniforms.uPreReveal.value = preRevealRef.current ? 1 : 0;
  });

  return (
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
  );
}

/**
 * Custom easing: slow start → fast middle → careful end.
 * Particles hesitate, then blast toward their targets,
 * then carefully decelerate to precisely build the portrait.
 *
 * Uses a piecewise cubic with exponent control per phase:
 *   - First 25%:  ease-in (power 2.5) — slow departure
 *   - Middle 50%: near-linear fast travel
 *   - Last 25%:   ease-out (power 3) — extra careful landing
 */
function morphEasing(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  // Phase boundaries
  const p1 = 0.25; // end of slow-start
  const p2 = 0.75; // start of careful-end

  // Output at phase boundaries (tuned so mid-section moves fast)
  const v1 = 0.08; // only 8% progress in first 25% of time — slow start
  const v2 = 0.92; // 84% of the distance covered in the middle 50%

  if (t < p1) {
    // Ease-in: power curve for slow departure
    const local = t / p1; // 0→1 within this phase
    return v1 * Math.pow(local, 2.5);
  } else if (t < p2) {
    // Fast middle: slightly accelerating linear
    const local = (t - p1) / (p2 - p1); // 0→1
    // Subtle S-curve keeps it smooth at joints
    const smooth = local * local * (3 - 2 * local); // smoothstep
    return v1 + (v2 - v1) * smooth;
  } else {
    // Careful end: strong ease-out for precise placement
    const local = (t - p2) / (1 - p2); // 0→1
    return v2 + (1 - v2) * (1 - Math.pow(1 - local, 3));
  }
}

/**
 * Morph tween: slow start, fast middle, careful end.
 */
function TweenDriver({
  progressRef,
  triggered,
  onComplete,
}: {
  progressRef: React.MutableRefObject<number>;
  triggered: boolean;
  onComplete: () => void;
}) {
  const completedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  useFrame((state) => {
    if (!triggered || completedRef.current) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const duration = 4.5; // total morph time in seconds

    const linearT = Math.min(1, elapsed / duration);
    progressRef.current = morphEasing(linearT);

    if (linearT >= 1) {
      progressRef.current = 1;
      completedRef.current = true;
      onComplete();
    }
  });

  return null;
}

function CameraAdjust() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    const baseZ = 1.6;
    const adjustedZ = aspect < 1
      ? baseZ + (1 - aspect) * 0.5
      : baseZ - (aspect - 1) * 0.08;
    (camera as THREE.PerspectiveCamera).position.z = Math.max(1.2, Math.min(2.2, adjustedZ));
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

function screenToWorld(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  camera: THREE.PerspectiveCamera
): THREE.Vector3 {
  const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

  const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
  vec.unproject(camera);

  const dir = vec.sub(camera.position).normalize();
  const dist = -camera.position.z / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(dist));
}

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

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const worldPos = screenToWorld(e.clientX, e.clientY, rect, camera as THREE.PerspectiveCamera);
      mouseRef.current.set(worldPos.x, worldPos.y, 0);
      mouseActiveRef.current = true;
    }

    function onMouseLeave() {
      mouseActiveRef.current = false;
      mouseRef.current.set(999, 999, 0);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [camera, mouseRef, mouseActiveRef]);

  return null;
}

export function HeroParticleCanvas({
  cloudA,
  cloudB,
  revealTriggered,
  onRevealComplete,
}: HeroParticleCanvasProps) {
  const progressRef = useRef(0);
  const dissolveRef = useRef(0);
  const ambientRef = useRef(0);
  const fadeOutRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector3(999, 999, 0));
  const mouseActiveRef = useRef(false);
  const preRevealRef = useRef(true);

  const { scrollProgress } = useSnapScroll();

  // Track pre-reveal state
  useEffect(() => {
    if (revealTriggered) {
      const timer = setTimeout(() => {
        preRevealRef.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [revealTriggered]);

  // Scroll-linked dissolve → ambient → fadeOut
  useEffect(() => {
    if (progressRef.current < 0.95) {
      // Not yet revealed — no dissolve
      dissolveRef.current = 0;
      ambientRef.current = 0;
      fadeOutRef.current = 0;
      return;
    }

    // scrollProgress: 0 = top of hero, 1 = top of about, 2 = top of projects
    const sp = scrollProgress;

    if (sp < 0.05) {
      // Still at hero top — portrait intact
      dissolveRef.current = 0;
      ambientRef.current = 0;
      fadeOutRef.current = 0;
    } else if (sp < 0.4) {
      // Fast dissolve phase: portrait shatters rapidly (0.05 → 0.4)
      const t = (sp - 0.05) / 0.35;
      dissolveRef.current = Math.min(1, t * 2.5); // reaches 1.0 quickly
      ambientRef.current = t * 0.3; // start transitioning to ambient
      fadeOutRef.current = 0;
    } else if (sp < 1.8) {
      // Ambient drift mode — particles flow beautifully as background
      dissolveRef.current = 1;
      ambientRef.current = Math.min(1, 0.3 + (sp - 0.4) * 0.5);
      fadeOutRef.current = 0;
    } else if (sp < 2.2) {
      // Fade out as user approaches Projects section
      dissolveRef.current = 1;
      ambientRef.current = 1;
      fadeOutRef.current = Math.min(1, (sp - 1.8) / 0.4);
    } else {
      // Fully faded out
      dissolveRef.current = 1;
      ambientRef.current = 1;
      fadeOutRef.current = 1;
    }
  }, [scrollProgress]);

  const handleComplete = useCallback(() => {
    preRevealRef.current = false;
    onRevealComplete?.();
  }, [onRevealComplete]);

  return (
    <div id="hero-particle-canvas" className="fixed inset-0 z-[1] pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 1.6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent", pointerEvents: "none" }}
        events={() => ({ enabled: false, priority: 0, compute: () => {} } as never)}
      >
        <CameraAdjust />
        <MouseTracker mouseRef={mouseRef} mouseActiveRef={mouseActiveRef} />
        <ParticleSystem
          cloudA={cloudA}
          cloudB={cloudB}
          progressRef={progressRef}
          dissolveRef={dissolveRef}
          ambientRef={ambientRef}
          fadeOutRef={fadeOutRef}
          mouseRef={mouseRef}
          mouseActiveRef={mouseActiveRef}
          preRevealRef={preRevealRef}
        />
        <TweenDriver
          progressRef={progressRef}
          triggered={revealTriggered}
          onComplete={handleComplete}
        />
      </Canvas>
    </div>
  );
}
