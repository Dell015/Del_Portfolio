"use client";

import Link from "next/link";
import type { Project } from "@/lib/content/projects";

interface ProjectNodeCardProps {
  project: Project;
  /** Screen X in pixels */
  screenX: number;
  /** Screen Y in pixels */
  screenY: number;
  visible: boolean;
  onClose: () => void;
}

export function ProjectNodeCard({
  project,
  screenX,
  screenY,
  visible,
  onClose,
}: ProjectNodeCardProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      <div
        className="pointer-events-auto absolute w-56"
        style={{
          left: `${screenX}px`,
          top: `${screenY}px`,
          transform: "translate(-50%, -110%)",
        }}
        onMouseLeave={onClose}
      >
        <div
          className="rounded-xl border border-white/10 bg-[#0E1013]/90 p-4 shadow-2xl backdrop-blur-md"
          style={{
            transform: visible ? "scale(1) translateY(0)" : "scale(0.92) translateY(6px)",
            transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Gradient swatch */}
          <div
            className="mb-3 h-1.5 w-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${project.identityGradient[0]}, ${project.identityGradient[1]})`,
            }}
          />

          {/* Project name */}
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#F5F5F5]">
            {project.name}
          </p>

          {/* Pitch */}
          <p className="mt-1 font-[family-name:var(--font-body)] text-xs leading-snug text-[#A0A0A0]">
            {project.pitch}
          </p>

          {/* View Project link */}
          <Link
            href={`/projects/${project.slug}`}
            className="mt-3 block w-full rounded-lg border border-white/10 bg-white/5 py-1.5 text-center font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-widest text-[#F5F5F5] transition-all duration-200 hover:border-[#D11A2A]/60 hover:bg-[#D11A2A]/10 hover:text-[#D11A2A]"
          >
            View Project →
          </Link>
        </div>
      </div>
    </div>
  );
}
