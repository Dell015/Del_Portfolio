"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SphereHUD } from "./SphereHUD";
import { useSnapScroll } from "@/components/SmoothScroll";
import { projects } from "@/lib/content/projects";

/**
 * ProjectSphereSection — scroll spacer that drives the particle sphere phases.
 *
 * The actual particles are rendered by HeroParticleCanvas (unified canvas).
 * This section provides:
 *  - Scroll height for the sphere animation phases
 *  - HUD overlay
 *  - Section heading that fades in/out
 *  - Project name labels at the bottom
 */
export function ProjectSphereSection() {
  const { scrollProgress } = useSnapScroll();

  // Map the scroll progress relevant to sphere phases (1.8 → 4.5 in SmoothScroll terms)
  // Normalize to 0-1 for the HUD
  const sphereNormalized = Math.max(0, Math.min(1, (scrollProgress - 1.8) / (4.5 - 1.8)));

  // Heading visible during gather phase
  const headingOpacity = scrollProgress > 1.7 && scrollProgress < 2.5
    ? Math.min(1, (scrollProgress - 1.7) / 0.2) * Math.max(0, 1 - (scrollProgress - 2.2) / 0.3)
    : 0;

  // Labels visible when sphere is formed
  const labelsOpacity = Math.max(0, Math.min(1, (scrollProgress - 4.0) / 0.3));

  return (
    <div id="projects" data-snap-section="">
      {/* Tall scroll spacer — drives sphere phases via scrollProgress */}
      <div className="relative h-[300vh]">
        <div className="sticky top-0 h-screen w-full pointer-events-none">
          {/* HUD overlay */}
          <SphereHUD progress={sphereNormalized} />

          {/* Section heading */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
            style={{ opacity: headingOpacity }}
          >
            <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent">
              Projects
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl">
              Things I&apos;ve <span className="text-accent">built.</span>
            </h2>
          </div>

          {/* Project labels at bottom */}
          <div
            className="absolute bottom-16 left-0 right-0 flex justify-center gap-4 flex-wrap px-6 z-10 pointer-events-none"
            style={{ opacity: labelsOpacity }}
          >
            {projects.map((project) => (
              <a
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="pointer-events-auto rounded-full border border-white/10 px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-text-muted/60 transition-all duration-300 hover:border-pink-400/60 hover:text-pink-400 hover:bg-pink-400/10"
              >
                {project.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
