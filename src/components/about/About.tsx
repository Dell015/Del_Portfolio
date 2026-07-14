"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { bio, scatterFragments } from "@/lib/content/site";

export function About() {
  return (
    <AnimatedSection id="about" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        {/* Section label */}
        <p className="mb-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-accent">
          About
        </p>

        {/* Bio */}
        <p className="max-w-2xl text-lg leading-relaxed text-text md:text-xl">
          {bio.short}
        </p>

        {/* Scatter fragments as tags — staggered */}
        <div className="mt-8 flex flex-wrap gap-3">
          {scatterFragments.map((fragment, i) => (
            <motion.span
              key={fragment}
              className="rounded-full border border-border bg-surface-2 px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs text-text-muted"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {fragment}
            </motion.span>
          ))}
        </div>

        {/* Photo grid placeholders */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <span className="font-[family-name:var(--font-mono)] text-xs text-text-muted">
                {i < 4 ? "Journey" : "Hobbies"}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
