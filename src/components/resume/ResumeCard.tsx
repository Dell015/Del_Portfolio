"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { credentials, site } from "@/lib/content/site";

/** Skill names shown on the preview; kept short so the card stays legible. */
const PREVIEW_SKILLS = ["TypeScript", "React", "Next.js", "Flutter", "Python", "PostgreSQL"] as const;

/**
 * A paper preview of the resume, built from the same content as the rest of the
 * site. It tilts toward the cursor and catches a moving highlight, so the thing
 * you are about to ask for feels like an object rather than a link.
 *
 * Purely decorative (aria-hidden): the button beside it carries the action.
 */
export function ResumeCard({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 160, damping: 20, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 160, damping: 20, mass: 0.4 });

  const rotateY = useTransform(sx, [0, 1], [-9, 9]);
  const rotateX = useTransform(sy, [0, 1], [8, -8]);
  const glare = useTransform(
    [sx, sy],
    ([x, y]: number[]) =>
      `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.55), transparent 55%)`,
  );

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  const edu = credentials.groups.find((g) => g.title === "Education")?.items[0];
  const exp = credentials.groups.find((g) => g.title === "Experience")?.items[0];
  const comps = credentials.groups.find((g) => g.title === "Competitions")?.items.slice(0, 2) ?? [];

  return (
    <div
      aria-hidden="true"
      className={`[perspective:1100px] ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <motion.div
        ref={ref}
        className="relative aspect-[8.5/11] w-full [container-type:inline-size] overflow-hidden rounded-[10px] bg-[#F3F0EA] text-[#1b1b1b] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)]"
        style={reduced ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Red top rule, like a letterhead */}
        <div className="absolute inset-x-0 top-0 h-[5px] bg-accent" />

        <div className="flex h-full flex-col gap-[3.2%] p-[7%] pt-[8%] text-[3.2cqw] leading-[1.35]">
          <header>
            <p className="font-[family-name:var(--font-display)] text-[2.3em] font-bold leading-none tracking-tight">
              {site.name}
            </p>
            <p className="mt-[0.5em] text-[1.1em] text-[#555]">Full-stack developer &amp; startup founder</p>
            <p className="mt-[0.2em] font-[family-name:var(--font-mono)] text-[0.95em] text-[#777]">
              Cauayan, Isabela · Philippines
            </p>
          </header>

          <Block title="Education">
            <p className="font-semibold">{edu?.primary}</p>
            <p className="text-[#666]">{edu?.secondary}</p>
          </Block>

          <Block title="Experience">
            <p className="font-semibold">{exp?.primary}</p>
            <p className="text-[#666]">{exp?.secondary}</p>
            <Lines n={2} />
          </Block>

          <Block title="Competitions">
            {comps.map((c) => (
              <p key={c.primary} className="truncate font-semibold">
                {c.primary}
              </p>
            ))}
          </Block>

          <Block title="Skills">
            <p className="text-[#555]">{PREVIEW_SKILLS.join(" · ")}</p>
          </Block>
        </div>

        {/* Moving highlight */}
        {!reduced && (
          <motion.div
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{ backgroundImage: glare }}
          />
        )}
      </motion.div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-[0.35em] border-b border-[#d8d3c9] pb-[0.25em] font-[family-name:var(--font-mono)] text-[0.85em] font-semibold uppercase tracking-[0.14em] text-accent">
        {title}
      </p>
      <div className="space-y-[0.15em]">{children}</div>
    </section>
  );
}

function Lines({ n }: { n: number }) {
  return (
    <div className="mt-[0.5em] space-y-[0.4em]">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="h-[0.45em] rounded-full bg-[#dedad2]" style={{ width: `${92 - i * 22}%` }} />
      ))}
    </div>
  );
}
