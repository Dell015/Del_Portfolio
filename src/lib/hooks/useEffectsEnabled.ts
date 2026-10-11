"use client";

import { useReducedMotion } from "framer-motion";
import { useDeviceCapability } from "./useDeviceCapability";

/**
 * Whether purely decorative WebGL (background shaders) may run.
 * False during SSR, on weak/no-GPU devices, and for reduced-motion users -
 * decoration should never cost frames the content needs.
 */
export function useEffectsEnabled(): boolean {
  const { tier } = useDeviceCapability();
  const reduced = useReducedMotion();
  return tier === "high" && !reduced;
}
