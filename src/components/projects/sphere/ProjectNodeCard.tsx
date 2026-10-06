"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/content/projects";

interface ProjectNodeCardProps {
  project: Project;
  /** Screen X in pixels */
  screenX: number;
  /** Screen Y in pixels */
  screenY: number;
  /** Cursor entered the card — parent cancels any pending dismissal. */
  onPointerEnter: () => void;
  /** Cursor left the card — parent schedules dismissal. */
  onPointerLeave: () => void;
}

export function ProjectNodeCard({
  project,
  screenX,
  screenY,
  onPointerEnter,
  onPointerLeave,
}: ProjectNodeCardProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {/* Anchor at the node's screen position */}
      <div className="absolute" style={{ left: `${screenX}px`, top: `${screenY}px` }}>
        {/* Centering wrapper — keeps the card above the node */}
        <div style={{ transform: "translate(-50%, -110%)" }}>
          <motion.div
            data-project-node-card=""
            className="pointer-events-auto w-56 rounded-xl border border-white/10 bg-[#0E1013]/90 p-4 shadow-2xl backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 4 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={onPointerEnter}
            onMouseLeave={onPointerLeave}
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
              className="mt-3 block w-full rounded-lg border py-1.5 text-center font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-widest transition-all duration-200"
              style={{
                borderColor: project.identityGradient[0],
                backgroundColor: `${project.identityGradient[0]}15`,
                color: project.identityGradient[0],
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${project.identityGradient[0]}30`;
                e.currentTarget.style.boxShadow = `0 0 12px ${project.identityGradient[0]}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${project.identityGradient[0]}15`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              View Project →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
