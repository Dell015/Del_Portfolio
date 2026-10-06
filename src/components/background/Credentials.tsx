"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { credentials } from "@/lib/content/site";
import { useSnapScroll } from "@/components/SmoothScroll";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { EASE } from "@/components/motion/tokens";

/**
 * "Background" — experience, education, competitions, training.
 *
 * A vertical timeline: a line draws itself as you scroll and each group's marker
 * lights up when it arrives. The header stays pinned beside it on wide screens.
 * Content lives in `credentials` (lib/content/site.ts); the internship entry is
 * deliberately generic because the client and code are under NDA.
 */
export function Credentials() {
  const { containerRef } = useSnapScroll();
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    container: containerRef,
    offset: ["start 70%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const lineScale = reduced ? scrollYProgress : fill;
  const glowY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="background"
      data-snap-section=""
      aria-labelledby="background-heading"
      className="relative overflow-clip px-6 py-28 md:px-16 md:py-40 lg:px-24"
    >
      {/* Oversized outlined word that drifts slower than the page */}
      <Parallax
        distance={90}
        aria-hidden
        className="pointer-events-none absolute -right-[4vw] top-24 hidden select-none md:block"
      >
        <span
          className="block font-[family-name:var(--font-display)] text-[22vw] font-bold leading-none tracking-tighter text-transparent"
          style={{ WebkitTextStroke: "1px rgba(245,245,245,0.06)" }}
        >
          Path
        </span>
      </Parallax>

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader eyebrow={credentials.eyebrow} id="background-heading" className="!mb-6 md:!mb-8">
            The track record <em>so far.</em>
          </SectionHeader>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-base leading-relaxed text-text-muted">
              School, startup competitions and an enterprise internship — the places I learned
              to ship, and to lead the people shipping with me.
            </p>
          </Reveal>
        </div>

        <div ref={trackRef} className="relative pl-8 md:pl-10">
          {/* Track + drawing line */}
          <div aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
          <motion.div
            aria-hidden="true"
            className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-accent via-accent to-accent/40"
            style={{ scaleY: lineScale }}
          />
          {!reduced && (
            <motion.div
              aria-hidden="true"
              className="absolute left-[3px] h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_3px_rgba(209,26,42,0.55)]"
              style={{ top: glowY }}
            />
          )}

          <div className="space-y-14 md:space-y-16">
            {credentials.groups.map((group) => (
              <TimelineGroup key={group.title} title={group.title}>
                {group.items.map((item, i) => (
                  <Reveal key={item.primary} delay={i * 0.08}>
                    <SpotlightCard className="rounded-2xl border border-border bg-surface/60 p-5 md:p-6">
                      <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-text md:text-xl">
                        {item.primary}
                      </p>
                      <p className="mt-1 text-sm text-text-muted">{item.secondary}</p>
                      {"note" in item && item.note ? (
                        <p className="mt-3 text-sm leading-relaxed text-text-muted">{item.note}</p>
                      ) : null}
                    </SpotlightCard>
                  </Reveal>
                ))}
              </TimelineGroup>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** One timeline stop: a marker that lights up on arrival, a label, and its cards. */
function TimelineGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { margin: "0px 0px -35% 0px", once: true });
  const lit = inView || !!reduced;

  return (
    <div ref={ref} className="relative">
      <motion.span
        aria-hidden="true"
        className="absolute -left-8 top-[3px] block h-[15px] w-[15px] rounded-full border md:-left-10"
        animate={{
          backgroundColor: lit ? "#D11A2A" : "#0F0F0F",
          borderColor: lit ? "#D11A2A" : "rgba(245,245,245,0.2)",
          scale: lit ? 1 : 0.8,
        }}
        transition={{ duration: 0.5, ease: EASE.out }}
      />
      <h3 className="mb-5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-accent">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
