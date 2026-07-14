/**
 * Curl noise for in-flight particle scatter.
 *
 * During morphs (transition mid-flight), each particle gets a noise-driven
 * detour so it looks organic rather than linearly snapping between positions.
 * At rest states (t=0 or t=1), the offset is zero so the image reads crisp.
 *
 * This is a simplified 3D curl noise based on a pseudo-random gradient field.
 * The bell curve multiplier ensures offset peaks mid-transition.
 */

/**
 * Simple 3D noise function (value noise with smooth interpolation).
 * Not Perlin-quality, but fast enough for particle offsets.
 */
function hash(x: number, y: number, z: number): number {
  let h = x * 374761393 + y * 668265263 + z * 1274126177;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff; // [0, 1]
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function noise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);

  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);
  const fz = smoothstep(z - iz);

  // 8 corners
  const n000 = hash(ix, iy, iz);
  const n100 = hash(ix + 1, iy, iz);
  const n010 = hash(ix, iy + 1, iz);
  const n110 = hash(ix + 1, iy + 1, iz);
  const n001 = hash(ix, iy, iz + 1);
  const n101 = hash(ix + 1, iy, iz + 1);
  const n011 = hash(ix, iy + 1, iz + 1);
  const n111 = hash(ix + 1, iy + 1, iz + 1);

  // Trilinear interpolation
  return lerp(
    lerp(lerp(n000, n100, fx), lerp(n010, n110, fx), fy),
    lerp(lerp(n001, n101, fx), lerp(n011, n111, fx), fy),
    fz
  );
}

/**
 * Compute curl of a 3D noise field at a point.
 * Returns a divergence-free vector (particles flow along the curl, never converge).
 */
export function curlNoise(
  x: number,
  y: number,
  z: number,
  scale: number = 1.5,
  time: number = 0
): [number, number, number] {
  const eps = 0.001;
  const sx = x * scale + time;
  const sy = y * scale + time * 0.7;
  const sz = z * scale + time * 0.3;

  // Partial derivatives via finite differences
  const dx_dy = (noise3D(sx, sy + eps, sz) - noise3D(sx, sy - eps, sz)) / (2 * eps);
  const dx_dz = (noise3D(sx, sy, sz + eps) - noise3D(sx, sy, sz - eps)) / (2 * eps);
  const dy_dx = (noise3D(sx + eps, sy, sz) - noise3D(sx - eps, sy, sz)) / (2 * eps);
  const dy_dz = (noise3D(sx, sy, sz + eps) - noise3D(sx, sy, sz - eps)) / (2 * eps);
  const dz_dx = (noise3D(sx + eps, sy, sz) - noise3D(sx - eps, sy, sz)) / (2 * eps);
  const dz_dy = (noise3D(sx, sy + eps, sz) - noise3D(sx, sy - eps, sz)) / (2 * eps);

  // Curl = (dFz/dy - dFy/dz, dFx/dz - dFz/dx, dFy/dx - dFx/dy)
  return [dz_dy - dy_dz, dx_dz - dz_dx, dy_dx - dx_dy];
}

/**
 * Bell curve multiplier: peaks at t=0.5, zero at t=0 and t=1.
 * This ensures curl noise offset is zero at rest states.
 */
export function transitionBell(t: number): number {
  // sin(pi*t) gives a smooth bell from 0 to 1 and back to 0
  return Math.sin(Math.PI * t);
}

/**
 * GLSL source for curl noise — to be injected into the ShaderMaterial.
 * This keeps the GPU doing the curl computation per-particle in real time,
 * rather than computing it on CPU and uploading every frame.
 */
export const curlNoiseGLSL = /* glsl */ `
  // Simple hash-based noise for GPU
  float hash3D(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // smoothstep

    float n000 = hash3D(i);
    float n100 = hash3D(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash3D(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash3D(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash3D(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash3D(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash3D(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash3D(i + vec3(1.0, 1.0, 1.0));

    return mix(
      mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
      mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
      f.z
    );
  }

  vec3 curlNoise(vec3 p) {
    float eps = 0.001;

    float dx_dy = noise3D(p + vec3(0.0, eps, 0.0)) - noise3D(p - vec3(0.0, eps, 0.0));
    float dx_dz = noise3D(p + vec3(0.0, 0.0, eps)) - noise3D(p - vec3(0.0, 0.0, eps));
    float dy_dx = noise3D(p + vec3(eps, 0.0, 0.0)) - noise3D(p - vec3(eps, 0.0, 0.0));
    float dy_dz = noise3D(p + vec3(0.0, 0.0, eps)) - noise3D(p - vec3(0.0, 0.0, eps));
    float dz_dx = noise3D(p + vec3(eps, 0.0, 0.0)) - noise3D(p - vec3(eps, 0.0, 0.0));
    float dz_dy = noise3D(p + vec3(0.0, eps, 0.0)) - noise3D(p - vec3(0.0, eps, 0.0));

    return vec3(
      dz_dy - dy_dz,
      dx_dz - dz_dx,
      dy_dx - dx_dy
    ) / (2.0 * eps);
  }

  // Bell curve: zero at rest (t=0, t=1), peaks mid-transition
  float transitionBell(float t) {
    return sin(3.14159 * t);
  }
`;
