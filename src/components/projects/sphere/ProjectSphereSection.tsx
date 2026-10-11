"use client";

import { useSnapScroll } from "@/components/SmoothScroll";
import { projects } from "@/lib/content/projects";
import { useSphereHoverStore } from "@/lib/store/sphereHover";

/**
 * ProjectSphereSection, scroll spacer that drives the particle sphere phases.
 *
 * The particles themselves are drawn by HeroParticleCanvas (one shared canvas).
 * This section provides the scroll height for those phases, the heading, the
 * project links, and a plain-text list so the content is reachable by keyboard,
 * screen readers and crawlers, not only by hovering a 3D node.
 */
export function ProjectSphereSection() {
  const { scrollProgress } = useSnapScroll();
  const hoveredIndex = useSphereHoverStore((s) => s.hoveredIndex);

  // Heading shows during the gather phase, after About has fully exited.
  const headingOpacity =
    scrollProgress > 2.1 && scrollProgress < 2.8
      ? Math.min(1, (scrollProgress - 2.1) / 0.2) *
        Math.max(0, 1 - (scrollProgress - 2.5) / 0.3)
      : 0;

  // Labels + hint appear once the sphere has formed.
  const labelsOpacity = Math.max(0, Math.min(1, (scrollProgress - 4.0) / 0.3));

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
            <a href={`/projects/${p.slug}`}>
              {p.name}: {p.plain} ({p.status})
            </a>
          </li>
        ))}
      </ul>

      {/* Tall scroll spacer, drives sphere phases via scrollProgress */}
      <div className="relative h-[300vh]">
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

          <div
            className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-5 px-6 sm:bottom-14"
            style={{ opacity: labelsOpacity }}
          >
            <div className="flex flex-wrap justify-center gap-2.5">
              {projects.map((project, i) => {
                const isHovered = hoveredIndex === i;
                const tint = project.identityGradient[0];
                return (
                  <a
                    key={project.slug}
                    href={`/projects/${project.slug}`}
                    tabIndex={labelsOpacity > 0.5 ? 0 : -1}
                    className="pointer-events-auto rounded-full border px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-xs tracking-wide transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    style={{
                      borderColor: isHovered ? tint : "rgba(255,255,255,0.18)",
                      color: isHovered ? tint : "rgba(235,235,235,0.78)",
                      backgroundColor: isHovered ? `${tint}1f` : "transparent",
                    }}
                  >
                    {project.name}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
