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
const CARD_H_ESTIMATE = 330;

export function ProjectNodeCard({
  project,
  screenX,
  screenY,
  onPointerEnter,
  onPointerLeave,
}: ProjectNodeCardProps) {
  const [c0, c1] = project.identityGradient;
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

            {/* Gradient hairline border */}
            <div
              className="rounded-[20px] p-px"
              style={{
                background: `linear-gradient(145deg, ${c0} 0%, color-mix(in srgb, ${c1} 35%, rgba(255,255,255,0.08)) 38%, rgba(255,255,255,0.06) 100%)`,
                boxShadow: `0 28px 70px -18px color-mix(in srgb, ${c0} 55%, transparent), 0 10px 30px -10px rgba(0,0,0,0.7)`,
              }}
            >
              <div className="relative overflow-hidden rounded-[19px] bg-[#0B0D10]/95 p-5 backdrop-blur-xl">
                {/* Soft glow from the project's color */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full opacity-25 blur-3xl"
                  style={{ background: c0 }}
                />

                <div className="relative">
                  {/* Platform + build status */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/12 px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.14em] text-white/60">
                      {PLATFORM_LABEL[project.platform]}
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] text-white/55">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: c0, boxShadow: `0 0 8px ${c0}` }}
                      />
                      <span className="truncate">{project.status}</span>
                    </span>
                  </div>

                  {/* Name + pitch */}
                  <p className="mt-4 font-[family-name:var(--font-display)] text-[26px] font-bold leading-none tracking-tight text-white">
                    {project.name}
                  </p>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">{project.pitch}</p>

                  {/* Role + team */}
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 border-t border-white/8 pt-4">
                    <div className="min-w-0">
                      <dt className="font-[family-name:var(--font-mono)] text-[9.5px] uppercase tracking-[0.14em] text-white/40">
                        Role
                      </dt>
                      <dd className="mt-1 text-xs leading-snug text-white/85">{project.role}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="font-[family-name:var(--font-mono)] text-[9.5px] uppercase tracking-[0.14em] text-white/40">
                        Team
                      </dt>
                      <dd className="mt-1 text-xs leading-snug text-white/85">{project.teamSize}</dd>
                    </div>
                  </dl>

                  {/* Stack */}
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {stack.map((t) => (
                      <li
                        key={t}
                        className="rounded-md bg-white/6 px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] text-white/70"
                      >
                        {t}
                      </li>
                    ))}
                    {more > 0 && (
                      <li className="rounded-md px-1.5 py-1 font-[family-name:var(--font-mono)] text-[10px] text-white/40">
                        +{more}
                      </li>
                    )}
                  </ul>

                  {/* Case study link */}
                  <Link
                    href={`/projects/${project.slug}`}
                    className="node-card-cta group mt-5 flex items-center justify-between rounded-xl px-4 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    View case study
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-xs transition-transform duration-300 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
