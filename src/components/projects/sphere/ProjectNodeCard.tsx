"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { projects, type Project } from "@/lib/content/projects";

interface ProjectNodeCardProps {
  project: Project;
  /** Screen X in pixels */
  screenX: number;
  /** Screen Y in pixels */
  screenY: number;
  /** Cursor entered the card, parent cancels any pending dismissal. */
  onPointerEnter: () => void;
  /** Cursor left the card, parent schedules dismissal. */
  onPointerLeave: () => void;
}

const PLATFORM_LABEL: Record<Project["platform"], string> = {
  mobile: "Mobile app",
  web: "Web app",
  "web+mobile": "Web + mobile",
};

const CARD_W = 304;
const EDGE = 16;
/** Gap between the node and the card's edge. */
const GAP = 22;
/** Room the card needs above the node before it flips below it. */
const CARD_H_ESTIMATE = 400;

export function ProjectNodeCard({
  project,
  screenX,
  screenY,
  onPointerEnter,
  onPointerLeave,
}: ProjectNodeCardProps) {
  const [c0, c1] = project.identityGradient;
  const index = Math.max(0, projects.findIndex((p) => p.slug === project.slug));
  const stack = project.techStack.slice(0, 4);
  const more = project.techStack.length - stack.length;

  // Keep the card on screen: clamp sideways, and flip below the node near the top.
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  const half = CARD_W / 2 + EDGE;
  const left = Math.min(Math.max(screenX, half), Math.max(half, vw - half));
  const below = screenY < CARD_H_ESTIMATE + GAP;
  // Where the connector meets the card, relative to its centre (the node may be off-centre after clamping)
  const pointer = Math.max(-CARD_W / 2 + 24, Math.min(CARD_W / 2 - 24, screenX - left));

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="absolute" style={{ left: `${left}px`, top: `${screenY}px` }}>
        <div
          style={{
            width: CARD_W,
            transform: below
              ? `translate(-50%, ${GAP}px)`
              : `translate(-50%, calc(-100% - ${GAP}px))`,
          }}
        >
          <motion.div
            data-project-node-card=""
            className="pointer-events-auto relative"
            style={
              {
                "--c": c0,
                "--c2": c1,
                transformOrigin: below ? "top center" : "bottom center",
              } as React.CSSProperties
            }
            initial={{ opacity: 0, scale: 0.94, y: below ? -8 : 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: below ? -4 : 4 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={onPointerEnter}
            onMouseLeave={onPointerLeave}
          >
            {/* Connector from the card to the node */}
            <span
              aria-hidden="true"
              className="absolute h-[22px] w-px"
              style={{
                left: `calc(50% + ${pointer}px)`,
                [below ? "top" : "bottom"]: -GAP,
                background: below
                  ? `linear-gradient(to top, ${c0}, transparent)`
                  : `linear-gradient(to bottom, ${c0}, transparent)`,
              }}
            />

            {/* Spec-sheet card: flat, ruled rows and corner ticks, like the portrait frame in the hero */}
            <div
              className="relative bg-[#0A0C0F]/95 backdrop-blur-xl"
              style={{
                borderRadius: 4,
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.1), 0 30px 60px -24px rgba(0,0,0,0.85), 0 0 50px -28px ${c0}`,
              }}
            >
              {/* Corner ticks */}
              {(["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-b border-l", "right-0 bottom-0 border-b border-r"] as const).map((cls) => (
                <span
                  key={cls}
                  aria-hidden="true"
                  className={`pointer-events-none absolute h-3 w-3 ${cls}`}
                  style={{ borderColor: c0 }}
                />
              ))}

              <div className="px-5 pb-0 pt-4">
                {/* Index + platform / status */}
                <div className="flex items-center justify-between gap-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em]">
                  <span style={{ color: c0 }}>
                    [ {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} ]
                  </span>
                  <span className="text-white/45">{PLATFORM_LABEL[project.platform]}</span>
                </div>

                {/* Name + pitch */}
                <p className="mt-5 font-[family-name:var(--font-display)] text-[34px] font-bold leading-[0.95] tracking-[-0.03em] text-white">
                  {project.name}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-white/60">{project.pitch}</p>

                {/* Ruled spec rows */}
                <dl className="mt-5 font-[family-name:var(--font-mono)] text-[11px]">
                  {[
                    ["Status", project.status],
                    ["Role", project.role],
                    ["Team", project.teamSize],
                    ["Stack", stack.join(" / ") + (more > 0 ? `  +${more}` : "")],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[48px_1fr] gap-3 border-t border-dashed border-white/12 py-2.5">
                      <dt className="uppercase tracking-[0.14em] text-white/35">{k}</dt>
                      <dd className="leading-snug text-white/80">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Case study link */}
              <Link
                href={`/projects/${project.slug}`}
                className="group flex items-center justify-between border-t px-5 py-3.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-white transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
                style={{ borderColor: `color-mix(in srgb, ${c0} 45%, transparent)`, background: `color-mix(in srgb, ${c0} 10%, transparent)` }}
              >
                <span>Open case study</span>
                <span aria-hidden="true" className="text-base transition-transform duration-300 group-hover:translate-x-1" style={{ color: c0 }}>
                  →
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
