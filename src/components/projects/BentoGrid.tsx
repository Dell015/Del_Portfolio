"use client";

import { useRef, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects } from "@/lib/content/projects";
import { ProjectCard } from "./ProjectCard";
import { useSnapScroll } from "@/components/SmoothScroll";
import { ScrollPin } from "@/components/ScrollPin";

export function BentoGrid() {
  // Snap points: heading, then each card gets its own snap
  const totalCards = projects.length;
  const snapPoints = useMemo(() => {
    // First snap = heading revealed, then evenly space cards
    const points = [0];
    for (let i = 0; i <= totalCards; i++) {
      points.push((i + 1) / (totalCards + 1));
    }
    return points;
  }, [totalCards]);

  return (
    <ScrollPin
      id="projects"
      pinDistance={1800}
      scrub={1}
      snap={snapPoints}
      snapDuration={0.5}
      className="relative overflow-hidden"
    >
      {(progress) => <BentoGridContent progress={progress} />}
    </ScrollPin>
  );
}

/** Maps a value from one range to a 0-1 progress clamped */
function mapRange(value: number, inMin: number, inMax: number): number {
  return Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
}

function BentoGridContent({ progress }: { progress: number }) {
  const { containerRef } = useSnapScroll();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax on decorative elements
  const yDecor1 = useTransform(scrollYProgress, [0, 1], [80, -60]);
  const yDecor2 = useTransform(scrollYProgress, [0, 1], [-30, 50]);

  // Heading reveals in first 15% of pin progress
  const headingOpacity = mapRange(progress, 0, 0.15);
  const headingY = 50 * (1 - mapRange(progress, 0, 0.15));

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center px-6 py-32 md:py-40"
    >
      {/* Decorative — full bleed */}
      <motion.div
        className="absolute top-[10%] left-[5%] w-40 h-40 rounded-full pointer-events-none"
        style={{
          y: yDecor1,
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.05) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[8%] w-32 h-32 rounded-full pointer-events-none"
        style={{
          y: yDecor2,
          background: "radial-gradient(circle, rgba(242, 184, 75, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-7xl relative z-10">
        {/* Section label */}
        <p
          className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
          style={{
            opacity: headingOpacity,
            transform: `translateX(${-20 * (1 - headingOpacity)}px)`,
          }}
        >
          Projects
        </p>

        {/* Heading — fades in with pin progress */}
        <h2
          className="mb-12 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
          style={{
            opacity: headingOpacity,
            transform: `translateY(${headingY}px)`,
            filter: `blur(${4 * (1 - headingOpacity)}px)`,
          }}
        >
          Things I&apos;ve <span className="text-accent">built.</span>
        </h2>

        {/* Bento grid — each card reveals at its own progress slice */}
        <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            // Each card occupies a slice of the remaining 85% (after heading)
            const cardStart = 0.15 + (i / projects.length) * 0.75;
            const cardEnd = cardStart + 0.2; // overlapping slices
            const cardProgress = mapRange(progress, cardStart, cardEnd);

            return (
              <div
                key={project.slug}
                className={
                  project.cardVariant === "desktop"
                    ? "sm:col-span-2 lg:col-span-2"
                    : "sm:col-span-1 lg:col-span-1"
                }
                style={{
                  opacity: cardProgress,
                  transform: `translateY(${30 * (1 - cardProgress)}px) scale(${0.95 + 0.05 * cardProgress})`,
                }}
              >
                <ProjectCard project={project} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
