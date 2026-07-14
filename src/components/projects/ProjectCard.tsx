import Link from "next/link";
import { DeviceFrame } from "./DeviceFrame";
import type { Project } from "@/lib/content/projects";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isMobile = project.cardVariant === "mobile";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group relative flex rounded-2xl border border-border bg-surface p-3 transition-all duration-[450ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:shadow-xl hover:shadow-accent/5 hover:border-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isMobile ? "flex-row items-start gap-4" : "flex-col"
      }`}
    >
      {/* Device frame */}
      <div className={isMobile ? "w-28 shrink-0 sm:w-32" : "w-full"}>
        <DeviceFrame
          variant={project.cardVariant}
          gradient={project.identityGradient}
          projectName={project.name}
        />
      </div>

      {/* Detail panel — visible on hover */}
      <div
        className={`flex flex-col gap-2 transition-opacity duration-300 delay-[50ms] ${
          isMobile
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        } ${isMobile ? "" : "mt-3"}`}
      >
        <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
          {project.name}
        </h3>
        <p className="text-sm leading-relaxed text-text-muted">
          {project.pitch}
        </p>

        {/* Tech badges */}
        <div className="mt-1 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-surface-2 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-text-muted"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="rounded-md bg-surface-2 px-2 py-0.5 font-[family-name:var(--font-mono)] text-[10px] text-text-muted">
              +{project.techStack.length - 4}
            </span>
          )}
        </div>

        {/* Links */}
        <div className="mt-2 flex gap-3">
          {project.liveUrl ? (
            <span className="text-xs text-accent underline">Live</span>
          ) : (
            <span className="text-xs text-text-muted/50">Live — soon</span>
          )}
          {project.repoUrl ? (
            <span className="text-xs text-accent underline">Repo</span>
          ) : (
            <span className="text-xs text-text-muted/50">Repo — soon</span>
          )}
        </div>
      </div>
    </Link>
  );
}
