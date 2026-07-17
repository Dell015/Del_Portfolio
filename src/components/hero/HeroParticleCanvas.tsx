"use client";

import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { PointCloud } from "@/lib/particles/sampleImageToPoints";
import { curlNoiseGLSL } from "@/lib/particles/curlNoise";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useVirtualScroll, LOCK_TRIGGER } from "@/lib/hooks/useVirtualScroll";
import { projects } from "@/lib/content/projects";
import { BigParticles } from "./BigParticles";
import { ProjectNodeCard } from "@/components/projects/sphere/ProjectNodeCard";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPHERE_RADIUS = 2.8;

// Scroll progress breakpoints (for pre-lock phases only)
const SP = {
  DISSOLVE_START: 0.05,
  DISSOLVE_END: 0.4,
};

function mapRange(value: number, inMin: number, inMax: number) {
  return Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
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
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i * 5;
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
  uniform float uSphere;
  uniform vec3 uMouse;
  uniform float uMouseActive;
  uniform float uPreReveal;
  uniform float uScale;

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
    // Phase: Gather — pull toward center
    if (uGather > 0.0) {
      float g = uGather * uGather; // ease-in
      pos = mix(pos, vec3(0.0), g * 0.85);
      // Add swirl as it gathers
      float angle = speed * 6.28 + uTime * 2.0 * g;
      float r = length(pos.xy) * (1.0 - g * 0.5);
      pos.x += cos(angle) * r * 0.1 * g;
      pos.z += sin(angle) * r * 0.1 * g;
    }

    // Phase: Condense — tight vortex at center
    if (uCondense > 0.0) {
      float swirlSpeed = 3.0 + uCondense * 5.0;
      float angle = speed * 20.0 + uTime * swirlSpeed;
      float r = 0.05 + (1.0 - uCondense) * 0.3 + sin(speed * 3.0) * 0.04;
      vec3 condensed = vec3(cos(angle) * r, sin(speed * 5.0 + uTime) * 0.1 * (1.0 - uCondense * 0.7), sin(angle) * r);
      pos = mix(pos, condensed, uCondense);
    }

    // Phase: Ring Compress — secondary ring closes inward (staggered behind condense)
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

    // Phase: Explode — burst outward
    if (uExplode > 0.0) {
      // Elastic ease-out
      float t = uExplode;
      float elastic = t < 0.001 ? 0.0 : pow(2.0, -10.0 * t) * sin((t - 0.1) * 5.0 * 3.14159) + 1.0;
      vec3 explodeDir = normalize(sphereTarget * uScale + vec3(speed * 0.5 - 0.25));
      pos = mix(pos, explodeDir * 5.0, elastic * 0.8);
    }

    // Phase: Scatter — settle into calm drift
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

    // Phase: Sphere formation — lerp to fibonacci sphere
    if (uSphere > 0.0) {
      float s = uSphere * uSphere * (3.0 - 2.0 * uSphere); // smoothstep
      pos = mix(pos, sphereTarget * uScale, s);
    }

    // === COLOR ===
    vec3 baseColor = mix(colorB, colorA, pProgress);
    float spherePhase = max(uGather, max(uCondense, max(uRingCompress, max(uExplode, max(uScatter, uSphere)))));
    // Shift toward pink/magenta during sphere phases
    vec3 sphereColor = mix(vec3(0.82, 0.16, 0.22), vec3(1.0, 0.18, 0.54), speed);
    vec3 ambientColor = mix(baseColor, vec3(0.82, 0.16, 0.22), 0.15 * uAmbient);
    vColor = mix(ambientColor, sphereColor, spherePhase * 0.7);

    // === ALPHA ===
    float dissolveAlpha = 1.0 - uDissolve * 0.5;
    float ambientAlpha = mix(dissolveAlpha, 0.6, uAmbient);
    // During sphere phases, bring alpha back up
    float sphereAlpha = mix(ambientAlpha, 0.8, spherePhase);
    // SMALL_FADE: fade to invisible (crossfade with big particles)
    vAlpha = sphereAlpha * (1.0 - uSmallFade);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point size — adjust for sphere phases
    float baseSize = uPointSize * (uResolution.y / 900.0);
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
    gl_FragColor = vec4(vColor, alpha * 0.85);
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
}

function ParticleSystem({
  cloudA, cloudB, progressRef, dissolveRef, ambientRef,
  gatherRef, condenseRef, ringCompressRef, explodeRef, smallFadeRef, scatterRef, sphereRef, scaleRef,
  mouseRef, mouseActiveRef, preRevealRef,
}: ParticleSystemProps) {
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

    // Per-particle speed variation
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      speeds[i] = 0.3 + Math.random() * 1.4;
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
      uSphere: { value: 0 },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uMouseActive: { value: 0 },
      uPreReveal: { value: 1 },
      uScale: { value: 1 },
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
    mat.uniforms.uGather.value = gatherRef.current;
    mat.uniforms.uCondense.value = condenseRef.current;
    mat.uniforms.uRingCompress.value = ringCompressRef.current;
    mat.uniforms.uExplode.value = explodeRef.current;
    mat.uniforms.uSmallFade.value = smallFadeRef.current;
    mat.uniforms.uScatter.value = scatterRef.current;
    mat.uniforms.uSphere.value = sphereRef.current;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uMouse.value.copy(mouseRef.current);
    mat.uniforms.uMouseActive.value = mouseActiveRef.current ? 1 : 0;
    mat.uniforms.uPreReveal.value = preRevealRef.current ? 1 : 0;
    mat.uniforms.uScale.value = scaleRef.current;
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


// ─── Project Nodes (rendered in same canvas) ───────────────────────────────────

interface ProjectNodesProps {
  sphereProgress: React.MutableRefObject<number>;
  onHover: (index: number | null, screenX: number, screenY: number) => void;
  isInteractingRef: React.MutableRefObject<boolean>;
  interactive: boolean;
  scaleRef: React.MutableRefObject<number>;
}

function ProjectNodes({ sphereProgress, onHover, isInteractingRef, interactive, scaleRef }: ProjectNodesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const nodePositions = useMemo(() => getNodePositions(projects.length, SPHERE_RADIUS + 0.15), []);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { camera, size } = useThree();
  // Smooth rotation speed that lerps to 0 on hover
  const rotSpeedRef = useRef(0.002);

  useFrame(() => {
    if (!groupRef.current) return;
    const show = sphereProgress.current > 0.7;

    // Rotation: slow to stop when a project is hovered or user is dragging
    const targetSpeed = (hoveredIndex !== null || isInteractingRef.current) ? 0 : 0.002;
    rotSpeedRef.current = THREE.MathUtils.lerp(rotSpeedRef.current, targetSpeed, 0.03);

    if (sphereProgress.current > 0.5) {
      groupRef.current.rotation.y += rotSpeedRef.current;
    }

    // Apply sphere scale from slider
    const s = scaleRef.current;
    groupRef.current.scale.setScalar(s);

    // Fade in/out + hover effects
    groupRef.current.children.forEach((child, i) => {
      if (!(child instanceof THREE.Group)) return;
      const targetOpacity = show ? 0.9 : 0;
      const isHovered = hoveredIndex === i;
      const dimmed = hoveredIndex !== null && !isHovered;

      child.children.forEach((mesh) => {
        if (mesh instanceof THREE.Mesh) {
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const finalOpacity = dimmed ? targetOpacity * 0.3 : targetOpacity;
          mat.opacity = THREE.MathUtils.lerp(mat.opacity, finalOpacity, 0.08);
        }
      });

      // Scale up hovered node
      const targetScale = isHovered ? 1.8 : 1;
      child.scale.setScalar(THREE.MathUtils.lerp(child.scale.x, targetScale, 0.1));
    });

    // Update card position while hovering
    if (hoveredIndex !== null && groupRef.current) {
      const nodeGroup = groupRef.current.children[hoveredIndex];
      if (nodeGroup) {
        const worldPos = new THREE.Vector3();
        nodeGroup.getWorldPosition(worldPos);
        worldPos.project(camera);
        const screenX = ((worldPos.x + 1) / 2) * size.width;
        const screenY = ((1 - worldPos.y) / 2) * size.height;
        onHover(hoveredIndex, screenX, screenY);
      }
    }
  });

  const handlePointerOver = (index: number) => {
    if (!interactive) return;
    setHoveredIndex(index);
    document.body.style.cursor = "pointer";
    if (groupRef.current) {
      const nodeGroup = groupRef.current.children[index];
      if (nodeGroup) {
        const worldPos = new THREE.Vector3();
        nodeGroup.getWorldPosition(worldPos);
        worldPos.project(camera);
        const screenX = ((worldPos.x + 1) / 2) * size.width;
        const screenY = ((1 - worldPos.y) / 2) * size.height;
        onHover(index, screenX, screenY);
      }
    }
  };

  const handlePointerOut = () => {
    setHoveredIndex(null);
    document.body.style.cursor = "auto";
    onHover(null, 0, 0);
  };

  return (
    <group ref={groupRef}>
      {nodePositions.map((pos, i) => (
        <group
          key={projects[i]?.slug || i}
          position={pos}
          onPointerOver={(e) => { e.stopPropagation(); handlePointerOver(i); }}
          onPointerOut={(e) => { e.stopPropagation(); handlePointerOut(); }}
        >
          {/* Invisible hitbox for raycasting (prevents flicker from overlapping visual meshes) */}
          <mesh visible={false}>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshBasicMaterial />
          </mesh>
          {/* Core orb — pink */}
          <mesh raycast={() => null}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial
              color="#ff2d8a"
              toneMapped={false}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Outer glow shell — softer pink */}
          <mesh raycast={() => null}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshBasicMaterial
              color="#c93b96"
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
    const duration = 4.5;
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

// ─── Camera Adjust ─────────────────────────────────────────────────────────────

function CameraAdjust({ sphereProgress, sphereInteractive }: { sphereProgress: React.MutableRefObject<number>; sphereInteractive: boolean }) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (sphereInteractive) return;
    const aspect = size.width / size.height;
    const baseZ = 1.6;
    const adjustedZ = aspect < 1
      ? baseZ + (1 - aspect) * 0.5
      : baseZ - (aspect - 1) * 0.08;
    (camera as THREE.PerspectiveCamera).position.z = Math.max(1.2, Math.min(2.2, adjustedZ));
    camera.updateProjectionMatrix();
  }, [camera, size, sphereInteractive]);

  // Smoothly zoom out when sphere phase starts — but stop once sphere is interactive
  // so OrbitControls has full authority over the camera
  useFrame(() => {
    if (sphereInteractive) return;
    const sp = sphereProgress.current;
    if (sp > 0) {
      const targetZ = 7;
      const t = sp * sp; // ease-in
      camera.position.z = THREE.MathUtils.lerp(1.6, targetZ, t);
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

    function screenToWorld(clientX: number, clientY: number): THREE.Vector3 {
      const rect = canvas.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
      const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
      vec.unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(dist));
    }

    function onMouseMove(e: MouseEvent) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
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
    // Listen on window — the canvas has pointerEvents:none so we use window
    // Only start drag on left-click, ignore wheel entirely
    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return;
      isDragging.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      isInteractingRef.current = true;
    }

    function onMouseMove(e: MouseEvent) {
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
      setTimeout(() => { isInteractingRef.current = false; }, 2000);
    }

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [camera, isInteractingRef]);

  // Damped rotation update
  useFrame(() => {
    const dampFactor = 0.08;
    spherical.current.theta += (targetSpherical.current.theta - spherical.current.theta) * dampFactor;
    spherical.current.phi += (targetSpherical.current.phi - spherical.current.phi) * dampFactor;
    spherical.current.radius = targetSpherical.current.radius;

    const pos = new THREE.Vector3().setFromSpherical(spherical.current);
    camera.position.copy(pos);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface HeroParticleCanvasProps {
  cloudA: PointCloud;
  cloudB: PointCloud;
  revealTriggered: boolean;
  onRevealComplete?: () => void;
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
  const mouseRef = useRef(new THREE.Vector3(999, 999, 0));
  const mouseActiveRef = useRef(false);
  const preRevealRef = useRef(true);

  // Sphere interactivity state
  const [sphereInteractive, setSphereInteractive] = useState(false);
  const [cardState, setCardState] = useState<{
    projectIndex: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  const { scrollProgress } = useSnapScroll();

  // Virtual scroll — only enabled after portrait reveal completes (prevents blocking hero scroll)
  const [revealDone, setRevealDone] = useState(false);
  const virtualScroll = useVirtualScroll(revealDone);

  // Force all phase refs to 0 on mount — prevents stale state from scroll restoration
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
      // Not yet revealed — no phases
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
      // Ambient drift — living background before lock zone
      dissolveRef.current = 1;
      ambientRef.current = Math.min(1, 0.3 + (sp - SP.DISSOLVE_END) * 0.5);
    } else {
      // In or past lock zone — keep dissolve/ambient at max
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

      // SPHERE_FORM: after lock releases (smallFade = 1), drive from continued scroll
      // Map scroll past the lock-trigger point → sphere formation
      // Use scatterRef as the "big particles appear" signal and sphereRef for formation
      if (virtualScroll.smallFadeRef.current >= 1) {
        // Once sphere is fully formed and interactive, freeze values so OrbitControls
        // rotation/zoom doesn't get overridden by scroll-linked phase changes
        if (sphereInteractive) {
          scatterRef.current = 1;
          sphereRef.current = 1;
        } else {
          // Post-unlock: map additional scroll distance to sphere
          const postLockScroll = scrollProgress - LOCK_TRIGGER;
          // Give 0.5 scroll-pages for scatter to settle, then 1.0 for sphere formation
          scatterRef.current = Math.min(1, Math.max(0, postLockScroll / 0.5));
          sphereRef.current = Math.min(1, Math.max(0, (postLockScroll - 0.5) / 1.0));
        }
      } else {
        scatterRef.current = 0;
        sphereRef.current = 0;
      }

      rafId = requestAnimationFrame(sync);
    }
    rafId = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(rafId);
  }, [scrollProgress, virtualScroll, sphereInteractive]);

  const handleComplete = useCallback(() => {
    preRevealRef.current = false;
    setRevealDone(true);
    onRevealComplete?.();
  }, [onRevealComplete]);

  // Track when sphere becomes interactive (sphere formed + post-lock)
  useEffect(() => {
    let rafId: number;
    function check() {
      const isFormed = sphereRef.current > 0.9;
      const isPostLock = virtualScroll.smallFadeRef.current >= 1;
      setSphereInteractive(isFormed && isPostLock);
      rafId = requestAnimationFrame(check);
    }
    rafId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(rafId);
  }, [virtualScroll.smallFadeRef]);

  // Handle node hover
  const handleNodeHover = useCallback((index: number | null, screenX: number, screenY: number) => {
    if (index === null) {
      setCardState(null);
      tintColorRef.current = null;
    } else {
      setCardState({ projectIndex: index, screenX, screenY });
      const project = projects[index];
      if (project) {
        tintColorRef.current = project.identityGradient[0];
      }
    }
  }, []);

  return (
    <div
      id="hero-particle-canvas"
      className="fixed inset-0 z-[1]"
      style={{ pointerEvents: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, 1.6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <CameraAdjust sphereProgress={sphereRef} sphereInteractive={sphereInteractive} />
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
        />
        <ProjectNodes
          sphereProgress={sphereRef}
          onHover={handleNodeHover}
          isInteractingRef={isInteractingRef}
          interactive={sphereInteractive}
          scaleRef={sphereScaleRef}
        />
        <BigParticles
          alphaRef={bigAlphaRef}
          sphereFormRef={sphereRef}
          tintColorRef={tintColorRef}
          sizeRef={particleSizeRef}
          scaleRef={sphereScaleRef}
        />
        <TweenDriver
          progressRef={progressRef}
          triggered={revealTriggered}
          onComplete={handleComplete}
        />
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
        {/* Custom drag-to-rotate — doesn't intercept scroll events */}
        {sphereInteractive && (
          <DragRotate
            isInteractingRef={isInteractingRef}
          />
        )}
      </Canvas>

      {/* HTML overlay for project node card */}
      {cardState && (
        <ProjectNodeCard
          project={projects[cardState.projectIndex]!}
          screenX={cardState.screenX}
          screenY={cardState.screenY}
          visible={true}
          onClose={() => {
            setCardState(null);
            tintColorRef.current = null;
          }}
        />
      )}

      {/* Sphere control sliders — right side, only when sphere is interactive */}
      {sphereInteractive && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 flex items-start gap-6 pointer-events-auto">
          {/* Sphere scale slider */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-widest text-white/40">
              Sphere
            </span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.01"
              defaultValue="1"
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                // Snap to max when threshold reached
                if (val >= 1.7) {
                  sphereScaleRef.current = 2;
                  e.target.value = "2";
                } else {
                  sphereScaleRef.current = val;
                }
              }}
              className="h-28 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-none"
              style={{
                writingMode: "vertical-lr",
                direction: "rtl",
                width: "3px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "2px",
                outline: "none",
              }}
              aria-label="Sphere scale"
            />
            <span className="font-[family-name:var(--font-mono)] text-[9px] text-white/25">⊙</span>
          </div>
          {/* Particle size slider */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-[family-name:var(--font-mono)] text-[9px] uppercase tracking-widest text-white/40">
              Particles
            </span>
            <input
              type="range"
              min="0.3"
              max="3"
              step="0.01"
              defaultValue="1"
              onChange={(e) => { particleSizeRef.current = parseFloat(e.target.value); }}
              className="h-28 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-none"
              style={{
                writingMode: "vertical-lr",
                direction: "rtl",
                width: "3px",
                background: "rgba(255,255,255,0.08)",
                borderRadius: "2px",
                outline: "none",
              }}
              aria-label="Particle size"
            />
            <span className="font-[family-name:var(--font-mono)] text-[9px] text-white/25">•</span>
          </div>
        </div>
      )}
    </div>
  );
}
