"use client";

import { motion } from "framer-motion";
import { site } from "@/lib/content/site";

export function HeroStatic() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface/50 via-bg to-bg" />

      <motion.div
        className="relative z-10 flex max-w-3xl flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Name */}
        <motion.p
          className="font-[family-name:var(--font-mono)] text-sm uppercase tracking-[0.2em] text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {site.name}
        </motion.p>

        {/* Hero question */}
        <motion.h1
          className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {site.heroQuestion}
        </motion.h1>

        {/* Identity statement */}
        <motion.p
          className="max-w-xl text-lg text-text-muted"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {site.identityStatement}
        </motion.p>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <span className="text-xs uppercase tracking-widest text-text-muted">
          Scroll
        </span>
        <div className="h-8 w-[1px] animate-pulse bg-accent/60" />
      </motion.div>
    </section>
  );
}
