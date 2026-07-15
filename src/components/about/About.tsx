"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { scatterFragments } from "@/lib/content/site";

/**
 * About Section — redesigned with scroll-triggered parallax.
 *
 * Mixed aggressive + subtle parallax:
 * - Heading: aggressive (moves faster than scroll)
 * - Body text: subtle (slightly slower than scroll)
 * - Scatter fragments: staggered, each at different parallax depths
 * - Decorative elements: very aggressive parallax for depth
 *
 * Each element has different intro and outro animations.
 */

export function About() {
  const sectionRef = useRef<HTMLElement>(null);

  // Track scroll progress within this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"], // 0 when section top hits viewport bottom, 1 when section bottom passes viewport top
  });

  // Parallax transforms — only on decorative/non-stacking elements
  const yFragments = useTransform(scrollYProgress, [0, 1], [30, -20]); // gentle
  const yDecor1 = useTransform(scrollYProgress, [0, 1], [120, -100]); // very aggressive
  const yDecor2 = useTransform(scrollYProgress, [0, 1], [-40, 60]); // reverse parallax

  // Opacity based on scroll position
  const opacityIn = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const opacityOut = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  return (
    <motion.section
      ref={sectionRef}
      id="about"
      data-snap-section=""
      className="relative min-h-screen overflow-hidden px-6 py-32 md:py-40"
    >
      {/* Decorative floating elements — very aggressive parallax for depth */}
      <motion.div
        className="absolute top-20 right-[15%] w-32 h-32 rounded-full pointer-events-none"
        style={{
          y: yDecor1,
          opacity: opacityIn,
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.06) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute bottom-40 left-[10%] w-48 h-48 rounded-full pointer-events-none"
        style={{
          y: yDecor2,
          opacity: opacityOut,
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* Section label */}
        <motion.p
          className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          About
        </motion.p>

        {/* Heading — slides in from left */}
        <motion.h2
          className="mb-8 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
          initial={{ opacity: 0, x: -50, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          I build things that
          <br />
          <span className="text-accent">actually ship.</span>
        </motion.h2>

        {/* Body — subtle parallax, fades up */}
        <motion.p
          className="max-w-xl text-lg leading-relaxed text-text-muted md:text-xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          From concept to production — I lead teams, architect systems, and
          write the code that holds it together. No hand-offs, no excuses.
        </motion.p>

        {/* Scatter fragments — staggered parallax, each at different depth */}
        <motion.div
          className="mt-12 flex flex-wrap gap-3"
          style={{ y: yFragments }}
        >
          {scatterFragments.map((fragment, i) => (
            <motion.span
              key={fragment}
              className="cursor-default rounded-full border border-white/8 bg-white/3 px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-text-muted backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:text-text hover:bg-white/5"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: 0.3 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {fragment}
            </motion.span>
          ))}
        </motion.div>

        {/* Stats / highlights — aggressive parallax, scale in */}
        <motion.div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: "5+", label: "Products Built" },
            { value: "3", label: "Team Leads" },
            { value: "Regional", label: "Competition Level" },
            { value: "Day 1", label: "Scale Mindset" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.4 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-text-muted">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing statement — reverse parallax for contrast */}
        <motion.p
          className="mt-16 text-right font-[family-name:var(--font-serif)] text-lg italic text-text-muted/70 max-w-md ml-auto"
          style={{ y: yDecor2 }}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          &ldquo;If it doesn&apos;t ship, it doesn&apos;t count.&rdquo;
        </motion.p>
      </div>
    </motion.section>
  );
}
