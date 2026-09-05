"use client";

import { motion } from "framer-motion";
import { resume } from "@/lib/content/site";
import { ResumeButton } from "./ResumeButton";

/**
 * Last-resort fallback for devices where WebGL cannot be created at all.
 *
 * Shows the CTA and nothing else. It deliberately does NOT render the hand PNGs:
 * flat photographs of the fresco were the thing that made this section look like
 * stock art rather than a particle piece, and a still image is a poor imitation of
 * the effect it replaces. If the particles can't run, the honest fallback is just
 * the button.
 *
 * No pinning here — there is no animation to scrub through, so a tall scroll track
 * would be dead space.
 */
export function HandRevealStatic() {
  return (
    <section
      id="resume"
      data-snap-section=""
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24"
    >
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <motion.p
          className="mb-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          {resume.eyebrow}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <ResumeButton active />
        </motion.div>

        <motion.p
          className="mt-8 text-xs text-text-muted/50 italic"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {resume.placeholderNote}
        </motion.p>
      </div>
    </section>
  );
}
