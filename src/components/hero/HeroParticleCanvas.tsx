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
  uniform vec3 uMouse;
  uniform float uMouseActive;  // 1.0 when mouse is over canvas, 0.0 otherwise
  uniform float uPreReveal;    // 1.0 before reveal, 0.0 after

  varying vec3 vColor;
  varying float vAlpha;

  ${curlNoiseGLSL}

  void main() {
    // Per-particle progress (speed variation: some arrive faster)
    float pProgress = clamp(uProgress * (0.6 + speed * 0.8), 0.0, 1.0);

    // Lerp position
    vec3 pos = mix(positionB, positionA, pProgress);

    // === IDLE SWIRL (pre-reveal) ===
    // Rotate particles around origin slowly — creates a living vortex
    float idleFactor = 1.0 - pProgress;
    if (idleFactor > 0.01) {
      float swirlAngle = uTime * 0.15 * (0.7 + speed * 0.6); // vary rotation speed per particle
      float cosA = cos(swirlAngle);
      float sinA = sin(swirlAngle);
      // Rotate the cloudB position around Y axis slightly, mostly around Z (screen plane)
      vec3 bPos = positionB;
      vec3 rotated = vec3(
        bPos.x * cosA - bPos.y * sinA,
        bPos.x * sinA + bPos.y * cosA,
        bPos.z + sin(uTime * 0.1 + speed * 6.28) * 0.02
      );
      // Blend between swirled idle position and morphed position
      pos = mix(rotated, positionA, pProgress);

      // Add gentle breathing (scale pulsation)
      float breathe = 1.0 + sin(uTime * 0.3 + speed * 3.14) * 0.03;
      pos.xy *= mix(breathe, 1.0, pProgress);
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
        influence = influence * influence; // quadratic

        // Swirl component: perpendicular to direction toward mouse
        vec2 perp = vec2(-toMouse.y, toMouse.x);
        vec2 swirlDir = normalize(perp);

        // Pull slightly toward mouse + strong swirl + fling outward
        vec2 pullDir = normalize(toMouse.xy);

        // Close to mouse: swirl. Very close: fling away
        float flingZone = 0.15;
        if (dist < flingZone) {
          // FLING: push away from cursor
          float flingStrength = (1.0 - dist / flingZone) * 0.3;
          pos.xy -= pullDir * flingStrength;
        } else {
          // SWIRL: orbit around cursor
          float swirlStrength = influence * 0.08;
          float pullStrength = influence * 0.02;
          pos.xy += swirlDir * swirlStrength;
          pos.xy += pullDir * pullStrength;
        }
      }
    }

    // === DISSOLVE ON SCROLL ===
    if (uDissolve > 0.0) {
      vec3 dissolveInput = pos * 2.0 + vec3(uTime * 0.03);
      vec3 dissolveCurl = curlNoise(dissolveInput);
      pos += dissolveCurl * uDissolve * 0.8;
    }

    // Color
    vColor = mix(colorB, colorA, pProgress);
    vAlpha = 1.0 - uDissolve * 0.6;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point size
    float baseSize = uPointSize * (uResolution.y / 900.0);
    gl_PointSize = baseSize * (1.0 / -mvPosition.z);
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
  mouseRef,
  mouseActiveRef,
  preRevealRef,
}: {
  cloudA: PointCloud;
  cloudB: PointCloud;
  progressRef: React.MutableRefObject<number>;
  dissolveRef: React.MutableRefObject<number>;
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
 * Slower, more satisfying morph tween (~2.5s ease-in-out feel).
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
    const duration = 2.5; // seconds for full morph

    // Ease-in-out cubic
    let t = Math.min(1, elapsed / duration);
    t = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    progressRef.current = t;

    if (t >= 1) {
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
    const canvas = document.querySelector("#hero-particle-canvas canvas") as HTMLElement;
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

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
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
  const mouseRef = useRef(new THREE.Vector3(999, 999, 0));
  const mouseActiveRef = useRef(false);
  const preRevealRef = useRef(true);

  const { scrollProgress } = useSnapScroll();

  // Track pre-reveal state
  useEffect(() => {
    if (revealTriggered) {
      // Disable cursor interaction shortly after morph starts
      const timer = setTimeout(() => {
        preRevealRef.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [revealTriggered]);

  // Dissolve on scroll (after reveal)
  useEffect(() => {
    if (progressRef.current < 0.95) {
      dissolveRef.current = 0;
      return;
    }
    dissolveRef.current = Math.min(1, Math.max(0, scrollProgress));
  }, [scrollProgress]);

  const handleComplete = useCallback(() => {
    preRevealRef.current = false;
    onRevealComplete?.();
  }, [onRevealComplete]);

  return (
    <div id="hero-particle-canvas" className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 1.6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent", pointerEvents: "auto" }}
      >
        <CameraAdjust />
        <MouseTracker mouseRef={mouseRef} mouseActiveRef={mouseActiveRef} />
        <ParticleSystem
          cloudA={cloudA}
          cloudB={cloudB}
          progressRef={progressRef}
          dissolveRef={dissolveRef}
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
