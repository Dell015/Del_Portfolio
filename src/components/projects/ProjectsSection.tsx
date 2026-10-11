"use client";

import { useModeStore } from "@/lib/store/mode";
import { ProjectGrid } from "./ProjectGrid";
import { ProjectSphereSection } from "./sphere/ProjectSphereSection";

/**
 * Picks the Projects presentation. The 3D sphere is rendered by the hero's
 * particle canvas, so it is only offered while that canvas actually exists -
 * if immersive mode is off, reduced motion is on, WebGL is missing or the
 * portrait failed to load, visitors get the grid instead of a blank spacer.
 */
export function ProjectsSection() {
  const particlesActive = useModeStore((s) => s.particlesActive);
  return particlesActive ? <ProjectSphereSection /> : <ProjectGrid />;
}
