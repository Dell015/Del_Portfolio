"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { projects } from "@/lib/content/projects";
import { ProjectCard } from "./ProjectCard";

export function BentoGrid() {
  return (
    <AnimatedSection id="projects" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section label */}
        <p className="mb-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-accent">
          Projects
        </p>

        <h2 className="mb-12 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">
          Things I&apos;ve built
        </h2>

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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
