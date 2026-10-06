import Link from "next/link";
import type { Project } from "@/lib/content/projects";

interface ProjectCardProps {
  project: Project;
  /** Larger treatment for the flagship project. */
  featured?: boolean;
}

/**
 * A project, readable without hovering: plain-language summary first (for anyone),
 * role and stack second (for engineers), honest build status always visible.
 */
export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const [tint] = project.identityGradient;
  const stack = project.techStack.slice(0, featured ? 7 : 4);
  const extra = project.techStack.length - stack.length;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-[transform,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:p-7"
    >
      {/* Project colour, as a quiet corner tint rather than a loud gradient */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-[0.14] transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: `radial-gradient(circle, ${tint} 0%, transparent 68%)` }}
      />

      <div className="relative flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: tint }}
        />
        <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-text-muted">
          {project.status}
        </p>
      </div>

      <h3
        className={`relative mt-5 font-[family-name:var(--font-display)] font-bold tracking-tight text-text ${
          featured ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
        }`}
      >
        {project.name}
      </h3>

      <p className={`relative mt-3 text-text ${featured ? "max-w-xl text-lg md:text-xl" : "text-base"} leading-relaxed`}>
        {project.plain}
      </p>

      {featured && (
        <p className="relative mt-4 line-clamp-3 max-w-2xl text-sm leading-relaxed text-text-muted">
          {project.description}
        </p>
      )}

      <p className="relative mt-4 text-sm text-text-muted">
        {project.role} · {project.teamSize}
      </p>

      <ul className="relative mt-5 flex flex-wrap gap-2" aria-label={`${project.name} technologies`}>
        {stack.map((tech) => (
          <li
            key={tech}
            className="rounded-md bg-surface-2 px-2.5 py-1 font-[family-name:var(--font-mono)] text-xs text-text-muted"
          >
            {tech}
          </li>
        ))}
        {extra > 0 && (
          <li className="rounded-md px-1 py-1 font-[family-name:var(--font-mono)] text-xs text-text-muted">
            +{extra} more
          </li>
        )}
      </ul>

      <p className="relative mt-auto pt-7 font-[family-name:var(--font-display)] text-sm font-semibold text-text">
        <span className="border-b border-transparent transition-colors duration-300 group-hover:border-text">
          Read the case study
        </span>
        <span
          aria-hidden="true"
          className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </p>
    </Link>
  );
}
