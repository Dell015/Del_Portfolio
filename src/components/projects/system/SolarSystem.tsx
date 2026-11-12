"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sites } from "@/lib/content/sites";
import {
  PLANETS,
  SUN_NODES,
  SUN_NODE_ORBIT,
  SUN_RADIUS,
  TILT,
  fibonacciDirs,
  focusCamera,
  orbitPoint,
  planetFocus,
  toSystem,
  type FocusState,
} from "@/lib/system/layout";

/**
 * The project solar system. Every project is a particle planet in its own colours;
 * its bright orbs are the project's main parts. A red sun (Randel) sits in the
 * middle. The scene forms out of the scattered particles left by the About
 * section (`formRef` 0 -> 1), then the camera flies between planets and the
 * focused planet turns to face the selected part.
 */

export interface SystemSelection {
  /** A planet index, or SUN (-1) for the sun and its site nodes. */
  planet: number;
  /** A part of the planet, or a site node on the sun. */
  part: number;
}

/** Screen positions the HTML overlay pins its labels to (canvas pixels). */
export interface SystemScreen {
  ready: boolean;
  parts: { x: number; y: number; front: boolean }[];
  planets: { x: number; y: number; r: number }[];
  sun: { x: number; y: number; r: number };
}

export function createSystemScreen(): SystemScreen {
  return { ready: false, parts: [], planets: [], sun: { x: 0, y: 0, r: 0 } };
}

/** The node ring leans a little off the orbit plane, so it reads as the sun's own. */
const NODE_RING_TILT: [number, number, number] = [0.32, 0, 0.14];
/** No sites listed: the one node is an open slot, drawn pale. */
const OPEN_SLOT = sites.length === 0;

interface SolarSystemProps {
  /** 0 hidden -> 1 visible (crossfades in as the small particles fade out). */
  alphaRef: React.MutableRefObject<number>;
  /** 0 scattered -> 1 formed. */
  formRef: React.MutableRefObject<number>;
  /** 0 on screen -> 1 scrolled away. */
  exitRef: React.MutableRefObject<number>;
  selRef: React.MutableRefObject<SystemSelection>;
  interactive: boolean;
  lowPower: boolean;
  reducedMotion: boolean;
  screenRef: React.MutableRefObject<SystemScreen>;
  onPickPlanet: (i: number) => void;
  onPickPart: (i: number) => void;
}

const _dummy = new THREE.Object3D();
const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _qId = new THREE.Quaternion();
const _spin = new THREE.Quaternion();
const _yAxis = new THREE.Vector3(0, 1, 0);
const _camPos = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _white = new THREE.Color("#ffffff");
const _m = new THREE.Matrix4();
const _n = new THREE.Vector3();
const _cam = new THREE.Vector3();

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

/** Random points in a shell around the old sphere's spot, in world space. */
function scatterWorld(count: number, rand: () => number): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const r = 6 * (0.3 + rand() * 0.7);
    out[i * 3] = r * Math.sin(ph) * Math.cos(th);
    out[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    out[i * 3 + 2] = r * Math.cos(ph);
  }
  return out;
}

interface Body {
  /** Formed positions, local to the body. */
  formed: Float32Array;
  /** Scattered start positions, local to the body (so formation lands exactly). */
  scatter: Float32Array;
  sizes: Float32Array;
  colors: Float32Array;
  count: number;
}

/** Builds one particle body: a fibonacci shell plus a looser inner layer. */
function buildBody(
  count: number,
  radius: number,
  centreSys: THREE.Vector3,
  colorA: THREE.Color,
  colorB: THREE.Color,
  seed: number,
  dotSize: number,
): Body {
  const rand = mulberry32(seed);
  const formed = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const ry = Math.sqrt(1 - y * y);
    const th = golden * i;
    // Most dots sit on the surface; a few float just inside it for depth.
    const depth = rand() < 0.82 ? 1 : 0.72 + rand() * 0.22;
    formed[i * 3] = Math.cos(th) * ry * radius * depth;
    formed[i * 3 + 1] = y * radius * depth;
    formed[i * 3 + 2] = Math.sin(th) * ry * radius * depth;
    sizes[i] = dotSize * (0.75 + rand() * 0.55) * (depth < 1 ? 0.7 : 1);
    // Latitude bands between the two theme colours, with a little noise.
    const t = THREE.MathUtils.clamp((y + 1) / 2 + (rand() - 0.5) * 0.35, 0, 1);
    c.copy(colorA).lerp(colorB, t);
    const shade = 0.42 + rand() * 0.28;
    colors[i * 3] = c.r * shade;
    colors[i * 3 + 1] = c.g * shade;
    colors[i * 3 + 2] = c.b * shade;
  }
  // Scatter starts in world space (where the About particles are), converted into
  // this body's frame. Bodies are unrotated while forming, so this lands exactly.
  const sw = scatterWorld(count, rand);
  const scatter = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    _v.set(sw[i * 3]!, sw[i * 3 + 1]!, sw[i * 3 + 2]!);
    toSystem(_v).sub(centreSys);
    scatter[i * 3] = _v.x;
    scatter[i * 3 + 1] = _v.y;
    scatter[i * 3 + 2] = _v.z;
  }
  // Shuffle, so drawing only the first N dots (distant planets) still covers the
  // whole sphere evenly.
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    for (const [arr, w] of [[formed, 3], [scatter, 3], [colors, 3], [sizes, 1]] as const) {
      for (let k = 0; k < w; k++) {
        const t = arr[i * w + k]!;
        arr[i * w + k] = arr[j * w + k]!;
        arr[j * w + k] = t;
      }
    }
  }
  return { formed, scatter, sizes, colors, count };
}

/**
 * Dots are GPU points (one vertex each, drawn round in the shader) instead of tiny
 * sphere meshes: thousands of 72-triangle spheres a few pixels wide is the slowest
 * thing a GPU can be asked to draw. Formation and drift also run in the shader, so
 * the CPU does no per-dot work at all.
 */
const dotVertex = /* glsl */ `
  attribute vec3 aScatter;
  attribute vec3 aColor;
  attribute float aSize;
  uniform float uForm;
  uniform float uTime;
  uniform float uK;
  varying vec3 vColor;
  void main() {
    vec3 p = mix(aScatter, position, uForm);
    float drift = 0.05 * (1.0 - uForm);
    float seed = aSize * 917.0 + position.x * 13.0;
    p += vec3(sin(uTime * 0.3 + seed), cos(uTime * 0.2 + seed * 0.7), sin(uTime * 0.25 + seed * 0.5)) * drift;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // World-space dot radius -> pixels (diameter) at this depth
    gl_PointSize = max(1.0, aSize * uK / -mv.z);
    vColor = aColor;
  }
`;

const dotFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = 1.0 - smoothstep(0.36, 0.5, d);
    gl_FragColor = vec4(vColor, a * uOpacity);
  }
`;

function makeDots(body: Body) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(body.formed, 3));
  geo.setAttribute("aScatter", new THREE.BufferAttribute(body.scatter, 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(body.colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(body.sizes, 1));
  const mat = new THREE.ShaderMaterial({
    vertexShader: dotVertex,
    fragmentShader: dotFragment,
    uniforms: { uForm: { value: 0 }, uTime: { value: 0 }, uK: { value: 900 }, uOpacity: { value: 0 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

/** Soft round falloff for the sun's corona (a sprite always faces the camera). */
function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.25, "rgba(255,255,255,0.35)");
    g.addColorStop(0.6, "rgba(255,255,255,0.08)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function OrbitRing({ radius, matRef }: { radius: number; matRef: (m: THREE.LineBasicMaterial | null) => void }) {
  const line = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const n = 160;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return new THREE.Line(geo, mat);
  }, [radius]);
  // Hand the material out on every render (cheap), but only free the GPU objects when
  // the ring itself is replaced. Disposing inside an effect keyed on `matRef` (a new
  // function each render) made three.js recompile the shader on every scroll tick.
  useEffect(() => {
    matRef(line.material as THREE.LineBasicMaterial);
  }, [line, matRef]);
  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );
  return <primitive object={line} />;
}

export function SolarSystem({
  alphaRef,
  formRef,
  exitRef,
  selRef,
  interactive,
  lowPower,
  reducedMotion,
  screenRef,
  onPickPlanet,
  onPickPart,
}: SolarSystemProps) {
  const { camera, size } = useThree();
  const perPlanet = lowPower ? 360 : 820;
  const sunCount = lowPower ? 120 : 220;

  // ── Static geometry ────────────────────────────────────────────────────────
  const built = useMemo(() => {
    const planets = PLANETS.map((p, i) => {
      const centre = orbitPoint(p.orbit, p.angle);
      const body = buildBody(
        perPlanet,
        p.radius,
        centre,
        new THREE.Color(p.colorA),
        new THREE.Color(p.colorB),
        0x51a7 + i * 977,
        p.radius * 0.0165,
      );
      const partDirs = fibonacciDirs(p.partCount, 0.78);
      return { layout: p, centre, body, partDirs, partColor: new THREE.Color(p.partColor) };
    });
    const sunCentre = new THREE.Vector3(0, 0, 0);
    const sun = buildBody(
      sunCount,
      SUN_RADIUS,
      sunCentre,
      new THREE.Color("#D11A2A"),
      new THREE.Color("#ff7a45"),
      0xbeef,
      0.026,
    );
    // The sun glows brighter than the planets.
    for (let i = 0; i < sun.colors.length; i++) sun.colors[i] = Math.min(1, sun.colors[i]! * 1.9);
    return {
      planets: planets.map((p) => ({ ...p, dots: makeDots(p.body) })),
      sun,
      sunDots: makeDots(sun),
    };
  }, [perPlanet, sunCount]);

  // ── Refs to scene objects ──────────────────────────────────────────────────
  const planetGroups = useRef<(THREE.Group | null)[]>([]);
  const partMeshes = useRef<(THREE.InstancedMesh | null)[]>([]);
  const partMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const ringMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const haloRef = useRef<THREE.Sprite>(null);
  const haloMat = useRef<THREE.SpriteMaterial>(null);
  const glow = useMemo(() => makeGlowTexture(), []);
  useEffect(() => () => glow.dispose(), [glow]);
  const systemRef = useRef<THREE.Group>(null);

  const timeRef = useRef(0);
  const { viewport } = useThree();
  const sunDots = useRef<THREE.Points | null>(null);
  // Site nodes around the sun.
  const nodeGroup = useRef<THREE.Group>(null);
  const nodeMesh = useRef<THREE.InstancedMesh>(null);
  const nodeMat = useRef<THREE.MeshBasicMaterial>(null);
  const nodeRingMat = useRef<THREE.LineBasicMaterial | null>(null);
  /** Turn of the node ring: drifts on its own, swings the selected node forward when the sun is focused. */
  const nodeSpin = useRef(0);
  const nodeMix = useRef<number[]>(Array.from({ length: SUN_NODES }, () => 0));
  const sunMix = useRef(0);
  const planetDots = useRef<(THREE.Points | null)[]>([]);

  useEffect(
    () => () => {
      for (const o of [built.sunDots, ...built.planets.map((p) => p.dots)]) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    },
    [built],
  );
  /** Per-planet "how focused" 0..1, eased. */
  const focusMix = useRef<number[]>(PLANETS.map((_, i) => (i === 0 ? 1 : 0)));
  /** Per-part highlight 0..1 on the focused planet, eased. */
  const partMix = useRef<number[][]>(PLANETS.map((p) => Array.from({ length: p.partCount }, () => 0)));

  // Part orb colours (set once).
  useEffect(() => {
    built.planets.forEach((p, i) => {
      const parts = partMeshes.current[i];
      if (!parts) return;
      const cols = new Float32Array(p.layout.partCount * 3);
      for (let k = 0; k < p.layout.partCount; k++) {
        cols[k * 3] = p.partColor.r;
        cols[k * 3 + 1] = p.partColor.g;
        cols[k * 3 + 2] = p.partColor.b;
      }
      parts.instanceColor = new THREE.InstancedBufferAttribute(cols, 3);
      parts.instanceColor.needsUpdate = true;
    });
  }, [built]);

  // ── Picking: click a part on the focused planet, or another planet ─────────
  useEffect(() => {
    if (!interactive) {
      document.body.style.cursor = "auto";
      return;
    }
    const canvas = document.querySelector("#hero-particle-canvas canvas") as HTMLElement | null;
    let down: { x: number; y: number } | null = null;
    const isUi = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("a, button, input, textarea, [data-system-ui]");

    function hit(clientX: number, clientY: number): { kind: "part" | "planet"; index: number } | null {
      const s = screenRef.current;
      if (!s.ready || !canvas) return null;
      const r = canvas.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      let best: { kind: "part" | "planet"; index: number } | null = null;
      let bestD = 30;
      s.parts.forEach((p, i) => {
        if (!p.front) return;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < bestD) {
          bestD = d;
          best = { kind: "part", index: i };
        }
      });
      if (best) return best;
      const focused = selRef.current.planet;
      // The sun is clickable too (its nodes are the smaller sites).
      if (focused >= 0) {
        const d = Math.hypot(s.sun.x - x, s.sun.y - y);
        if (d < Math.max(28, s.sun.r + 12)) return { kind: "planet", index: -1 };
      }
      s.planets.forEach((p, i) => {
        if (i === focused) return;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < Math.max(26, p.r + 10) && d < bestD + p.r) {
          bestD = d;
          best = { kind: "planet", index: i };
        }
      });
      return best;
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      if (isUi(e.target)) return;
      document.body.style.cursor = hit(e.clientX, e.clientY) ? "pointer" : "auto";
    }
    function onDown(e: PointerEvent) {
      down = { x: e.clientX, y: e.clientY };
    }
    function onUp(e: PointerEvent) {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 8 || isUi(e.target)) return;
      const h = hit(e.clientX, e.clientY);
      if (!h) return;
      if (h.kind === "part") onPickPart(h.index);
      else onPickPlanet(h.index);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "auto";
    };
  }, [interactive, onPickPart, onPickPlanet, screenRef, selRef]);

  // ── Per frame ─────────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    timeRef.current += dt;
    const time = timeRef.current;
    const alpha = alphaRef.current;
    const sp = formRef.current;
    const s = sp * sp * (3 - 2 * sp);
    const exit = exitRef.current;
    const sel = selRef.current;
    // "Formed enough" to explore: coming back from a case study can park the
    // scene a hair short of 1, which must still count.
    const formed = s > 0.97;

    // Dot size: world radius -> pixels needs the drawing-buffer height and the fov.
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 60;
    const k = (size.height * viewport.dpr) / Math.tan(THREE.MathUtils.degToRad(fov) / 2);
    const setDots = (o: THREE.Points, opacity: number) => {
      const u = (o.material as THREE.ShaderMaterial).uniforms;
      u.uForm!.value = s;
      u.uTime!.value = time;
      u.uK!.value = k;
      u.uOpacity!.value = opacity;
    };

    // Sun: slow turn and a soft pulse.
    const sun = sunDots.current;
    if (sun) {
      sun.rotation.y += dt * 0.08;
      sun.scale.setScalar(1 + Math.sin(time * 1.4) * 0.03);
      setDots(sun, alpha * 0.75 * (1 - exit * 0.4));
    }
    const sunFocused = sel.planet < 0;
    sunMix.current = THREE.MathUtils.damp(sunMix.current, sunFocused ? 1 : 0, 3, dt);
    const sm = sunMix.current;
    if (haloMat.current) {
      // Softer glow up close, so the nodes stay readable against it.
      haloMat.current.opacity = alpha * s * 0.55 * (1 + Math.sin(time * 1.4) * 0.12) * (1 - exit * 0.4) * (1 - sm * 0.45);
    }

    const swell = 1 + exit * exit * 0.6;
    const screen = screenRef.current;
    screen.planets.length = PLANETS.length;

    built.planets.forEach((p, i) => {
      const group = planetGroups.current[i];
      if (!group) return;
      const isFocus = i === sel.planet;
      const fm = focusMix.current;
      fm[i] = THREE.MathUtils.damp(fm[i]!, isFocus ? 1 : 0, 3, dt);

      // Orientation: forming = upright (so scatter lands), focused = face the
      // selected part toward the camera, otherwise a slow spin on its own axis.
      if (!formed) {
        group.quaternion.slerp(_qId, 1 - Math.exp(-dt * 6));
      } else if (isFocus && interactive) {
        const dir = p.partDirs[sel.part] ?? p.partDirs[0];
        if (dir) {
          group.getWorldPosition(_w);
          _v.copy(camera.position).sub(_w);
          toSystem(_v).normalize();
          // Turn the part slightly toward the text column so its label stays clear of the edge.
          _q.setFromUnitVectors(dir, _v);
          group.quaternion.slerp(_q, reducedMotion ? 1 : 1 - Math.exp(-dt * 3.2));
        }
      } else if (!reducedMotion) {
        _spin.setFromAxisAngle(_yAxis, dt * 0.18);
        group.quaternion.multiply(_spin);
      }
      group.scale.setScalar(swell);

      // A background planet that drifts behind the text column fades right down, so
      // the words always sit on plain space.
      const prev = screen.planets[i];
      const wide = size.width / size.height >= 0.95;
      const behindText = wide && prev ? THREE.MathUtils.clamp((size.width * 0.42 - prev.x + prev.r) / (prev.r + 60), 0, 1) : 0;
      const textFade = 1 - behindText * (1 - fm[i]!) * 0.85;
      const dots = planetDots.current[i];
      if (dots) {
        setDots(dots, alpha * (0.22 + fm[i]! * 0.43) * (1 - exit * 0.4) * textFade);
        // Distant planets are a few dozen pixels wide: draw a sample of their dots.
        dots.geometry.setDrawRange(0, Math.round(p.body.count * (0.4 + fm[i]! * 0.6)));
      }
      const ring = ringMats.current[i];
      if (ring) {
        ring.opacity = alpha * s * (0.035 + fm[i]! * 0.14);
        ring.color.set(p.layout.colorA).lerp(_white, 0.55 - fm[i]! * 0.35);
      }

      // Part orbs: always visible (they show how much is going on in a project),
      // the selected one on the focused planet swells and pulses.
      const parts = partMeshes.current[i];
      const pm = partMix.current[i]!;
      if (parts) {
        for (let k = 0; k < p.layout.partCount; k++) {
          const active = isFocus && k === sel.part && interactive;
          pm[k] = THREE.MathUtils.damp(pm[k]!, active ? 1 : 0, 6, dt);
          const dir = p.partDirs[k]!;
          const r = p.layout.radius * (1.07 + pm[k]! * 0.05);
          const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 2.4 + k * 1.3) * 0.08 * (0.4 + pm[k]!);
          const sz = p.layout.radius * (0.04 + fm[i]! * 0.012 + pm[k]! * 0.045) * pulse;
          _dummy.position.set(dir.x * r * s, dir.y * r * s, dir.z * r * s);
          _dummy.scale.setScalar(sz * Math.max(0.0001, s));
          _dummy.updateMatrix();
          parts.setMatrixAt(k, _dummy.matrix);
        }
        parts.instanceMatrix.needsUpdate = true;
      }
      const pmat = partMats.current[i];
      if (pmat) pmat.opacity = alpha * s * (0.5 + fm[i]! * 0.35) * (1 - exit * 0.4) * textFade;

      // Screen positions for the overlay and picking.
      group.getWorldPosition(_w);
      const centre = _w.clone();
      _w.project(camera);
      const sx = ((_w.x + 1) / 2) * size.width;
      const sy = ((1 - _w.y) / 2) * size.height;
      // Approximate on-screen radius from a point on the planet's edge.
      _v.copy(camera.up).multiplyScalar(p.layout.radius * swell).add(centre).project(camera);
      const edgeY = ((1 - _v.y) / 2) * size.height;
      screen.planets[i] = { x: sx, y: sy, r: Math.abs(edgeY - sy) };

      if (isFocus && parts) {
        // Read each orb's real world position (instance matrix x mesh matrix), so the
        // HTML markers sit exactly on what is drawn.
        parts.updateWorldMatrix(true, false);
        screen.parts.length = p.layout.partCount;
        const toCam = _cam.copy(camera.position).sub(centre);
        for (let k = 0; k < p.layout.partCount; k++) {
          parts.getMatrixAt(k, _m);
          _m.premultiply(parts.matrixWorld);
          _v.setFromMatrixPosition(_m);
          const front = _n.copy(_v).sub(centre).dot(toCam) > 0.12 * p.layout.radius * toCam.length();
          _v.project(camera);
          screen.parts[k] = {
            x: ((_v.x + 1) / 2) * size.width,
            y: ((1 - _v.y) / 2) * size.height,
            front,
          };
        }
      }
    });

    // Sun on screen
    _w.set(0, 0, 0).project(camera);
    const sunX = ((_w.x + 1) / 2) * size.width;
    const sunY = ((1 - _w.y) / 2) * size.height;
    _v.copy(camera.up).multiplyScalar(SUN_RADIUS).project(camera);
    screen.sun = { x: sunX, y: sunY, r: Math.abs(((1 - _v.y) / 2) * size.height - sunY) };

    // ── Site nodes: a ring of orbs around the sun, one per smaller build ──
    const ng = nodeGroup.current;
    const nodes = nodeMesh.current;
    if (ng && nodes) {
      const step = (Math.PI * 2) / SUN_NODES;
      if (sunFocused && interactive && formed) {
        // Swing the selected node round to the camera's side (a little to the left of
        // the sun, so its label clears the glow).
        ng.updateWorldMatrix(true, false);
        _v.copy(camera.position);
        ng.worldToLocal(_v);
        const want = Math.atan2(_v.z, _v.x) + 0.55 - sel.part * step;
        let d = (want - nodeSpin.current) % (Math.PI * 2);
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        nodeSpin.current += d * (reducedMotion ? 1 : 1 - Math.exp(-dt * 3));
      } else if (!reducedMotion) {
        nodeSpin.current += dt * 0.12;
      }
      const nm = nodeMix.current;
      for (let k = 0; k < SUN_NODES; k++) {
        const active = sunFocused && k === sel.part && interactive;
        nm[k] = THREE.MathUtils.damp(nm[k]!, active ? 1 : 0, 6, dt);
        const a = nodeSpin.current + k * step;
        const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 2.2 + k * 1.7) * (OPEN_SLOT ? 0.18 : 0.08);
        const sz = SUN_RADIUS * (0.09 + sm * 0.03 + nm[k]! * 0.08) * pulse;
        _dummy.position.set(Math.cos(a) * SUN_NODE_ORBIT * s, 0, Math.sin(a) * SUN_NODE_ORBIT * s);
        _dummy.scale.setScalar(sz * Math.max(0.0001, s));
        _dummy.updateMatrix();
        nodes.setMatrixAt(k, _dummy.matrix);
      }
      nodes.instanceMatrix.needsUpdate = true;
      if (nodeMat.current) {
        nodeMat.current.opacity = alpha * s * (OPEN_SLOT ? 0.35 + sm * 0.3 : 0.6 + sm * 0.35) * (1 - exit * 0.4);
      }
      if (nodeRingMat.current) {
        nodeRingMat.current.opacity = alpha * s * (0.05 + sm * 0.2);
        nodeRingMat.current.color.set("#ff7a45").lerp(_white, 0.35);
      }
      if (sunFocused) {
        // Node positions for the overlay's labels and for picking.
        nodes.updateWorldMatrix(true, false);
        screen.parts.length = SUN_NODES;
        const toCam = _cam.copy(camera.position);
        for (let k = 0; k < SUN_NODES; k++) {
          nodes.getMatrixAt(k, _m);
          _m.premultiply(nodes.matrixWorld);
          _v.setFromMatrixPosition(_m);
          // Hidden only while it passes behind the sun.
          const front = _n.copy(_v).normalize().dot(_w.copy(toCam).normalize()) > -0.55;
          _v.project(camera);
          screen.parts[k] = { x: ((_v.x + 1) / 2) * size.width, y: ((1 - _v.y) / 2) * size.height, front };
        }
      }
    }
    screen.ready = interactive && formed;
  });

  return (
    <group ref={systemRef} rotation={[TILT, 0, 0]}>
      {/* Sun */}
      <primitive
        object={built.sunDots}
        ref={(o: THREE.Points | null) => {
          sunDots.current = o;
        }}
      />
      {/* Site nodes on their own ring around the sun */}
      <group ref={nodeGroup} rotation={NODE_RING_TILT}>
        <OrbitRing
          radius={SUN_NODE_ORBIT}
          matRef={(m) => {
            nodeRingMat.current = m;
          }}
        />
        <instancedMesh ref={nodeMesh} args={[undefined, undefined, SUN_NODES]} frustumCulled={false}>
          <sphereGeometry args={[1, 14, 14]} />
          <meshBasicMaterial
            ref={nodeMat}
            color={OPEN_SLOT ? "#ffffff" : "#ffb199"}
            toneMapped={false}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </instancedMesh>
      </group>
      <sprite ref={haloRef} scale={[SUN_RADIUS * 6, SUN_RADIUS * 6, 1]}>
        <spriteMaterial
          ref={haloMat}
          map={glow}
          color="#D11A2A"
          toneMapped={false}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {built.planets.map((p, i) => (
        <group key={p.layout.slug}>
          <OrbitRing
            radius={p.layout.orbit}
            matRef={(m) => {
              ringMats.current[i] = m;
            }}
          />
          <group
            position={p.centre}
            ref={(g) => {
              planetGroups.current[i] = g;
            }}
          >
            <primitive
              object={p.dots}
              ref={(o: THREE.Points | null) => {
                planetDots.current[i] = o;
              }}
            />
            <instancedMesh
              ref={(m) => {
                partMeshes.current[i] = m;
              }}
              args={[undefined, undefined, p.layout.partCount]}
              frustumCulled={false}
            >
              <sphereGeometry args={[1, 14, 14]} />
              <meshBasicMaterial
                ref={(m) => {
                  partMats.current[i] = m;
                }}
                color="#ffffff"
                toneMapped={false}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </instancedMesh>
          </group>
        </group>
      ))}
    </group>
  );
}

// ─── Camera ─────────────────────────────────────────────────────────────────

/** Camera depth at the hero, which depends on the viewport's aspect ratio. */
function heroZ(aspect: number) {
  const baseZ = 1.6;
  const z = aspect < 1 ? baseZ + (1 - aspect) * 0.5 : baseZ - (aspect - 1) * 0.08;
  return Math.max(1.2, Math.min(2.2, z));
}

function shortestAngle(from: number, to: number) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/**
 * Owns the camera for the whole canvas. At the hero it sits exactly where the
 * portrait expects it; as the system forms it travels to the selected planet;
 * once the system is explorable it flies along the orbits between planets.
 * The flight eases the orbit angle and radius (not a straight line), so moving to
 * another planet sweeps around the sun instead of cutting through it.
 */
export function SystemCamera({
  formRef,
  selRef,
  reducedMotion,
}: {
  formRef: React.MutableRefObject<number>;
  selRef: React.MutableRefObject<SystemSelection>;
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  const cur = useRef<FocusState>(planetFocus(0));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const aspect = size.width / size.height;
    const sp = formRef.current;
    const target = planetFocus(selRef.current.planet, cur.current.angle);

    if (sp <= 0.001) {
      // Hero / About: straight on, at the portrait's depth.
      cur.current = { ...target };
      camera.position.set(0, 0, heroZ(aspect));
      camera.lookAt(0, 0, 0);
      return;
    }

    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 2.4);
    const c = cur.current;
    c.angle += shortestAngle(c.angle, target.angle) * k;
    c.orbit += (target.orbit - c.orbit) * k;
    c.radius += (target.radius - c.radius) * k;
    focusCamera(c, aspect, _camPos, _camTarget);

    // Blend from the hero camera while the system forms (and back when scrolling up).
    const e = sp * sp * (3 - 2 * sp);
    camera.position.set(0, 0, heroZ(aspect)).lerp(_camPos, e);
    _v.set(0, 0, 0).lerp(_camTarget, e);
    camera.lookAt(_v);
  });

  return null;
}
