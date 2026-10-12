"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { makeSwirlUniforms, swirlGlsl, syncSwirl } from "@/lib/swirl";
import * as THREE from "three";
import { getPalette, type SphereSettings } from "@/lib/sphere/settings";

/**
 * Ambient particles behind the project sphere. They drift slowly while the
 * sphere is on screen and, as the Projects section scrolls away (`exitRef`
 * 0 -> 1), streak upward and toward the camera, so the sphere scene hands over
 * to the next section as motion instead of a plain fade.
 */

const COUNT = { high: 3400, low: 1500 } as const;

/** The field is a hollow shell around the sphere, so every viewing angle sees it. */
const SHELL_INNER = 3.4;
const SHELL_OUTER = 15;

const vertexShader = /* glsl */ `
  attribute float aSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform float uAlpha;
  uniform float uExit;
  uniform float uSize;
  uniform float uDpr;
  uniform vec2 uResolution;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
${swirlGlsl}
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Slow orbit around the vertical axis, each particle at its own pace. A shell
    // has no edges, so there is never a "void" whichever way the sphere is turned.
    float ang = uTime * (0.012 + aSpeed * 0.02);
    float ca = cos(ang);
    float sa = sin(ang);
    pos.xz = vec2(ca * pos.x - sa * pos.z, sa * pos.x + ca * pos.z);

    // Gentle per-particle sway
    pos.y += sin(uTime * 0.12 * aSpeed + aPhase * 6.2831) * 0.35;
    pos.x += cos(uTime * 0.10 * aSpeed + aPhase * 5.1) * 0.25;

    // Exit: swell outward and lift, faster for the quicker particles
    float e = uExit * uExit;
    pos *= 1.0 + e * (0.35 + aSpeed * 0.9);
    pos.y += e * (4.0 + aSpeed * 10.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = swirlClip(projectionMatrix * mv);

    float dist = max(0.4, -mv.z);
    float size = uSize * (0.55 + aSpeed * 0.9) * uDpr * (uResolution.y / 900.0) / dist;
    // Streak the point a little as it speeds up
    // Cap the size and fade out whatever drifts right past the camera, so nothing
    // balloons into a blob when the sphere is orbited.
    gl_PointSize = min(size * (1.0 + uExit * 1.5), 7.0 * uDpr);
    float nearFade = smoothstep(1.5, 5.0, dist);

    vColor = mix(uColorA, uColorB, aPhase);
    float twinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aSpeed) + aPhase * 40.0);
    vAlpha = uAlpha * (0.18 + aSpeed * 0.35) * twinkle * (1.0 - uExit * 0.5) * nearFade * swirlFade();
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = vAlpha * (1.0 - smoothstep(0.1, 0.5, d));
    gl_FragColor = vec4(vColor, a);
  }
`;

interface BackdropParticlesProps {
  /** 0 hidden -> 1 visible (eased by the parent). */
  alphaRef: React.MutableRefObject<number>;
  /** 0 on screen -> 1 fully gone (scroll-driven hand-off). */
  exitRef: React.MutableRefObject<number>;
  settingsRef: React.MutableRefObject<SphereSettings>;
  lowPower?: boolean;
}

export function BackdropParticles({ alphaRef, exitRef, settingsRef, lowPower = false }: BackdropParticlesProps) {
  const count = lowPower ? COUNT.low : COUNT.high;
  const matRef = useRef<THREE.ShaderMaterial>(null);
  /** Own clock, R3F's resets when frameloop is toggled. */
  const timeRef = useRef(0);
  const shownRef = useRef(0);
  const paletteRef = useRef("");

  const geometry = useMemo(() => {
    // Seeded so the layout is identical every load.
    let a = 0x2f6e2b1;
    const rand = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pos = new Float32Array(count * 3);
    const speed = new Float32Array(count);
    const phase = new Float32Array(count);
    const r0 = SHELL_INNER ** 3;
    const r1 = SHELL_OUTER ** 3;
    for (let i = 0; i < count; i++) {
      // Uniform over the shell's volume
      const r = Math.cbrt(r0 + rand() * (r1 - r0));
      const cosPhi = 2 * rand() - 1;
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
      const theta = rand() * Math.PI * 2;
      pos[i * 3] = r * sinPhi * Math.cos(theta);
      pos[i * 3 + 1] = r * cosPhi;
      pos[i * 3 + 2] = r * sinPhi * Math.sin(theta);
      speed[i] = 0.3 + rand() * 1.1;
      phase[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAlpha: { value: 0 },
      uExit: { value: 0 },
      uSize: { value: 22 },
      uDpr: { value: 1 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColorA: { value: new THREE.Color("#ffffff") },
      uColorB: { value: new THREE.Color("#cfd3dc") },
      ...makeSwirlUniforms(),
    }),
    [],
  );

  useFrame((state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    timeRef.current += Math.min(delta, 0.1);

    // Ease the on/off toggle so flipping it in the panel fades rather than pops
    const target = settingsRef.current.backdrop ? alphaRef.current : 0;
    shownRef.current += (target - shownRef.current) * (1 - Math.exp(-delta * 5));

    const palette = settingsRef.current.palette;
    if (palette !== paletteRef.current) {
      paletteRef.current = palette;
      const [c1, c2] = getPalette(palette).backdrop;
      mat.uniforms.uColorA!.value.set(c1);
      mat.uniforms.uColorB!.value.set(c2);
    }

    mat.uniforms.uTime!.value = timeRef.current;
    mat.uniforms.uAlpha!.value = shownRef.current;
    mat.uniforms.uExit!.value = exitRef.current;
    mat.uniforms.uDpr!.value = state.viewport.dpr;
    mat.uniforms.uResolution!.value.set(state.size.width, state.size.height);
    syncSwirl(mat.uniforms as unknown as Parameters<typeof syncSwirl>[0], state.size.width, state.size.height);
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
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
