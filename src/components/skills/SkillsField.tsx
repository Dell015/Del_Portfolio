"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { skills, skillCategories } from "@/lib/content/skills";
import { useModeStore } from "@/lib/store/mode";

export function SkillsField() {
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const shouldDrift = mode === "immersive" && !reducedMotion;
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const yDecor1 = useTransform(scrollYProgress, [0, 1], [90, -70]);
  const yDecor2 = useTransform(scrollYProgress, [0, 1], [-20, 40]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      data-snap-section=""
      className="relative overflow-hidden px-6 py-32 md:py-40"
    >
      {/* Decorative — full bleed */}
      <motion.div
        className="absolute top-[15%] right-[10%] w-36 h-36 rounded-full pointer-events-none"
        style={{
          y: yDecor1,
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.05) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute bottom-[25%] left-[6%] w-44 h-44 rounded-full pointer-events-none"
        style={{
          y: yDecor2,
          background: "radial-gradient(circle, rgba(242, 184, 75, 0.03) 0%, transparent 70%)",
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
          Skills
        </motion.p>

        <motion.h2
          className="mb-14 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
          initial={{ opacity: 0, x: -50, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          Tech I <span className="text-accent">work with.</span>
        </motion.h2>

        <div className="grid gap-14 md:grid-cols-2">
          {skillCategories.map((category, catIdx) => {
            const categorySkills = skills.filter((s) => s.category === category.key);
            if (categorySkills.length === 0) return null;
            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: catIdx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="mb-5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-text-muted">
                  {category.label}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {categorySkills.map((skill, i) => (
                    <SkillIcon key={skill.name} skill={skill} index={i} shouldDrift={shouldDrift} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SkillIcon({
  skill,
  index,
  shouldDrift,
}: {
  skill: (typeof skills)[number];
  index: number;
  shouldDrift: boolean;
}) {
  const driftDelay = index * 0.4;
  const driftDuration = 3 + (index % 5) * 0.5;

  const driftAnimate = shouldDrift
    ? { y: [0, -4, 0, 4, 0], rotate: [0, -2, 0, 2, 0] }
    : undefined;

  const driftTransition = shouldDrift
    ? {
        y: { duration: driftDuration, ease: "easeInOut" as const, repeat: Infinity, repeatType: "mirror" as const, delay: driftDelay },
        rotate: { duration: driftDuration, ease: "easeInOut" as const, repeat: Infinity, repeatType: "mirror" as const, delay: driftDelay },
      }
    : undefined;

  return (
    <motion.div
      className="group relative"
      tabIndex={0}
      initial={{ opacity: 0, y: 15, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      animate={driftAnimate}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
        ...driftTransition,
      }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface transition-all duration-300 grayscale hover:scale-110 hover:border-accent/30 hover:grayscale-0 focus-visible:scale-110 focus-visible:border-accent/30 focus-visible:grayscale-0 group-focus:scale-110 group-focus:grayscale-0">
        <span className="font-[family-name:var(--font-mono)] text-[10px] font-medium text-text-muted transition-colors group-hover:text-accent group-focus:text-accent">
          {skill.name.slice(0, 3)}
        </span>
      </div>
      {skill.usageNote && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-surface-2 px-3 py-1.5 text-xs text-text-muted opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus:opacity-100">
          {skill.usageNote}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-surface-2" />
        </div>
      )}
      <p className="mt-1.5 text-center font-[family-name:var(--font-mono)] text-[9px] text-text-muted/70">{skill.name}</p>
    </motion.div>
  );
}
