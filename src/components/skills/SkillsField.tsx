"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { skills, skillCategories } from "@/lib/content/skills";
import { useModeStore } from "@/lib/store/mode";

export function SkillsField() {
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const shouldDrift = mode === "immersive" && !reducedMotion;

  return (
    <AnimatedSection id="skills" className="flex items-center justify-center px-6 py-20 md:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-accent">Skills</p>
        <h2 className="mb-12 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">Tech I work with</h2>
        <div className="grid gap-12 md:grid-cols-2">
          {skillCategories.map((category) => {
            const categorySkills = skills.filter((s) => s.category === category.key);
            if (categorySkills.length === 0) return null;
            return (
              <div key={category.key}>
                <h3 className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-text-muted">{category.label}</h3>
                <div className="flex flex-wrap gap-3">
                  {categorySkills.map((skill, i) => (
                    <SkillIcon key={skill.name} skill={skill} index={i} shouldDrift={shouldDrift} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
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
  // Index-based offset so icons drift out of phase
  const driftDelay = index * 0.4;
  // Vary duration slightly per icon (3–5s range)
  const driftDuration = 3 + (index % 5) * 0.5;

  const driftAnimate = shouldDrift
    ? { y: [0, -4, 0, 4, 0], rotate: [0, -2, 0, 2, 0] }
    : undefined;

  const driftTransition = shouldDrift
    ? {
        y: {
          duration: driftDuration,
          ease: "easeInOut" as const,
          repeat: Infinity,
          repeatType: "mirror" as const,
          delay: driftDelay,
        },
        rotate: {
          duration: driftDuration,
          ease: "easeInOut" as const,
          repeat: Infinity,
          repeatType: "mirror" as const,
          delay: driftDelay,
        },
      }
    : undefined;

  return (
    <motion.div
      className="group relative"
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      animate={driftAnimate}
      transition={{
        duration: 0.3,
        delay: index * 0.04,
        ease: [0.4, 0, 0.2, 1],
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
