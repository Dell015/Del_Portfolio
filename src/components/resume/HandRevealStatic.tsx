"use client";

import { motion } from "framer-motion";
import { resume } from "@/lib/content/site";
import { CopyEmailButton } from "@/components/ui/CopyEmailButton";
import { ResumeButton } from "./ResumeButton";
import { ResumeCard } from "./ResumeCard";

/**
 * The resume section for devices that can't (or shouldn't) run the particle
 * scene: WebGL missing, reduced motion, or a failed load. No pinning — there is
 * no animation to scrub through, so a tall scroll track would be dead space.
 */
export function HandRevealStatic() {
  return (
    <section
      id="resume"
      data-snap-section=""
      aria-label="Resume"
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-6 py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 45% at 50% 50%, rgba(209,26,42,0.12), transparent 70%)" }}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <motion.p
          className="mb-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-accent"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          {resume.eyebrow}
        </motion.p>

        <motion.div
          className="w-[min(72vw,320px)]"
          initial={{ opacity: 0, y: 40, rotateX: 18 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <ResumeCard />
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <ResumeButton active />
          <CopyEmailButton />
        </motion.div>
      </div>
    </section>
  );
}
