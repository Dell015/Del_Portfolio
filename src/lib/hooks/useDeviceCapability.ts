"use client";

import { useSyncExternalStore } from "react";

export type GpuTier = "unknown" | "none" | "low" | "high";

export interface DeviceCapability {
  /** `unknown` during SSR and the hydration render. */
  tier: GpuTier;
  /** False when WebGL can't be created at all — callers must fall back to static. */
  webglAvailable: boolean;
}

/**
 * Probes actual device capability rather than inferring it from viewport width.
 *
 * Width is a bad proxy: a 1024px-wide iPad Pro outperforms a 1440px budget
 * laptop, and a high-DPR phone renders far more fragments than its CSS width
 * suggests. This checks the things that actually predict particle throughput:
 *
 *  - WebGL availability (hard requirement — no context, no particles)
 *  - CPU parallelism, which gates how fast the buffers can be built
 *  - `deviceMemory` where exposed (Chromium only; ignored elsewhere)
 *  - Effective fragment load: CSS pixels × DPR², since overdraw from additive
 *    blending scales with total fragments, not layout width
 */
function probe(): DeviceCapability {
  const canvas = document.createElement("canvas");
  const gl = (canvas.getContext("webgl2") ??
    canvas.getContext("webgl")) as WebGLRenderingContext | null;

  if (!gl) return { tier: "none", webglAvailable: false };

  const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

  // Release the probe context immediately — browsers cap simultaneous contexts
  // (~16), and this page already holds one for the hero.
  gl.getExtension("WEBGL_lose_context")?.loseContext();

  const cores = navigator.hardwareConcurrency ?? 2;
  const memory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const fragmentLoad = window.innerWidth * window.innerHeight * dpr * dpr;

  const weak =
    cores <= 4 ||
    (memory !== null && memory <= 4) ||
    maxTexture < 8192 ||
    // ~8.3 megafragments, roughly a 1080p canvas at DPR 2.
    fragmentLoad > 8_300_000;

  return { tier: weak ? "low" : "high", webglAvailable: true };
}

/**
 * Capability is a one-shot measurement that never changes for the life of the
 * page, so it's modelled as an external store with a cached snapshot rather than
 * state populated by an effect. Two benefits: the result is available on the
 * first post-hydration render instead of one render later, and the probe can
 * never run twice even under Strict Mode's double invocation.
 */
let cached: DeviceCapability | null = null;

/** Must be referentially stable — useSyncExternalStore compares with Object.is. */
const SERVER_SNAPSHOT: DeviceCapability = {
  tier: "unknown",
  webglAvailable: false,
};

function getSnapshot(): DeviceCapability {
  cached ??= probe();
  return cached;
}

function getServerSnapshot(): DeviceCapability {
  return SERVER_SNAPSHOT;
}

/** Capability never changes, so there is nothing to subscribe to. */
function subscribe(): () => void {
  return () => {};
}

export function useDeviceCapability(): DeviceCapability {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
