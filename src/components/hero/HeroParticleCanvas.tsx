"use client";

import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { PointCloud } from "@/lib/particles/sampleImageToPoints";
import { curlNoiseGLSL } from "@/lib/particles/curlNoise";

interface HeroParticleCanvasProps {
  cloudA: PointCloud; // face / revealed portrait
  cloudB: PointCloud; // abstract scatter (question screen)
  onRevealComplete?: () => void;
}

// Vertex shader: lerps between cloudB and cloudA positions, applies curl noise mid-transition
const vertexShader = /* glsl */ `
  attribute vec3 positionA;
  attribute vec3 positionB;
  attribute vec3 colorA;
  attribute vec3 colorB;

  uniform float uProgress; // 0 = cloudB (scatter), 1 = cloudA (face)
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform float uPointSize;

  varying vec3 vColor;

  ${curlNoiseGLSL}

  void main() {
    // Lerp position between B and A based on progress
    vec3 pos = mix(positionB, positionA, uProgress);

    // Apply curl noise offset mid-transition (bell curve: zero at rest)
    float bell = transitionBell(uProgress);
    vec3 noiseInput = pos * uNoiseScale + vec3(uTime * 0.3);
    vec3 curl = curlNoise(noiseInput);
    pos += curl * uNoiseStrength * bell;

    // Lerp color
    vColor = mix(colorB, colorA, uProgress);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = uPointSize * (300.0 / -mvPosition.z);
  }
`;

// Fragment shader: soft circle particles with color
const fragmentShader = /* glsl */ `
  varying vec3 vColor;

  void main() {
    // Soft circle (discard outside radius for antialiased points)
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

function ParticleSystem({
  cloudA,
  cloudB,
  progress,
}: {
  cloudA: PointCloud;
  cloudB: PointCloud;
  progress: React.MutableRefObject<number>;
}) {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Create buffer attributes once
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // Use positionB as the default "position" attribute (Three.js requires it)
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(cloudB.positions, 3)
    );
    geo.setAttribute(
      "positionA",
      new THREE.BufferAttribute(cloudA.positions, 3)
    );
    geo.setAttribute(
      "positionB",
      new THREE.BufferAttribute(cloudB.positions, 3)
    );
    geo.setAttribute(
      "colorA",
      new THREE.BufferAttribute(cloudA.colors, 3)
    );
    geo.setAttribute(
      "colorB",
      new THREE.BufferAttribute(cloudB.colors, 3)
    );

    return geo;
  }, [cloudA, cloudB]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uNoiseScale: { value: 1.5 },
      uNoiseStrength: { value: 0.15 },
      uPointSize: { value: 2.0 },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = progress.current;
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry}>
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
 * HeroParticleCanvas — the full canvas component.
 * Renders the particle system and drives the B→A morph via click.
 */
export function HeroParticleCanvas({
  cloudA,
  cloudB,
  onRevealComplete,
}: HeroParticleCanvasProps) {
  const progressRef = useRef(0);
  const targetRef = useRef(0);
  const revealedRef = useRef(false);

  // Simple tween: animate progressRef toward targetRef each frame
  const TweenDriver = useCallback(() => {
    useFrame((_, delta) => {
      const speed = 0.8; // ~1.2s to complete
      const diff = targetRef.current - progressRef.current;

      if (Math.abs(diff) > 0.001) {
        progressRef.current += diff * speed * delta * 4;
      } else {
        progressRef.current = targetRef.current;
        if (targetRef.current === 1 && !revealedRef.current) {
          revealedRef.current = true;
          onRevealComplete?.();
        }
      }
    });
    return null;
  }, [onRevealComplete]);

  const handleReveal = useCallback(() => {
    targetRef.current = 1;
  }, []);

  return (
    <div className="absolute inset-0" onClick={handleReveal}>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ParticleSystem
          cloudA={cloudA}
          cloudB={cloudB}
          progress={progressRef}
        />
        <TweenDriver />
      </Canvas>
    </div>
  );
}
