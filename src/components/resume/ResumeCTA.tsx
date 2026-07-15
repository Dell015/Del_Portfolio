"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ResumeCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const yDecor = useTransform(scrollYProgress, [0, 1], [60, -40]);

  return (
    <section
      ref={sectionRef}
      id="resume"
      data-snap-section=""
      className="relative overflow-hidden px-6 py-32 md:py-40"
    >
      {/* Decorative — full bleed */}
      <motion.div
        className="absolute top-[20%] left-[15%] w-48 h-48 rounded-full pointer-events-none"
        style={{
          y: yDecor,
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-3xl relative z-10 text-center">
        <motion.p
          className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-text-muted"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Want the short version?
        </motion.p>

        <motion.h2
          className="mb-8 font-[family-name:var(--font-display)] text-3xl font-bold text-text md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Download <span className="text-accent">Resume</span>
        </motion.h2>

        <motion.a
          href="#"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 font-[family-name:var(--font-display)] text-sm font-semibold text-bg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Download resume (coming soon)"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
          </svg>
          Resume.pdf
        </motion.a>

        <motion.p
          className="mt-4 text-xs text-text-muted/50 italic"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          PDF coming soon — placeholder link
        </motion.p>
      </div>
    </section>
  );
}
