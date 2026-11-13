"use client";

import { useSnapScroll } from "@/components/SmoothScroll";
import { projects, hasCaseStudy } from "@/lib/content/projects";

/**
 * ProjectSphereSection, scroll spacer that drives the project solar system.
 *
 * The particles themselves are drawn by HeroParticleCanvas (one shared canvas).
 * This section provides the scroll height for those phases, the heading, the
 * and a plain-text list so the content is reachable by keyboard,
 * screen readers and crawlers, not only through the 3D planets.
 */
export function ProjectSphereSection() {
  const { scrollProgress } = useSnapScroll();

  // Heading shows during the gather phase, after About has fully exited.
  const headingOpacity =
    scrollProgress > 2.1 && scrollProgress < 2.8
      ? Math.min(1, (scrollProgress - 2.1) / 0.2) *
        Math.max(0, 1 - (scrollProgress - 2.5) / 0.3)
      : 0;


  return (
    <section
      id="projects"
      data-snap-section=""
      aria-labelledby="projects-heading"
    >
      <h2 id="projects-heading" className="sr-only">
        Projects
      </h2>

      {/* Screen-reader / crawler list. Visually hidden; the visible links are below. */}
      <ul className="sr-only">
        {projects.map((p) => (
          <li key={p.slug}>
            {hasCaseStudy(p) ? (
              <a href={`/projects/${p.slug}`}>
                {p.name}: {p.plain} ({p.status})
              </a>
            ) : (
              <>
                {p.name}: {p.plain} ({p.building ? "still being built" : p.status})
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Tall scroll spacer, drives sphere phases via scrollProgress */}
      <div className="relative h-[300vh]">
        {/* Where the system parks (and where "Back to projects" lands). 200vh is the last spot where the sticky screen still fills the viewport, so the next section can't peek in. */}
        <div id="projects-sphere" aria-hidden="true" className="absolute top-[200vh] h-0 w-0" />
        <div className="pointer-events-none sticky top-0 h-screen w-full">
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center"
            style={{ opacity: headingOpacity }}
          >
            <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-accent">
              Projects
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-text md:text-5xl lg:text-6xl">
              Things I&apos;ve <span className="text-accent">built.</span>
            </h2>
          </div>

        </div>
      </div>
    </section>
  );
}
