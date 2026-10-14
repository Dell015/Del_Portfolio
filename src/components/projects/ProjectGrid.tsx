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
  // "Thesis build · closest to launch" counts under "Thesis build", etc.
  const counts = new Map<string, number>();
  for (const p of projects) {
    const kind = (p.status.split(" · ")[0] ?? p.status).toLowerCase();
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  const summary = [...counts.entries()].sort((x, y) => y[1] - x[1]);

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

        <Reveal className="-mt-6 mb-6 max-w-2xl text-lg leading-relaxed text-text-muted md:-mt-8">
          <p>
            Seven products, each designed end to end with its own product brief.
            Karela is closest to launch; the rest are in active development.
          </p>
        </Reveal>

        <Reveal className="mb-10 flex flex-wrap items-center gap-2 md:mb-12">
          {summary.map(([label, count]) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-text-muted"
            >
              <span className="text-text">{count}</span>
              {label}
            </span>
          ))}
        </Reveal>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {projects.map((project, i) => {
            const wide = i === 0 || i === projects.length - 1;
            return (
              <Reveal
                as="li"
                key={project.slug}
                delay={(i % 3) * 0.07}
                className={
                  i === 0
                    ? "md:col-span-2 lg:col-span-2"
                    : wide
                      ? "lg:col-span-2"
                      : ""
                }
              >
                <ProjectCard project={project} index={i + 1} wide={wide} flip={i !== 0 && wide} />
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
