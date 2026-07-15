"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GitHubCalendar } from "react-github-calendar";
import { useSnapScroll } from "@/components/SmoothScroll";
import ScrollFloat from "@/components/ScrollFloat";

const GITHUB_USERNAME = "Dell015";

export function GitHubActivity() {
  const { containerRef } = useSnapScroll();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const yDecor = useTransform(scrollYProgress, [0, 1], [50, -30]);

  return (
    <section
      ref={sectionRef}
      id="activity"
      data-snap-section=""
      className="relative overflow-hidden px-6 py-32 md:py-40"
    >
      {/* Decorative */}
      <motion.div
        className="absolute top-[20%] right-[8%] w-36 h-36 rounded-full pointer-events-none"
        style={{
          y: yDecor,
          background:
            "radial-gradient(circle, rgba(209, 26, 42, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-6xl relative z-10">
        <motion.p
          className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Activity
        </motion.p>

        <ScrollFloat
          containerClassName="mb-14 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.03}
        >
          I ship consistently.
        </ScrollFloat>

        {/* GitHub Contribution Calendar */}
        <motion.div
          className="rounded-xl border border-border bg-surface/50 p-6 md:p-8 backdrop-blur-sm overflow-x-auto"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <GitHubCalendar
            username={GITHUB_USERNAME}
            colorScheme="dark"
            blockSize={12}
            blockMargin={4}
            fontSize={13}
            theme={{
              dark: ["#1B1F24", "#2a1f1f", "#5c2626", "#8b2d2d", "#D11A2A"],
            }}
            labels={{
              totalCount: "{{count}} contributions in the last year",
            }}
          />
        </motion.div>

        {/* GitHub link */}
        <motion.a
          href="https://github.com/Dell015"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm text-text-muted transition-colors duration-300 hover:text-accent"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          @Dell015
        </motion.a>
      </div>
    </section>
  );
}
