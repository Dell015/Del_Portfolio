"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects } from "@/lib/content/projects";
import { ProjectCard } from "./ProjectCard";

export function BentoGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax on decorative elements
  const yDecor1 = useTransform(scrollYProgress, [0, 1], [80, -60]);
  const yDecor2 = useTransform(scrollYProgress, [0, 1], [-30, 50]);

  return (
    <section
      ref={sectionRef}
      id="projects"
      data-snap-section=""
      className="relative overflow-hidden px-6 py-32 md:py-40"
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
        <motion.p
          className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Projects
        </motion.p>

        <motion.h2
          className="mb-12 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
          initial={{ opacity: 0, x: -50, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Things I&apos;ve <span className="text-accent">built.</span>
        </motion.h2>

        {/* Bento grid */}
        <div className="grid auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.slug}
              className={
                project.cardVariant === "desktop"
                  ? "sm:col-span-2 lg:col-span-2"
                  : "sm:col-span-1 lg:col-span-1"
              }
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
