"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, useAdaptiveDpr } from "@/components/perf/AdaptiveDpr";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { curlNoiseGLSL } from "@/lib/particles/curlNoise";
import {
  buildScatterPositions,
  buildSpeedAttribute,
  getCloudBounds,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";
const GAP_PX_DESKTOP = 72;
const GAP_PX_PORTRAIT = 88;
const HAND_SCALE_LANDSCAPE = 0.42;
const HAND_SCALE_PORTRAIT = 0.55;
/** Portrait: the hands stop this far apart (fraction of screen height) once the resume has appeared. */
const PORTRAIT_OPEN_GAP = 0.6;

// ─── Layout constants ─────────────────────────────────────────────────────────

/** Same delta clamp the hero uses, a frameloop toggle resets R3F's clock, so
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
  uniform float uPointPx;
  uniform float uCamZ;
  uniform vec3 uOrigin;
  uniform vec3 uRest;
  uniform float uScale;
  uniform float uExtent;

  varying vec3 vColor;
  varying float vAlpha;

  ${curlNoiseGLSL}

  void main() {
    // Per-particle progress with a careful landing.
    //
    // The multiplier is deliberately >= 1 for every particle. The hero uses
    // (0.7 + speed*0.6), which bottoms out at 0.88, meaning its slowest particles
    // would need uProgress = 1.14 to converge and therefore NEVER settle. That
    // reads as texture on a face, but here it left ~38px of residual scatter that
    // closed the fingertip gap and fused the two hands into one blob.
    //
    // At (1.0 + speed*0.6) the slowest particle lands at uProgress 0.85 and the
    // fastest at 0.50, so arrival is still staggered but everything is at rest for
    // the final stretch, which is exactly where the gap has to read.
    // Slow build: each particle waits for its turn, fingertips first and the arm
    // last, so the hand is drawn out of the dust from the reaching end backwards.
    // Each then settles with a long ease-out, which is what reads as slow motion.
    float delay = clamp(length(shapePos.xy) / uExtent, 0.0, 1.0);
    float start = delay * 0.30 + speed * 0.05;
    float t = clamp((uProgress - start) / 0.40, 0.0, 1.0);
    float p = 1.0 - pow(1.0 - t, 3.0);

    // Dispersed → formed hand, in the cloud's own local space.
    vec3 local = mix(scatterPos, shapePos, p) * uScale;

    // Off-screen origin → resting position, completing alongside the morph.
    float travelT = smoothstep(0.0, 0.45, uProgress);
    vec3 pos = local + mix(uOrigin, uRest, travelT);

    // Curl turbulence, bell-tapered to exactly zero at both rest states so the
    // formed hand reads crisp instead of fuzzy.
    float bell = transitionBell(p);
    vec3 curl = curlNoise(pos * 0.9 + vec3(uTime * 0.08 * speed));
    pos += curl * 0.16 * bell;

    // Once settled, a barely-there breath keeps the held pose from looking frozen.
    float settled = smoothstep(0.7, 0.8, uProgress);
    pos += vec3(
      sin(uTime * 0.5 + speed * 6.28),
      cos(uTime * 0.4 + speed * 5.0),
      sin(uTime * 0.45 + speed * 4.0)
    ) * 0.008 * settled;

    // Fresco pigment, essentially untouched.
    //
    // An earlier version multiplied this by 1.9 and added white as the hands
    // closed. That destroyed the thing it was meant to celebrate: the detail in a
    // Michelangelo hand IS the tonal modelling, and blowing the highlights to
    // white flattens it into a glowing blob. Only a slight warm lift remains.
    float charge = smoothstep(0.4, 0.75, uProgress);
    vColor = pColor * (1.0 + 0.12 * charge);

    // Fade in on entry; hold once present.
    vAlpha = smoothstep(0.0, 0.18, t);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // uPointPx is the desired size in FRAMEBUFFER pixels at the cloud's resting
    // depth, computed on the CPU from actual particle spacing. The uCamZ/-mvz term
    // restores perspective attenuation so particles scattered toward the camera
    // during the morph still read as nearer.
    //
    // The earlier formula was uPointSize * (resolution.y/900) * (1/-mvz), copied
    // from the hero, which sits at z=1.6. At this camera's z=5 that evaluated to
    // roughly half a pixel, so the hands rendered as near-invisible specks.
    gl_PointSize = uPointPx * (uCamZ / -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    // Tight edge: soft enough to antialias the dot, hard enough that each particle
    // reads as a distinct point. The previous 0.3→0.5 falloff turned every particle
    // into a haze blob, and 30k overlapping blobs is fog, not a hand.
    float edge = 1.0 - smoothstep(0.42, 0.5, dist);
    gl_FragColor = vec4(vColor, vAlpha * edge);
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

  /**
   * The hand's real extent, which is NOT the extent of its source frame.
   *
   * `sampleImageToPoints` normalises against the image, and these crops carry about
   * 50% empty margin, the hand occupies roughly 180px of a 360px frame. Scaling by
   * the frame therefore rendered each hand at about half its intended size. Scaling
   * by the measured bounding box makes the on-screen size mean what it says, and
   * makes it independent of however tightly a future crop happens to be framed.
   */
  const handSpan = useMemo(() => {
    // Generated hands say how big the hand is; their long forearm must not count.
    if (cloud.refSpan) return cloud.refSpan;
    const b = getCloudBounds(cloud);
    return Math.max(b.maxX - b.minX, b.maxY - b.minY) || 2;
  }, [cloud]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  /** Portrait only: the hands first nearly touch, then draw apart to leave room for the resume. */
  const gapRef = useRef<{ sign: number; close: number; open: number } | null>(null);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uPointPx: { value: 3 },
      uCamZ: { value: 5 },
      uOrigin: { value: new THREE.Vector3() },
      uRest: { value: new THREE.Vector3() },
      uScale: { value: 1 },
      uExtent: { value: 1 },
    }),
    [],
  );

  // Recomputed on resize/orientation change: gap, entry origin, hand scale and
  // point size are all viewport-relative.
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;

    const cam = camera as THREE.PerspectiveCamera;
    const { worldPerPx, halfWidth, halfHeight } = measureViewport(
      cam,
      size.height,
    );

    // The hands stop well apart: the resume appears in the space between them.
    const gapPx = portrait
      ? Math.max(GAP_PX_PORTRAIT, size.height * PORTRAIT_OPEN_GAP)
      : Math.max(GAP_PX_DESKTOP, size.width * 0.5);
    const halfGap = (gapPx * worldPerPx) / 2;

    // Target on-screen size of the hand's longest edge, as a fraction of the
    // smaller viewport dimension.
    const targetSpan =
      (portrait ? HAND_SCALE_PORTRAIT : HAND_SCALE_LANDSCAPE) *
      Math.min(halfWidth, halfHeight) *
      2;

    // Divide by the hand's measured span, not by the frame's 2 units, so the
    // fraction above describes the hand itself.
    {
      const eb = getCloudBounds(cloud);
      mat.uniforms.uExtent.value =
        Math.hypot(Math.max(Math.abs(eb.minX), eb.maxX), Math.max(Math.abs(eb.minY), eb.maxY)) || 1;
    }
    let scale = targetSpan / handSpan;

    // The source crops end in a flat cut where the forearm was trimmed. Make sure
    // that cut always lands past the screen edge: grow the hand, if need be, until
    // it reaches from its resting fingertip to beyond the edge on its long axis.
    if (!cloud.refSpan) {
      const b = getCloudBounds(cloud);
      const extent = portrait ? b.maxY - b.minY : b.maxX - b.minX;
      const room = (portrait ? halfHeight : halfWidth) - halfGap;
      if (extent > 0) scale = Math.min(Math.max(scale, (room * 1.08) / extent), scale * 2.2);
    }
    mat.uniforms.uScale.value = scale;
    mat.uniforms.uCamZ.value = cam.position.z;

    // Point size from actual particle spacing, so the cloud reads as a continuous
    // surface at any source resolution: spacing in normalised units → world →
    // CSS px → framebuffer px. The 1.35 factor gives slight overlap; below ~1.2 the
    // grid shows through as visible gaps.
    const spacingWorld = (cloud.gridStep ?? 2 / 360) * scale;
    const spacingCssPx = spacingWorld / worldPerPx;
    mat.uniforms.uPointPx.value = Math.max(
      1,
      spacingCssPx * 1.35 * Math.min(window.devicePixelRatio || 1, 2),
    );

    if (portrait) {
      // Hands stand upright and approach vertically: tips meet across a vertical
      // gap, wrists exit through the top and bottom edges.
      const sign = side === "right" ? 1 : -1;
      mat.uniforms.uRest.value.set(0, sign * halfGap, 0);
      mat.uniforms.uOrigin.value.set(0, sign * halfHeight * 2.1, 0);
      gapRef.current = { sign, close: (GAP_PX_PORTRAIT * worldPerPx) / 2, open: halfGap };
    } else {
      gapRef.current = null;
      // Fresco geometry: God upper-right, Adam lower-left.
      const sign = side === "right" ? 1 : -1;
      mat.uniforms.uRest.value.set(sign * halfGap, 0, 0);
      mat.uniforms.uOrigin.value.set(
        sign * halfWidth * 1.9,
        sign * halfHeight * 1.1,
        0,
      );
    }
  }, [camera, size, portrait, side, cloud, handSpan]);

  useFrame((_state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uProgress.value = progressRef.current;
    const g = gapRef.current;
    if (g) {
      // Touch first (the Creation of Adam moment), then pull apart as the resume appears.
      const k = THREE.MathUtils.smoothstep(progressRef.current, 0.46, 0.68);
      mat.uniforms.uRest.value.set(0, g.sign * THREE.MathUtils.lerp(g.close, g.open, k), 0);
    }
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
        // NormalBlending, not Additive. Additive sums overlapping particles toward
        // white, so a dense cloud loses the fresco's tonal range exactly where it's
        // densest, the hand turns into a flat glowing silhouette. Normal blending
        // keeps each particle's sampled colour. Safe without depth sorting here
        // because the cloud is near-planar at rest (z jitter is only ±0.01).
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

// ─── Bloom ────────────────────────────────────────────────────────────────────

/**
 * Restrained bloom.
 *
 * Deliberately weak with a high luminance threshold: only the brightest lit edges
 * of the hands glow. The previous settings (intensity 1.15, threshold 0.12) bloomed
 * essentially every particle, which is the opposite of detail, it smeared the
 * silhouette and buried the modelling. Sharpness now comes from the particles
 * themselves; bloom only keeps the section from looking clinically flat.
 */
function HandBloom() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.32}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
    </EffectComposer>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export interface HandParticleCanvasProps {
  /** God's hand, tip anchored to origin, points toward -x (or -y in portrait). */
  godCloud: PointCloud;
  /** Adam's hand, tip anchored to origin, points toward +x (or +y in portrait). */
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
  const adaptiveDpr = useAdaptiveDpr(1.5);
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 55 }}
      dpr={adaptiveDpr.dpr}
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
      <AdaptiveDpr dpr={adaptiveDpr.dpr} onSlow={adaptiveDpr.stepDown} />
      <HandBloom />
    </Canvas>
  );
}
