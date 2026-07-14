"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { bio, scatterFragments } from "@/lib/content/site";

function PhotoCard({ label, index }: { label: string; index: number }) {
  return (
    <motion.div
      className="group relative flex aspect-square items-center justify-center rounded-lg border border-border bg-surface transition-all duration-300 hover:scale-[1.03] hover:border-accent/30"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
    >
      <span className="font-[family-name:var(--font-mono)] text-xs text-text-muted">
        {label} {index + 1}
      </span>
      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-end justify-center rounded-lg bg-gradient-to-t from-bg/80 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="font-[family-name:var(--font-mono)] text-xs text-accent">
          {label} #{index + 1}
        </span>
      </div>
    </motion.div>
  );
}

export function About() {
  return (
    <AnimatedSection id="about" className="relative flex items-start justify-center px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        {/* Section label */}
        <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-accent">
          About
        </p>

        {/* Display heading */}
        <h2 className="mb-8 font-[family-name:var(--font-display)] text-3xl font-bold text-text md:text-4xl lg:text-5xl">
          Who I am beyond the code
        </h2>

        {/* Bio */}
        <p className="max-w-2xl text-lg leading-relaxed text-text md:text-xl">
          {bio.short}
        </p>

        {/* Scatter fragments with hover states */}
        <div className="mt-8 flex flex-wrap gap-3">
          {scatterFragments.map((fragment, i) => (
            <motion.span
              key={fragment}
              className="cursor-default rounded-full border border-border bg-surface-2 px-4 py-1.5 font-[family-name:var(--font-mono)] text-xs text-text-muted transition-all duration-300 hover:border-accent/40 hover:text-text"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
            >
              {fragment}
            </motion.span>
          ))}
        </div>

        {/* Gradient line separator */}
        <div className="my-16 h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

        {/* Photo strips: Journey (left) + Hobbies (right) */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
          {/* Journey strip — left */}
          <div>
            <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.15em] text-text-muted">
              Journey
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-1 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PhotoCard key={`journey-${i}`} label="Journey" index={i} />
              ))}
            </div>
          </div>

          {/* Hobbies strip — right */}
          <div>
            <p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.15em] text-text-muted">
              Hobbies
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-1 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PhotoCard key={`hobbies-${i}`} label="Hobbies" index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
