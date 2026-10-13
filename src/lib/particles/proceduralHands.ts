/**
 * Procedural hands for the resume section.
 *
 * The Creation of Adam is the REFERENCE here, not the source: no pixel of the
 * fresco is sampled. Each hand is modelled from round-cone primitives (palm rods,
 * three-joint fingers, a thumb, a forearm), rendered as an orthographic
 * heightfield with Lambert shading, and emitted as a particle cloud.
 *
 * Because it is generated, the forearm can be any length. The caller works out how
 * far the arm must run for the screen it is on, so the arm always leaves through
 * the edge of the viewport instead of ending in a flat cut.
 *
 * Units match the rest of the particle code: 1 unit = 180 px of the old 360 px
 * frame. A hand (wrist to fingertip) is about 1 unit long.
 */

import type { PointCloud } from "./sampleImageToPoints";

export type HandKind = "god" | "adam";

/** Wrist-to-fingertip length, the reference size the canvas scales by. */
export const HAND_LENGTH = 1.02;

export interface HandOptions {
  kind: HandKind;
  /** Forearm length beyond the wrist, in cloud units. */
  armLength: number;
  /** Distance between neighbouring particles, in cloud units. */
  gridStep: number;
  /** Final quarter-turn for portrait screens, in radians. */
  rotation?: number;
  seed?: number;
}

interface Prim {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  ra: number; rb: number;
  /** Primitives in one group are one object (a finger); used for crease shading. */
  group: number;
  /** Nail on the last segment of a finger. */
  nail?: boolean;
}

interface FingerSpec {
  base: [number, number, number];
  /** Per segment: length, absolute curl away from the viewer (deg), in-plane angle (deg). */
  segs: [number, number, number][];
  radii: number[];
}

interface Pose {
  fingers: FingerSpec[];
  thumb: FingerSpec;
  /** Forearm direction below the hand axis, degrees (positive = drops away). */
  wrist: number;
}

const d2r = Math.PI / 180;

function adamPose(): Pose {
  return {
    wrist: 12,
    fingers: [
      { base: [0.5, 0.15, 0.02], radii: [0.058, 0.051, 0.046, 0.039],
        segs: [[0.24, 5, 2], [0.14, 11, 1], [0.11, 20, 0]] },
      { base: [0.52, 0.05, 0.02], radii: [0.06, 0.053, 0.048, 0.04],
        segs: [[0.26, 24, 0], [0.15, 40, -1], [0.11, 48, -2]] },
      { base: [0.5, -0.045, 0.015], radii: [0.056, 0.05, 0.045, 0.038],
        segs: [[0.235, 34, -2], [0.14, 50, -3], [0.105, 56, -4]] },
      { base: [0.47, -0.13, 0.01], radii: [0.049, 0.044, 0.04, 0.034],
        segs: [[0.185, 40, -5], [0.11, 56, -6], [0.09, 60, -7]] },
    ],
    thumb: { base: [0.17, 0.13, 0.06], radii: [0.075, 0.063, 0.054, 0.045],
      segs: [[0.2, 6, 52], [0.13, 12, 40], [0.1, 20, 30]] },
  };
}

function godPose(): Pose {
  return {
    wrist: -8,
    fingers: [
      { base: [0.5, 0.15, 0.02], radii: [0.058, 0.051, 0.046, 0.039],
        segs: [[0.25, 0, 1], [0.145, 2, 0], [0.115, 5, -1]] },
      { base: [0.52, 0.05, 0.02], radii: [0.06, 0.053, 0.048, 0.04],
        segs: [[0.26, 32, 0], [0.15, 50, -1], [0.11, 54, -2]] },
      { base: [0.5, -0.045, 0.015], radii: [0.056, 0.05, 0.045, 0.038],
        segs: [[0.235, 40, -2], [0.14, 58, -3], [0.105, 62, -4]] },
      { base: [0.47, -0.13, 0.01], radii: [0.049, 0.044, 0.04, 0.034],
        segs: [[0.185, 46, -5], [0.11, 62, -6], [0.09, 64, -7]] },
    ],
    thumb: { base: [0.17, 0.13, 0.06], radii: [0.075, 0.063, 0.054, 0.045],
      segs: [[0.2, 12, 58], [0.13, 20, 46], [0.1, 28, 36]] },
  };
}

function chain(spec: FingerSpec, group: number, out: Prim[]): { x: number; y: number; r: number } {
  let [x, y, z] = spec.base;
  for (let i = 0; i < spec.segs.length; i++) {
    const [len, curl, fan] = spec.segs[i];
    const c = curl * d2r;
    const f = fan * d2r;
    const nx = x + len * Math.cos(c) * Math.cos(f);
    const ny = y + len * Math.cos(c) * Math.sin(f);
    const nz = z - len * Math.sin(c);
    out.push({
      ax: x, ay: y, az: z, bx: nx, by: ny, bz: nz,
      ra: spec.radii[i], rb: spec.radii[i + 1], group,
      nail: i === spec.segs.length - 1,
    });
    x = nx; y = ny; z = nz;
  }
  return { x, y, r: spec.radii[spec.radii.length - 1] };
}

function buildPrims(kind: HandKind, armLength: number): { prims: Prim[]; tip: { x: number; y: number } } {
  const pose = kind === "adam" ? adamPose() : godPose();
  const prims: Prim[] = [];
  let g = 0;

  // Back of the hand: four metacarpal rods fanning out from the wrist to the
  // knuckles, with a wrist block under them. Rods leave faint tendon grooves.
  const rods: [number, number, number][] = [
    [0.12, 0.15, 0.066],
    [0.05, 0.05, 0.07],
    [-0.02, -0.045, 0.066],
    [-0.09, -0.13, 0.058],
  ];
  const palm = g++;
  for (const [wy, ky, r] of rods) {
    prims.push({ ax: 0.04, ay: wy, az: 0.045, bx: 0.5, by: ky, bz: 0.05, ra: r, rb: r * 1.02, group: palm });
  }
  prims.push({ ax: -0.02, ay: 0, az: 0, bx: 0.16, by: 0, bz: 0.02, ra: 0.15, rb: 0.15, group: palm });

  // Forearm. Leaves the wrist at the pose's angle and just keeps going.
  const w = pose.wrist * d2r;
  const dir = { x: -Math.cos(w), y: -Math.sin(w) };
  const arm = g++;
  prims.push({
    ax: 0, ay: 0, az: 0,
    bx: dir.x * armLength, by: dir.y * armLength, bz: -0.02,
    ra: 0.15, rb: 0.22, group: arm,
  });

  const thumbGroup = g++;
  chain(pose.thumb, thumbGroup, prims);

  let tip = { x: 0, y: 0 };
  pose.fingers.forEach((f, i) => {
    const end = chain(f, g++, prims);
    if (i === 0) tip = { x: end.x + end.r, y: end.y };
  });
  return { prims, tip };
}

// Deterministic RNG so the cloud (and therefore the look) is stable between loads.
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

function ramp(t: number, out: number[]) {
  // shadow → mid → light, warm fresco flesh.
  const S = [0.27, 0.15, 0.11];
  const M = [0.76, 0.55, 0.43];
  const L = [0.97, 0.84, 0.71];
  const k = Math.min(1, Math.max(0, t));
  const a = k < 0.5 ? S : M;
  const b = k < 0.5 ? M : L;
  const u = k < 0.5 ? k * 2 : (k - 0.5) * 2;
  out[0] = a[0] + (b[0] - a[0]) * u;
  out[1] = a[1] + (b[1] - a[1]) * u;
  out[2] = a[2] + (b[2] - a[2]) * u;
}

/**
 * Builds one hand + forearm as a particle cloud, tip anchored at the origin.
 * God's hand is Adam's mirrored, so it points toward -x (or -y rotated, in
 * portrait), exactly like the cloud the old PNG pipeline produced.
 */
export function generateHandCloud(opts: HandOptions): PointCloud {
  const { kind, armLength, gridStep } = opts;
  const rotation = opts.rotation ?? 0;
  const mirror = kind === "god" ? -1 : 1;
  const rand = mulberry32(opts.seed ?? (kind === "god" ? 0x9e3779b1 : 0x85ebca6b));

  const { prims, tip } = buildPrims(kind, Math.max(0.3, armLength));

  // Light from the upper left, in screen space. The model is built in its own
  // frame, so bring the light into it (undo rotation, then undo the mirror).
  let lx = -0.4, ly = 0.62, lz = 0.6;
  {
    const c = Math.cos(-rotation), s = Math.sin(-rotation);
    const rx = lx * c - ly * s, ry = lx * s + ly * c;
    lx = rx * mirror; ly = ry;
  }
  const ll = Math.hypot(lx, ly, lz);
  lx /= ll; ly /= ll; lz /= ll;

  // Bounds of the whole model, in model space.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of prims) {
    const r = Math.max(p.ra, p.rb);
    minX = Math.min(minX, p.ax - r, p.bx - r); maxX = Math.max(maxX, p.ax + r, p.bx + r);
    minY = Math.min(minY, p.ay - r, p.by - r); maxY = Math.max(maxY, p.ay + r, p.by + r);
  }

  const g = gridStep;
  const px: number[] = [], py: number[] = [], pz: number[] = [];
  const col: number[] = [];
  const rgb = [0, 0, 0];
  const cr = Math.cos(rotation), sr = Math.sin(rotation);

  for (let y = Math.floor(minY / g) * g; y <= maxY; y += g) {
    for (let x = Math.floor(minX / g) * g; x <= maxX; x += g) {
      const sx = x + (rand() - 0.5) * g * 0.7;
      const sy = y + (rand() - 0.5) * g * 0.7;

      let bestH = -Infinity, bestI = -1, bestT = 0, bestDx = 0, bestDy = 0, bestS = 0, bestR = 1;
      let secondH = -Infinity;

      for (let i = 0; i < prims.length; i++) {
        const p = prims[i];
        const dx = p.bx - p.ax, dy = p.by - p.ay;
        const l2 = dx * dx + dy * dy;
        let t = l2 > 1e-9 ? ((sx - p.ax) * dx + (sy - p.ay) * dy) / l2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const ex = sx - (p.ax + t * dx), ey = sy - (p.ay + t * dy);
        const d2 = ex * ex + ey * ey;
        const r = p.ra + (p.rb - p.ra) * t;
        if (d2 >= r * r) continue;
        const s = Math.sqrt(r * r - d2);
        const h = p.az + (p.bz - p.az) * t + s;
        if (h > bestH) {
          if (bestI >= 0 && prims[bestI].group !== p.group) secondH = bestH;
          bestH = h; bestI = i; bestT = t; bestDx = ex; bestDy = ey; bestS = s; bestR = r;
        } else if (h > secondH && prims[bestI].group !== p.group) {
          secondH = h;
        }
      }
      if (bestI < 0) continue;

      // Shading
      const nx = bestDx / bestR, ny = bestDy / bestR, nz = bestS / bestR;
      const diff = Math.max(0, nx * lx + ny * ly + nz * lz);
      let k = 0.05 + 0.95 * diff;
      // Creases where one object passes in front of another.
      if (secondH > -Infinity) {
        const gap = bestH - secondH;
        if (gap < 0.07) k *= 0.62 + 0.38 * (gap / 0.07);
      }
      // Soft rim so silhouettes keep a lit edge against the dark page.
      const rim = Math.pow(1 - nz, 3) * 0.1;
      k = k + rim + (rand() - 0.5) * 0.05;
      ramp(k, rgb);

      const pr = prims[bestI];
      if (pr.nail && bestT > 0.35 && nz > 0.55 && Math.hypot(bestDx, bestDy) < bestR * 0.62) {
        rgb[0] = rgb[0] * 0.7 + 0.3 * 0.95;
        rgb[1] = rgb[1] * 0.7 + 0.3 * 0.82;
        rgb[2] = rgb[2] * 0.7 + 0.3 * 0.78;
      }

      // To cloud space: anchor the index fingertip, mirror, rotate.
      const ax = (sx - tip.x) * mirror;
      const ay = sy - tip.y;
      px.push(ax * cr - ay * sr);
      py.push(ax * sr + ay * cr);
      pz.push(bestH * 0.6);
      col.push(rgb[0], rgb[1], rgb[2]);
    }
  }

  // Back-to-front so NormalBlending (no depth write) layers fingers correctly.
  const n = px.length;
  const order = new Uint32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;
  order.sort((a, b) => pz[a] - pz[b]);

  const positions = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const s = order[i];
    positions[i * 3] = px[s];
    positions[i * 3 + 1] = py[s];
    positions[i * 3 + 2] = pz[s];
    colors[i * 3] = col[s * 3];
    colors[i * 3 + 1] = col[s * 3 + 1];
    colors[i * 3 + 2] = col[s * 3 + 2];
  }

  return { positions, colors, count: n, gridStep: g, refSpan: HAND_LENGTH };
}
