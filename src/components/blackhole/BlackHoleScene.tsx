"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { LensEffect } from "@/lib/lab/LensEffect";
import { WIDE_LAYOUT, type BlackHoleLayout } from "./layouts";

/**
 * Black hole scene: built from the same ingredients as the rest of the site
 * (instanced points, a custom shader, Bloom), with the portrait's particles falling
 * into it as the page scrolls. The caller drives three targets (form, pull, collapse)
 * and the scene eases toward them, so scrubbed scroll input always glides.
 */

const TILT = 0.2;
const DISK_IN = 1.3;
const DISK_OUT = 3.4;
const HORIZON = 0.95;

const LayoutContext = createContext<BlackHoleLayout>(WIDE_LAYOUT);

/** Seeded PRNG so geometry is stable between renders (and render stays pure). */
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


/* Module-level mutators: the React compiler lint rule forbids mutating hook values in
   component scope, and useFrame callbacks are exactly that. */
function setU(mat: THREE.ShaderMaterial, name: string, v: number) {
  mat.uniforms[name].value = v;
}
function setRes(mat: THREE.ShaderMaterial, w: number, h: number) {
  (mat.uniforms.uRes.value as THREE.Vector2).set(w, h);
}
function easeCamera(cam: THREE.PerspectiveCamera, z: number, x: number, y: number) {
  cam.position.z += (z - cam.position.z) * 0.2;
  cam.position.x = x;
  cam.position.y = y;
  cam.lookAt(x, y, 0);
  cam.updateMatrixWorld();
}

const diskColorGlsl = /* glsl */ `
  vec3 diskColor(float r) {
    float t = clamp((r - ${DISK_IN.toFixed(2)}) / (${DISK_OUT.toFixed(2)} - ${DISK_IN.toFixed(2)}), 0.0, 1.0);
    vec3 hot = vec3(1.0, 0.93, 0.80);
    vec3 mid = vec3(1.0, 0.42, 0.14);
    vec3 cold = vec3(0.62, 0.07, 0.07);
    return t < 0.4 ? mix(hot, mid, t / 0.4) : mix(mid, cold, (t - 0.4) / 0.6);
  }
`;

const pointFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

/* ───────────────────────── accretion disk ───────────────────────── */

const diskVertex = /* glsl */ `
  attribute float aR;
  attribute float aA;
  attribute float aS;
  uniform float uTime;
  uniform float uAlpha;
  uniform float uCollapse;
  uniform float uSize;
  uniform float uDpr;
  uniform vec2 uRes;
  varying vec3 vColor;
  varying float vAlpha;
  ${diskColorGlsl}
  void main() {
    float omega = 1.3 / pow(aR, 1.5);
    float th = aA + uTime * omega;
    float c = clamp(uCollapse, 0.0, 1.0);
    float r = aR * (1.0 - c * c);
    vec3 pos = vec3(cos(th) * r, (aS - 0.5) * 0.10 * r * 0.4, sin(th) * r);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = max(0.5, -mv.z);
    gl_PointSize = clamp(uSize * (0.6 + aS * 0.9) * uDpr * (uRes.y / 900.0) * (10.0 / dist), 1.0, 9.0 * uDpr);
    float doppler = clamp(1.0 + 0.85 * cos(th), 0.25, 1.9);
    float inner = 1.0 + 1.4 * smoothstep(2.2, ${DISK_IN.toFixed(2)}, aR);
    vColor = diskColor(aR) * doppler * inner;
    vAlpha = uAlpha * (0.55 + aS * 0.45) * (1.0 - smoothstep(0.85, 1.0, c));
  }
`;

function Disk({ count, pullRef, collapseRef, formRef, dpr }: { count: number; pullRef: React.RefObject<number>; collapseRef: React.RefObject<number>; formRef: React.RefObject<number>; dpr: number }) {
  const L = useContext(LayoutContext);
  const { size } = useThree();
  const geo = useMemo(() => {
    const rnd = mulberry32(7);
    const pos = new Float32Array(count * 3);
    const aR = new Float32Array(count);
    const aA = new Float32Array(count);
    const aS = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      aR[i] = DISK_IN + Math.pow(rnd(), 1.8) * (DISK_OUT - DISK_IN);
      aA[i] = rnd() * Math.PI * 2;
      aS[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aR", new THREE.BufferAttribute(aR, 1));
    g.setAttribute("aA", new THREE.BufferAttribute(aA, 1));
    g.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: diskVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0.4 },
          uCollapse: { value: 0 },
          uSize: { value: 2.4 },
          uDpr: { value: dpr },
          uRes: { value: new THREE.Vector2(1, 1) },
        },
      }),
    [dpr],
  );
  useFrame((s) => {
    setU(mat, "uTime", s.clock.elapsedTime);
    setU(mat, "uCollapse", collapseRef.current);
    const p = pullRef.current;
    setU(mat, "uAlpha", (0.4 + 0.6 * THREE.MathUtils.smoothstep(p, 0.4, 1.0)) * THREE.MathUtils.smoothstep(formRef.current, 0.0, 0.6));
    setRes(mat, size.width, size.height);
  });
  return (
    <group position={[L.holeX, L.holeY, 0]} rotation={[TILT, 0, 0]}>
      <points geometry={geo} material={mat} frustumCulled={false} />
    </group>
  );
}

/* ───────────── lensed image of the far side of the disk (the arcs) ───────────── */

const haloVertex = /* glsl */ `
  attribute float aR;
  attribute float aA;
  attribute float aS;
  uniform float uTime;
  uniform float uAlpha;
  uniform float uCollapse;
  uniform float uSize;
  uniform float uDpr;
  uniform vec2 uRes;
  varying vec3 vColor;
  varying float vAlpha;
  ${diskColorGlsl}
  void main() {
    float omega = 1.3 / pow(aR, 1.5);
    float th = aA + uTime * omega;
    float c = clamp(uCollapse, 0.0, 1.0);
    // The bent image hugs the hole: nested thin rings facing the camera
    float rImg = (${(HORIZON + 0.22).toFixed(2)} + (aR - ${DISK_IN.toFixed(2)}) * 0.30) * (1.0 - c * c);
    vec3 pos = vec3(cos(th) * rImg, sin(th) * rImg * 1.04, 0.05);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = max(0.5, -mv.z);
    gl_PointSize = clamp(uSize * (0.6 + aS * 0.8) * uDpr * (uRes.y / 900.0) * (10.0 / dist), 1.0, 7.0 * uDpr);
    float arc = smoothstep(0.10, 0.62, abs(sin(th)));
    float doppler = clamp(1.0 + 0.7 * cos(th), 0.3, 1.7);
    vColor = diskColor(aR) * doppler * 1.25;
    vAlpha = uAlpha * arc * (0.5 + aS * 0.5) * (1.0 - smoothstep(0.85, 1.0, c));
  }
`;

function Halo({ count, pullRef, collapseRef, formRef, dpr }: { count: number; pullRef: React.RefObject<number>; collapseRef: React.RefObject<number>; formRef: React.RefObject<number>; dpr: number }) {
  const L = useContext(LayoutContext);
  const { size } = useThree();
  const geo = useMemo(() => {
    const rnd = mulberry32(21);
    const aR = new Float32Array(count);
    const aA = new Float32Array(count);
    const aS = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      aR[i] = DISK_IN + Math.pow(rnd(), 1.4) * (DISK_OUT - DISK_IN);
      aA[i] = rnd() * Math.PI * 2;
      aS[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aR", new THREE.BufferAttribute(aR, 1));
    g.setAttribute("aA", new THREE.BufferAttribute(aA, 1));
    g.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uAlpha: { value: 0.5 },
          uCollapse: { value: 0 },
          uSize: { value: 2.0 },
          uDpr: { value: dpr },
          uRes: { value: new THREE.Vector2(1, 1) },
        },
      }),
    [dpr],
  );
  useFrame((s) => {
    setU(mat, "uTime", s.clock.elapsedTime);
    setU(mat, "uCollapse", collapseRef.current);
    setU(mat, "uAlpha", (0.45 + 0.55 * THREE.MathUtils.smoothstep(pullRef.current, 0.4, 1.0)) * THREE.MathUtils.smoothstep(formRef.current, 0.0, 0.6));
    setRes(mat, size.width, size.height);
  });
  return (
    <group position={[L.holeX, L.holeY, 0]}>
      <points geometry={geo} material={mat} frustumCulled={false} />
    </group>
  );
}

/* ───────────────────── event horizon + photon ring ───────────────────── */

function Horizon({ collapseRef, formRef }: { collapseRef: React.RefObject<number>; formRef: React.RefObject<number> }) {
  const L = useContext(LayoutContext);
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    const c = collapseRef.current;
    // The whole horizon compresses to a point as the disk implodes
    if (groupRef.current) groupRef.current.scale.setScalar(Math.max(0.02, 1 - c * c * (3 - 2 * c) * 0.98));
    if (ringRef.current) {
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      // The ring flares as the disk collapses into it
      m.opacity = (0.75 + 0.25 * Math.sin(c * Math.PI)) * THREE.MathUtils.smoothstep(formRef.current, 0.0, 0.6);
    }
  });
  return (
    <group ref={groupRef} position={[L.holeX, L.holeY, 0]}>
      <mesh>
        <circleGeometry args={[HORIZON, 96]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh ref={ringRef} position={[0, 0, 0.03]}>
        <ringGeometry args={[HORIZON, HORIZON + 0.028, 128]} />
        <meshBasicMaterial color={new THREE.Color(1.6, 1.15, 0.8)} toneMapped={false} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ─────────────────── portrait particles that fall in ─────────────────── */

const portraitVertex = /* glsl */ `
  attribute float aLum;
  attribute float aS;
  attribute float aRt;
  uniform float uTime;
  uniform float uPull;
  uniform float uCollapse;
  uniform float uForm;
  uniform vec2 uHole;
  uniform float uSize;
  uniform float uDpr;
  uniform vec2 uRes;
  varying vec3 vColor;
  varying float vAlpha;
  ${diskColorGlsl}
  const float TILT = ${TILT.toFixed(3)};
  vec3 diskWorld(float th, float r, float lift) {
    vec3 p = vec3(cos(th) * r, lift, sin(th) * r);
    float cs = cos(TILT), sn = sin(TILT);
    p = vec3(p.x, p.y * cs - p.z * sn, p.y * sn + p.z * cs);
    return vec3(uHole, 0.0) + p;
  }
  void main() {
    // Gather from scattered dust into the portrait while the scene forms
    float f = smoothstep(0.0, 1.0, clamp(uForm * 1.35 - aS * 0.35, 0.0, 1.0));
    vec2 p0 = position.xy + vec2(cos(aS * 91.7), sin(aS * 53.3)) * (1.0 - f) * (2.0 + aS * 3.5);
    vec2 rel = p0 - uHole;
    float r0 = length(rel);
    float th0 = atan(rel.y, rel.x);

    // Particles nearer the hole go first; a little randomness keeps it organic
    float delay = clamp(r0 / 9.0, 0.0, 1.0) * 0.30 + aS * 0.14;
    float u = clamp((uPull * 1.45 - delay) / 0.62, 0.0, 1.0);
    float ease = u * u * (3.0 - 2.0 * u);
    float rr = mix(r0, aRt, pow(u, 1.7));
    float swirl = ease * (2.2 + 9.0 / max(aRt, 1.0));
    float settle = smoothstep(0.62, 1.0, u);
    float th = th0 + swirl + uTime * (1.3 / pow(aRt, 1.5)) * settle;

    vec3 falling = vec3(uHole + vec2(cos(th), sin(th)) * rr, 0.0);
    falling.z += sin(th * 2.0 + aS * 6.28) * 0.35 * ease * (1.0 - settle);
    vec3 pos = mix(falling, diskWorld(th, aRt, (aS - 0.5) * 0.04), settle);

    float c = clamp(uCollapse, 0.0, 1.0);
    vec3 hc = vec3(uHole, 0.0);
    pos = hc + (pos - hc) * (1.0 - c * c);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = max(0.5, -mv.z);
    float sz = uSize * (0.7 + aS * 0.8) * (1.0 - 0.35 * ease);
    gl_PointSize = clamp(sz * uDpr * (uRes.y / 900.0) * (10.0 / dist), 1.0, 7.0 * uDpr);

    vec3 base = vec3(0.95, 0.91, 0.86) * (0.5 + aLum * 1.5);
    float doppler = mix(1.0, clamp(1.0 + 0.85 * cos(th), 0.25, 1.9), settle);
    float streak = 1.0 + 1.6 * ease * (1.0 - settle);
    vColor = mix(base, diskColor(aRt) * 1.1, ease) * doppler * streak;
    // Falling particles dim as they reach the horizon instead of floating in front of it
    float toHole = length(pos.xy - uHole);
    float edge = mix(smoothstep(1.0, 1.7, toHole), 1.0, settle);
    vAlpha = 0.9 * edge * (0.15 + 0.85 * f) * (1.0 - smoothstep(0.85, 1.0, c));
  }
`;

function Portrait({ pullRef, collapseRef, formRef, dpr, maxPoints }: { pullRef: React.RefObject<number>; collapseRef: React.RefObject<number>; formRef: React.RefObject<number>; dpr: number; maxPoints: number }) {
  const L = useContext(LayoutContext);
  const { size } = useThree();
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const W = 260;
      const H = Math.round((img.height / img.width) * W);
      const cv = document.createElement("canvas");
      cv.width = W;
      cv.height = H;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, W, H);
      const px = ctx.getImageData(0, 0, W, H).data;
      // bounding box of the cut-out figure
      let minX = W, maxX = 0, minY = H, maxY = 0;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++)
          if (px[(y * W + x) * 4 + 3] > 140) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
      const bw = Math.max(1, maxX - minX);
      const bh = Math.max(1, maxY - minY);
      const scale = L.portraitH / bh;
      const rnd = mulberry32(99);
      const keep: number[] = [];
      for (let y = minY; y <= maxY; y++)
        for (let x = minX; x <= maxX; x++) {
          const i = (y * W + x) * 4;
          if (px[i + 3] < 140) continue;
          const lum = (px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114) / 255;
          if (lum < 0.07) continue;
          keep.push(i / 4, lum);
        }
      const total = keep.length / 2;
      const stride = Math.max(1, total / maxPoints);
      const out: { x: number; y: number; lum: number }[] = [];
      for (let k = 0; k < total; k += stride) {
        const idx = Math.floor(k);
        const p = keep[idx * 2];
        const lum = keep[idx * 2 + 1];
        const x = p % W;
        const y = Math.floor(p / W);
        out.push({
          x: ((x - minX - bw / 2) * scale) / 1 + L.portraitX + (rnd() - 0.5) * scale * 0.8,
          y: -((y - minY - bh / 2) * scale) + L.portraitY + (rnd() - 0.5) * scale * 0.8,
          lum,
        });
      }
      const n = out.length;
      const pos = new Float32Array(n * 3);
      const aLum = new Float32Array(n);
      const aS = new Float32Array(n);
      const aRt = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = out[i].x;
        pos[i * 3 + 1] = out[i].y;
        aLum[i] = out[i].lum;
        aS[i] = rnd();
        aRt[i] = DISK_IN + Math.pow(rnd(), 1.5) * (DISK_OUT - DISK_IN);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("aLum", new THREE.BufferAttribute(aLum, 1));
      g.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
      g.setAttribute("aRt", new THREE.BufferAttribute(aRt, 1));
      setGeo(g);
    };
    img.src = "/images/randel.webp";
    return () => {
      cancelled = true;
    };
  }, [maxPoints, L.portraitX, L.portraitY, L.portraitH]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: portraitVertex,
        fragmentShader: pointFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPull: { value: 0 },
          uCollapse: { value: 0 },
          uHole: { value: new THREE.Vector2(L.holeX, L.holeY) },
          uForm: { value: 0 },
          uSize: { value: 2.0 },
          uDpr: { value: dpr },
          uRes: { value: new THREE.Vector2(1, 1) },
        },
      }),
    [dpr, L.holeX, L.holeY],
  );
  useFrame((s) => {
    setU(mat, "uTime", s.clock.elapsedTime);
    setU(mat, "uForm", formRef.current);
    setU(mat, "uPull", pullRef.current);
    setU(mat, "uCollapse", collapseRef.current);
    setRes(mat, size.width, size.height);
  });
  if (!geo) return null;
  return <points geometry={geo} material={mat} frustumCulled={false} />;
}

/* ─────────────────────────── stars + rig ─────────────────────────── */

function Stars({ count }: { count: number }) {
  const geo = useMemo(() => {
    const rnd = mulberry32(5);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = rnd() * 2 - 1;
      const t = rnd() * Math.PI * 2;
      const r = 16 + rnd() * 24;
      const s = Math.sqrt(1 - u * u);
      pos[i * 3] = Math.cos(t) * s * r;
      pos[i * 3 + 1] = u * r * 0.6;
      pos[i * 3 + 2] = -Math.abs(Math.sin(t) * s * r) - 6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial color="#9a9aa6" size={0.07} sizeAttenuation transparent opacity={0.75} depthWrite={false} />
    </points>
  );
}

/** Where the scene should be. The scene eases toward these, so scrubbed input glides. */
export interface BlackHoleTargets {
  /** 0 -> 1: the portrait falls into the disk */
  pull: number;
  /** 0 -> 1: the disk implodes */
  collapse: number;
  /** 0 -> 1: dust gathers into the portrait and the hole fades in */
  form: number;
  /** 0 -> 1: the camera glides so the hole sits in the middle of the screen */
  center?: number;
}

/** Keeps the scene framed on any aspect, drives the lens warp and the damping. */
function Rig({ targets, pullRef, collapseRef, formRef, lens }: {
  targets: React.RefObject<BlackHoleTargets>;
  pullRef: React.RefObject<number>;
  collapseRef: React.RefObject<number>;
  formRef: React.RefObject<number>;
  lens: LensEffect;
}) {
  const L = useContext(LayoutContext);
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  const centerRef = useRef(0);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const t = targets.current;
    centerRef.current += ((t.center ?? 0) - centerRef.current) * (1 - Math.exp(-d * 5));
    pullRef.current += (t.pull - pullRef.current) * (1 - Math.exp(-d * 5.5));
    formRef.current += (t.form - formRef.current) * (1 - Math.exp(-d * 4));
    collapseRef.current += (t.collapse - collapseRef.current) * (1 - Math.exp(-d * 4.5));
    const aspect = size.width / size.height;
    const cam = camera as THREE.PerspectiveCamera;
    const halfFov = THREE.MathUtils.degToRad(cam.fov / 2);
    const z = Math.max(10, L.needW / (2 * Math.tan(halfFov) * aspect));
    easeCamera(cam, z, L.holeX * centerRef.current, L.holeY * centerRef.current);
    v.set(L.holeX, L.holeY, 0).project(camera);
    lens.setCenter(v.x * 0.5 + 0.5, v.y * 0.5 + 0.5);
    lens.setAspect(aspect);
    lens.setStrength(0.035 * (1 - collapseRef.current * 0.6));
  });
  return null;
}

export function BlackHoleCanvas({
  layout,
  targets,
  active = true,
  lowPower = false,
  portrait = false,
  className,
}: {
  layout: BlackHoleLayout;
  targets: React.RefObject<BlackHoleTargets>;
  /** When false the render loop stops (the section is off screen). */
  active?: boolean;
  lowPower?: boolean;
  /** Lab only: feed the hole with a particle portrait. */
  portrait?: boolean;
  className?: string;
}) {
  const pullRef = useRef(0);
  const collapseRef = useRef(0);
  const formRef = useRef(0);
  const lens = useMemo(() => new LensEffect(), []);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75) : 1;

  return (
    <Canvas
      className={className}
      frameloop={active ? "always" : "never"}
      dpr={[1, lowPower ? 1.25 : 1.75]}
      camera={{ position: [0, 0, 10], fov: 38, near: 0.1, far: 120 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <LayoutContext.Provider value={layout}>
        <color attach="background" args={["#000000"]} />
        <Stars count={lowPower ? 900 : 2200} />
        <Horizon collapseRef={collapseRef} formRef={formRef} />
        <Disk count={lowPower ? 9000 : 24000} pullRef={pullRef} collapseRef={collapseRef} formRef={formRef} dpr={dpr} />
        <Halo count={lowPower ? 2500 : 6000} pullRef={pullRef} collapseRef={collapseRef} formRef={formRef} dpr={dpr} />
        {portrait && <Portrait pullRef={pullRef} collapseRef={collapseRef} formRef={formRef} dpr={dpr} maxPoints={lowPower ? 6000 : 15000} />}
        <Rig targets={targets} pullRef={pullRef} collapseRef={collapseRef} formRef={formRef} lens={lens} />
        <EffectComposer multisampling={0}>
          <primitive object={lens} dispose={null} />
          <Bloom intensity={1.0} luminanceThreshold={0.18} luminanceSmoothing={0.35} mipmapBlur radius={0.6} />
        </EffectComposer>
      </LayoutContext.Provider>
    </Canvas>
  );
}
