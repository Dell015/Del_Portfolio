/**
 * Geometry of the project solar system, shared by the 3D scene, the camera and
 * the HTML overlay. Kept free of React so every side computes the same numbers.
 *
 * Frames: the system is built flat in "system space" (orbits in the XZ plane,
 * the sun at the origin) and then tilted toward the camera by TILT around X.
 */

import * as THREE from "three";
import { projects } from "@/lib/content/projects";
import { partsFor } from "@/lib/content/planets";
import { sites } from "@/lib/content/sites";

/** How far the orbit plane leans toward the viewer (radians). */
export const TILT = 0.38;

export const SUN_RADIUS = 0.42;

/**
 * The sun can be selected like a planet: `planet: SUN`. Its "parts" are the nodes
 * orbiting it, one per smaller build (landing pages, portfolios, business sites), or a
 * single open slot while there are none.
 */
export const SUN = -1;
/** Radius of the ring the site nodes orbit on, system space. */
export const SUN_NODE_ORBIT = SUN_RADIUS * 2.3;
/** How many nodes orbit the sun (at least one: the open slot). */
export const SUN_NODES = Math.max(1, sites.length);

/** How many selectable parts a body has (a planet's parts, or the sun's nodes). */
export function partCountOf(planet: number) {
  if (planet < 0) return SUN_NODES;
  const p = projects[planet];
  return p ? partsFor(p.slug).length : 1;
}

/** Steps through the bodies in rail order: the sun first, then the planets. */
export function stepBody(planet: number, d: number) {
  const n = projects.length + 1;
  return ((((planet + 1 + d) % n) + n) % n) - 1;
}

export interface PlanetLayout {
  slug: string;
  /** Orbit radius around the sun, system space. */
  orbit: number;
  /** Angle on that orbit, system space. */
  angle: number;
  /** Planet radius: bigger for projects with more moving parts. */
  radius: number;
  /** Surface colors (from the project's identity gradient). */
  colorA: string;
  colorB: string;
  /** Color of the part orbs. */
  partColor: string;
  partCount: number;
}

const ANGLES = [0.55, 2.2, 3.75, 5.2];

export const PLANETS: PlanetLayout[] = projects.map((p, i) => {
  const partCount = partsFor(p.slug).length;
  // Complexity drives size: number of parts plus breadth of the stack.
  const weight = partCount + p.techStack.length;
  const radius = Math.min(0.95, Math.max(0.62, 0.45 + weight * 0.024));
  // Projects still being built are drawn grayed out (their colour only hinted at).
  const [a, b] = p.building ? p.identityGradient.map((c) => grayish(c)) : p.identityGradient;
  // Single-colour themes get their accent (or a lighter shade) as the second stop.
  const single = a.toLowerCase() === b.toLowerCase();
  const colorB = single ? lighten(a, 0.4) : b;
  return {
    slug: p.slug,
    orbit: 3.1 + i * 1.35,
    angle: ANGLES[i % ANGLES.length]! + Math.floor(i / ANGLES.length) * 0.7,
    radius,
    colorA: a,
    colorB,
    // Parts glow in the project's accent when it has one (Icarus red on gold).
    partColor: p.building ? lighten(a, 0.25) : (p.accentColor ?? (single ? a : lighten(colorB, 0.12))),
    partCount,
  };
});

/** Mostly gray, with a trace of the original colour. */
function grayish(hex: string): string {
  const c = new THREE.Color(hex);
  const l = c.r * 0.3 + c.g * 0.59 + c.b * 0.11;
  c.lerp(new THREE.Color(l, l, l), 0.82).lerp(new THREE.Color("#6b6b6b"), 0.35);
  return `#${c.getHexString()}`;
}

function lighten(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color("#ffffff"), amount);
  return `#${c.getHexString()}`;
}

const _tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), TILT);
export const SYSTEM_QUAT = _tilt;
export const SYSTEM_QUAT_INV = _tilt.clone().invert();

/** Planet centre in system space for an orbit radius and angle. */
export function orbitPoint(orbit: number, angle: number, out = new THREE.Vector3()) {
  return out.set(Math.cos(angle) * orbit, 0, Math.sin(angle) * orbit);
}

export function toWorld(v: THREE.Vector3) {
  return v.applyQuaternion(SYSTEM_QUAT);
}

export function toSystem(v: THREE.Vector3) {
  return v.applyQuaternion(SYSTEM_QUAT_INV);
}

/** Where the camera sits relative to a planet, and how the planet is framed. */
export interface FocusState {
  orbit: number;
  angle: number;
  radius: number;
}

const _p = new THREE.Vector3();
const _u = new THREE.Vector3();
const _f = new THREE.Vector3();
const _r = new THREE.Vector3();
const _up = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

/** Portrait screens stack the planet above the text instead of beside it. */
export function isPortrait(aspect: number) {
  return aspect < 0.95;
}

/**
 * Camera position and look-at target that frame one planet. The camera sits
 * outside the planet's orbit, a little ahead of it and above the orbit plane, so
 * the sun and the inner planets show in the background. The look-at point is
 * shifted so the planet lands right of centre (beside the text) on wide screens,
 * and above centre on portrait screens.
 */
export function focusCamera(
  s: FocusState,
  aspect: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3,
) {
  const portrait = isPortrait(aspect);
  orbitPoint(s.orbit, s.angle, _p);
  _u.set(Math.cos(s.angle), 0, Math.sin(s.angle));
  // Outside the orbit and well above its plane, looking down at the planet: the
  // sun then sits behind and above it on screen, and the other planets stay small.
  const dist = s.radius * (portrait ? 4.6 : 3.3);
  const height = s.radius * (portrait ? 2.9 : 2.6);
  outPos.copy(_p).addScaledVector(_u, dist);
  outPos.y += height;
  toWorld(outPos);
  toWorld(_p);

  _f.copy(_p).sub(outPos).normalize();
  _r.crossVectors(_f, WORLD_UP).normalize();
  _up.crossVectors(_r, _f).normalize();
  outTarget.copy(_p);
  if (portrait) {
    // Planet in the upper half, above the text sheet.
    outTarget.addScaledVector(_up, -s.radius * 0.75);
  } else {
    // Planet right of centre (beside the text), centred on the text column.
    outTarget.addScaledVector(_r, -s.radius * 1.15).addScaledVector(_up, -s.radius * 0.08);
  }
}

export function planetFocus(i: number, fromAngle = ANGLES[0]!): FocusState {
  if (i < 0) return sunFocus(fromAngle);
  const p = PLANETS[i] ?? PLANETS[0]!;
  return { orbit: p.orbit, angle: p.angle, radius: p.radius };
}

/**
 * Framing for the sun and its node ring. The camera looks in through the gap between
 * two planets nearest to where it already is, so no planet sits in front of the sun.
 */
export function sunFocus(fromAngle: number): FocusState {
  const sorted = PLANETS.map((p) => ((p.angle % TAU) + TAU) % TAU).sort((a, b) => a - b);
  let best = fromAngle;
  let bestD = Infinity;
  sorted.forEach((a, i) => {
    const b = i + 1 < sorted.length ? sorted[i + 1]! : sorted[0]! + TAU;
    const mid = (a + b) / 2;
    const d = Math.abs(Math.atan2(Math.sin(mid - fromAngle), Math.cos(mid - fromAngle)));
    if (d < bestD) {
      bestD = d;
      best = mid;
    }
  });
  return { orbit: 0, angle: best, radius: SUN_NODE_ORBIT * 1.15 };
}
const TAU = Math.PI * 2;

/** Evenly spread unit directions (fibonacci sphere), optionally kept off the poles. */
export function fibonacciDirs(count: number, band = 1): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = count === 1 ? 0 : (1 - (i / (count - 1)) * 2) * band;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    out.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
  }
  return out;
}
