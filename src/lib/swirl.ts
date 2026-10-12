import * as THREE from "three";
import { NARROW_LAYOUT, WIDE_LAYOUT } from "@/components/blackhole/layouts";

/**
 * Hand-off between the hero's particles and the black hole in About.
 * `amount` 0 = particles are where they always are, 1 = they have spiralled into the
 * black hole's accretion disk. About drives it from scroll; both hero particle systems
 * read it, so the dust visibly falls into the hole instead of a new screen sliding over.
 */
export const swirlState = {
  amount: 0,
  /** 0..1: the hole has been centred on screen */
  center: 0,
  /** 0..1: the disk has compressed to a point (the dust goes with it) */
  compress: 0,
  /** Ease changes instead of following scroll exactly (used for the burst at the end). */
  soft: false,
};
/** The burst out of the hole's centre: while active, particles grow out of one point as the sequence's explosion plays. */
let _bloomActive = false;
export function startBloom() {
  _bloomActive = true;
}
export function resetBloom() {
  _bloomActive = false;
}
/** 1 when no burst is pending; otherwise follows the explode phase (0 -> 1) like a blast that slows as it spreads. */
export function bloomValue(explode: number) {
  if (!_bloomActive) return 1;
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, explode)), 3);
}
let _shown = 0;
let _last = 0;
function shownAmount() {
  const now = performance.now();
  if (now - _last < 3) return _shown;
  const dt = Math.min(64, now - _last);
  _last = now;
  if (!swirlState.soft) _shown = swirlState.amount;
  else _shown += (swirlState.amount - _shown) * (1 - Math.exp(-dt / 260));
  return _shown;
}

const DISK_IN = 1.3;
const DISK_OUT = 3.4;
const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(38 / 2));

/** Uniform declarations + `swirlClip()` for a points vertex shader (needs `position`, `uTime`). */
export const swirlGlsl = /* glsl */ `
  uniform float uSwirl;
  uniform vec2 uHole;
  uniform vec2 uDisk;
  uniform float uAspect;
  uniform float uCompress;

  vec4 swirlClip(vec4 clip) {
    if (uSwirl <= 0.0) return clip;
    vec2 ndc = clip.xy / clip.w;
    vec2 d = ndc - uHole;
    d.x *= uAspect;
    float r = length(d);
    float a = atan(d.y, d.x);
    float s = uSwirl * uSwirl * (3.0 - 2.0 * uSwirl);
    float h = fract(sin(dot(position, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    float rt = mix(uDisk.x, uDisk.y, h) * (1.0 - uCompress * uCompress);
    float rr = mix(r, rt, s);
    // Inner particles orbit faster, like the disk itself
    float ang = a + s * (3.0 + 5.0 / (0.25 + rr * 2.0)) + s * uTime * 0.5 / (0.15 + rr * rr);
    vec2 p = vec2(cos(ang), sin(ang)) * rr;
    p.y *= mix(1.0, 0.2, s);
    p.x /= uAspect;
    return vec4((uHole + p) * clip.w, clip.zw);
  }

  float swirlFade() {
    return 1.0 - smoothstep(0.8, 1.0, uSwirl);
  }
`;

export function makeSwirlUniforms() {
  return {
    uSwirl: { value: 0 },
    uHole: { value: new THREE.Vector2(0.45, 0) },
    uDisk: { value: new THREE.Vector2(0.2, 0.5) },
    uAspect: { value: 1.7 },
    uCompress: { value: 0 },
  };
}

type SwirlUniforms = ReturnType<typeof makeSwirlUniforms>;

/** Call every frame from useFrame. Projects the hole's centre the same way the black hole camera does. */
export function syncSwirl(u: SwirlUniforms, width: number, height: number) {
  const amount = shownAmount();
  u.uSwirl.value = amount;
  u.uCompress.value = swirlState.compress;
  if (amount <= 0) return;
  const aspect = width / height;
  const L = width < 900 ? NARROW_LAYOUT : WIDE_LAYOUT;
  const z = Math.max(10, L.needW / (2 * TAN_HALF_FOV * aspect));
  const halfH = z * TAN_HALF_FOV;
  const halfW = halfH * aspect;
  const c = 1 - swirlState.center;
  u.uHole.value.set((L.holeX * c) / halfW, (L.holeY * c) / halfH);
  u.uDisk.value.set(DISK_IN / halfH, DISK_OUT / halfH);
  u.uAspect.value = aspect;
}
