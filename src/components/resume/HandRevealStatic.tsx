"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { resume } from "@/lib/content/site";
import { ResumeButton } from "./ResumeButton";

/**
 * Non-animated hand reveal.
 *
 * Serves three cases, all of which must show the same content as the immersive
 * version: Clean mode (the site default — no WebGL mounts anywhere), OS-level
 * `prefers-reduced-motion`, and devices where WebGL is unavailable.
 *
 * No pinning, no scroll-jack, no particles. The composed pose fades in on scroll
 * and the button is active immediately, because there's no charge-up to gate it
 * behind.
 */
export function HandRevealStatic() {
  return (
    <section
      id="resume"
      data-snap-section=""
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-24"
    >
      <FrescoWash />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center">
        <motion.p
          className="mb-10 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          {resume.eyebrow}
        </motion.p>

        {/* Hands flank the button on wide screens and stack around it on narrow
            ones, mirroring the immersive layout's landscape/portrait split. */}
        <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-2">
          <motion.div
            className="relative h-32 w-32 shrink-0 rotate-90 sm:h-40 sm:w-40 sm:rotate-0 md:h-52 md:w-52"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/hand-adam.png"
              alt=""
              fill
              sizes="(max-width: 640px) 8rem, (max-width: 768px) 10rem, 13rem"
              className="object-contain"
              aria-hidden="true"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResumeButton active />
          </motion.div>

          <motion.div
            className="relative h-32 w-32 shrink-0 -rotate-90 sm:h-40 sm:w-40 sm:rotate-0 md:h-52 md:w-52"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/hand-god.png"
              alt=""
              fill
              sizes="(max-width: 640px) 8rem, (max-width: 768px) 10rem, 13rem"
              className="object-contain"
              aria-hidden="true"
            />
          </motion.div>
        </div>

        <motion.p
          className="mt-10 max-w-sm text-center text-xs text-text-muted/50 italic"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          {resume.placeholderNote}
        </motion.p>
      </div>
    </section>
  );
}

/**
 * The fresco as atmosphere rather than decoration.
 *
 * Desaturated and pushed to ~10% so it reads as ambient depth. `next/image`
 * handles the WebP conversion — the source JPG is 2 MB, which is far too heavy
 * to ship raw for a layer this faint. Deliberately not scaled up: large raster
 * zooms go soft and would undercut the crispness of the particle work.
 */
export function FrescoWash() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        src="/creation-of-adam.jpg"
        alt=""
        fill
        quality={70}
        sizes="100vw"
        className="object-cover opacity-[0.10]"
        style={{ filter: "grayscale(1) contrast(1.1)" }}
      />
      {/* Crimson duotone pass — ties the fresco to the site accent instead of
          leaving a grey photograph sitting behind everything. */}
      <div
        className="absolute inset-0 mix-blend-color"
        style={{ background: "rgba(209, 26, 42, 0.55)" }}
      />
      {/* Vignette so the image never reads as a rectangle with visible edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 25%, var(--bg) 78%)",
        }}
      />
    </div>
  );
}
