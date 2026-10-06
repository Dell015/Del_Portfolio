"use client";

import { projects } from "@/lib/content/projects";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ProjectCard } from "./ProjectCard";

/**
 * Projects as a plain, scannable grid. This is the default experience (and the
 * one search engines and screen readers get): every project is visible at once,
 * no hover or WebGL required.
 */
export function ProjectGrid() {
  return (
    <section
      id="projects"
      data-snap-section=""
      aria-labelledby="projects-heading"
      className="relative px-6 py-28 md:px-16 md:py-36 lg:px-24"
    >
      <Parallax
        aria-hidden
        distance={110}
        className="pointer-events-none absolute -left-24 top-24 h-96 w-96 rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(209,26,42,0.07) 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto w-full max-w-7xl">
        <SectionHeader eyebrow="Projects" id="projects-heading">
          Things I&apos;ve <em>built.</em>
        </SectionHeader>

        <Reveal className="-mt-6 mb-12 max-w-2xl text-lg leading-relaxed text-text-muted md:-mt-8 md:mb-14">
          <p>
            Seven products, each designed end to end with its own product brief.
            Karela is closest to launch; the rest are in active development.
          </p>
        </Reveal>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal
              as="li"
              key={project.slug}
              delay={(i % 3) * 0.07}
              className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}
            >
              <ProjectCard project={project} featured={i === 0} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
