"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { curlNoiseGLSL } from "@/lib/particles/curlNoise";
import {
  buildScatterPositions,
  buildSpeedAttribute,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";

// ─── Layout constants ─────────────────────────────────────────────────────────

/** Fingertip separation at full progress, in CSS pixels. The fresco's negative
 *  space is the whole point — the hands must never close it. */
const GAP_PX_DESKTOP = 72;
/** Portrait gets a slightly wider gap: the button sits inside it. */
const GAP_PX_PORTRAIT = 88;

/** Each hand's long edge as a fraction of the smaller viewport dimension. */
const HAND_SCALE_LANDSCAPE = 0.42;
const HAND_SCALE_PORTRAIT = 0.5;

/** Same delta clamp the hero uses — a frameloop toggle resets R3F's clock, so
 *  every animated value accumulates its own elapsed time from `delta`. */
function stepTime(current: number, delta: number) {
  return current + Math.min(delta, 0.1);
}

// ─── Shaders ──────────────────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  attribute vec3 shapePos;
  attribute vec3 scatterPos;
  attribute vec3 pColor;
  attribute float speed;

  uniform float uProgress;
  uniform float uTime;
  uniform float uPointSize;
  uniform vec2 uResolution;
  uniform vec3 uOrigin;
  uniform vec3 uRest;
  uniform float uScale;

  varying vec3 vColor;
  varying float vAlpha;

  ${curlNoiseGLSL}

  void main() {
    // Per-particle progress with a careful landing — lifted from the hero so the
    // two systems read as one engine rather than two similar effects.
    float rawP = uProgress * (0.7 + speed * 0.6);
    float p = 1.0 - pow(1.0 - clamp(rawP, 0.0, 1.0), 1.5 + speed * 0.8);

    // Dispersed → formed hand, in the cloud's own local space.
    vec3 local = mix(scatterPos, shapePos, p) * uScale;

    // Off-screen origin → resting position. Runs slightly ahead of the morph so
    // the cloud is already arriving while it's still pulling itself together.
    float travelT = smoothstep(0.0, 0.92, uProgress);
    vec3 pos = local + mix(uOrigin, uRest, travelT);

    // Curl turbulence, bell-tapered to exactly zero at both rest states so the
    // formed hand reads crisp instead of fuzzy.
    float bell = transitionBell(p);
    vec3 curl = curlNoise(pos * 0.9 + vec3(uTime * 0.08 * speed));
    pos += curl * 0.16 * bell;

    // Once settled, a barely-there breath keeps the held pose from looking frozen.
    float settled = smoothstep(0.85, 1.0, uProgress);
    pos += vec3(
      sin(uTime * 0.5 + speed * 6.28),
      cos(uTime * 0.4 + speed * 5.0),
      sin(uTime * 0.45 + speed * 4.0)
    ) * 0.008 * settled;

    // Fresco pigment, warmed and lifted as the hands close the gap. This is what
    // drives the bloom ramp — see HandBloom.
    float charge = smoothstep(0.5, 1.0, uProgress);
    vColor = mix(pColor, pColor * 1.9 + vec3(0.16, 0.03, 0.03), charge);

    // Fade in on entry; hold once present.
    vAlpha = smoothstep(0.0, 0.10, uProgress);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointSize * (uResolution.y / 900.0) * (1.0 / -mvPosition.z);
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
    gl_FragColor = vec4(vColor, alpha * 0.62);
  }
`;

// ─── Viewport maths ───────────────────────────────────────────────────────────

interface ViewportMetrics {
  worldPerPx: number;
  halfWidth: number;
  halfHeight: number;
}

/** Visible world extent at z=0 for a perspective camera, so px-defined values
 *  (the fingertip gap) can be expressed in world units. */
function measureViewport(
  camera: THREE.PerspectiveCamera,
  pixelHeight: number,
): ViewportMetrics {
  const worldHeight =
    2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
  return {
    worldPerPx: worldHeight / pixelHeight,
    halfHeight: worldHeight / 2,
    halfWidth: (worldHeight * camera.aspect) / 2,
  };
}

// ─── One hand ─────────────────────────────────────────────────────────────────

interface HandCloudProps {
  /** Tip already anchored to the origin by the caller. */
  cloud: PointCloud;
  /** Which side of the gap this hand rests on. */
  side: "left" | "right";
  portrait: boolean;
  progressRef: React.MutableRefObject<number>;
}

function HandCloud({ cloud, side, portrait, progressRef }: HandCloudProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);
  const { camera, size } = useThree();

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const scatter = buildScatterPositions(cloud);

    // `position` must exist for three.js to compute a bounding sphere, but the
    // shader ignores it and drives everything from shapePos/scatterPos.
    geo.setAttribute("position", new THREE.BufferAttribute(cloud.positions, 3));
    geo.setAttribute("shapePos", new THREE.BufferAttribute(cloud.positions, 3));
    geo.setAttribute("scatterPos", new THREE.BufferAttribute(scatter, 3));
    geo.setAttribute("pColor", new THREE.BufferAttribute(cloud.colors, 3));
    geo.setAttribute(
      "speed",
      new THREE.BufferAttribute(buildSpeedAttribute(cloud.count), 1),
    );

    // Scatter positions extend well past the hand; without this the cloud gets
    // frustum-culled at low progress and pops in.
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);

    return geo;
  }, [cloud]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPointSize: { value: 2.6 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uOrigin: { value: new THREE.Vector3() },
      uRest: { value: new THREE.Vector3() },
      uScale: { value: 1 },
    }),
    [],
  );

  // Recomputed on resize/orientation change: gap, entry origin and hand scale
  // are all viewport-relative.
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;

    const cam = camera as THREE.PerspectiveCamera;
    const { worldPerPx, halfWidth, halfHeight } = measureViewport(
      cam,
      size.height,
    );

    const gapPx = portrait ? GAP_PX_PORTRAIT : GAP_PX_DESKTOP;
    const halfGap = (gapPx * worldPerPx) / 2;

    // Hand spans ~2 units after normalisation, so scale = target / 2.
    const targetSpan =
      (portrait ? HAND_SCALE_PORTRAIT : HAND_SCALE_LANDSCAPE) *
      Math.min(halfWidth, halfHeight) *
      2;
    mat.uniforms.uScale.value = targetSpan / 2;

    if (portrait) {
      // Hands stand upright and approach vertically: tips meet across a vertical
      // gap, wrists exit through the top and bottom edges.
      const sign = side === "right" ? 1 : -1;
      mat.uniforms.uRest.value.set(0, sign * halfGap, 0);
      mat.uniforms.uOrigin.value.set(0, sign * halfHeight * 2.1, 0);
    } else {
      // Fresco geometry: God upper-right, Adam lower-left.
      const sign = side === "right" ? 1 : -1;
      mat.uniforms.uRest.value.set(sign * halfGap, 0, 0);
      mat.uniforms.uOrigin.value.set(
        sign * halfWidth * 1.9,
        sign * halfHeight * 1.1,
        0,
      );
    }

    mat.uniforms.uResolution.value.set(size.width, size.height);
  }, [camera, size, portrait, side]);

  useFrame((_state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uProgress.value = progressRef.current;
    mat.uniforms.uTime.value = timeRef.current = stepTime(timeRef.current, delta);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
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

// ─── Bloom ────────────────────────────────────────────────────────────────────

/**
 * Fixed-intensity bloom.
 *
 * The "charging" glow as the hands close is driven from the vertex shader's
 * `charge` term (particle colour lifts over the final 45% of progress) rather
 * than by animating this effect. Two reasons: `Bloom` in
 * @react-three/postprocessing 3.0.4 is a plain function component, so it exposes
 * no ref to the underlying effect instance and its `intensity` can only be
 * changed by re-rendering — unacceptable per frame. And brightening the source
 * is the more coherent model anyway: brighter particles cross the luminance
 * threshold harder, so the bloom intensifies on its own.
 */
function HandBloom() {
  return (
    <EffectComposer>
      <Bloom
        intensity={1.15}
        luminanceThreshold={0.12}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export interface HandParticleCanvasProps {
  /** God's hand — tip anchored to origin, points toward -x (or -y in portrait). */
  godCloud: PointCloud;
  /** Adam's hand — tip anchored to origin, points toward +x (or +y in portrait). */
  adamCloud: PointCloud;
  portrait: boolean;
  /** Scroll progress through the pinned section, 0→1. Written by the parent's
   *  motion-value subscription so scrolling never triggers a React render. */
  progressRef: React.MutableRefObject<number>;
  /** Stops the render loop while the section is off-screen. */
  active: boolean;
}

export function HandParticleCanvas({
  godCloud,
  adamCloud,
  portrait,
  progressRef,
  active,
}: HandParticleCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true }}
      frameloop={active ? "always" : "never"}
      style={{ background: "transparent", pointerEvents: "none" }}
    >
      <HandCloud
        cloud={godCloud}
        side="right"
        portrait={portrait}
        progressRef={progressRef}
      />
      <HandCloud
        cloud={adamCloud}
        side="left"
        portrait={portrait}
        progressRef={progressRef}
      />
      <HandBloom />
    </Canvas>
  );
}
