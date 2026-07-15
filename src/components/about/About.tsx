"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, type PanInfo, type MotionValue } from "framer-motion";
import { scatterFragments } from "@/lib/content/site";

/**
 * About Section — horizontal panel switch with scroll-triggered parallax on every element.
 * 
 * Every element reacts to scroll — different speeds, different directions.
 * No dead space. Something is always moving.
 */

const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

function DevelopmentPanel({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Per-element parallax — every element moves at a different speed
  const yHeading = useTransform(scrollYProgress, [0, 1], [40, -30]);
  const yBody = useTransform(scrollYProgress, [0, 1], [25, -15]);
  const yFragments = useTransform(scrollYProgress, [0, 1], [35, -25]);
  const yStats = useTransform(scrollYProgress, [0, 1], [50, -35]);
  const yQuote = useTransform(scrollYProgress, [0, 1], [20, -10]);

  return (
    <div>
      <motion.h2
        className="mb-8 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
        style={{ y: yHeading }}
        initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        I build things that
        <br />
        <span className="text-accent">actually ship.</span>
      </motion.h2>

      <motion.p
        className="max-w-xl text-lg leading-relaxed text-text-muted md:text-xl"
        style={{ y: yBody }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        From concept to production — I lead teams, architect systems, and
        write the code that holds it together. No hand-offs, no excuses.
      </motion.p>

      {/* Scatter fragments — each at slightly different parallax */}
      <motion.div className="mt-10 flex flex-wrap gap-3" style={{ y: yFragments }}>
        {scatterFragments.map((fragment, i) => (
          <motion.span
            key={fragment}
            className="cursor-default rounded-full border border-white/8 bg-white/3 px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-text-muted backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:text-text hover:bg-white/5"
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            {fragment}
          </motion.span>
        ))}
      </motion.div>

      {/* Stats — aggressive parallax */}
      <motion.div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-5" style={{ y: yStats }}>
        {[
          { value: "5+", label: "Products Built" },
          { value: "3", label: "Team Leads" },
          { value: "Regional", label: "Competition Level" },
          { value: "Day 1", label: "Scale Mindset" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="text-center p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
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

      <motion.p
        className="mt-12 font-[family-name:var(--font-serif)] text-lg italic text-text-muted/60 max-w-lg"
        style={{ y: yQuote }}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        &ldquo;If it doesn&apos;t ship, it doesn&apos;t count.&rdquo;
      </motion.p>
    </div>
  );
}

function PersonalPanel({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const yHeading = useTransform(scrollYProgress, [0, 1], [40, -30]);
  const yBody = useTransform(scrollYProgress, [0, 1], [25, -15]);
  const yCards = useTransform(scrollYProgress, [0, 1], [45, -30]);
  const yQuote = useTransform(scrollYProgress, [0, 1], [20, -10]);

  return (
    <div>
      <motion.h2
        className="mb-8 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
        style={{ y: yHeading }}
        initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        The person behind
        <br />
        <span className="text-accent">the terminal.</span>
      </motion.h2>

      <motion.p
        className="max-w-xl text-lg leading-relaxed text-text-muted md:text-xl"
        style={{ y: yBody }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        When I&apos;m not shipping code, I&apos;m exploring ideas that don&apos;t compile —
        conversations, communities, and the kind of problems you can&apos;t solve with a keyboard.
      </motion.p>

      {/* Personal cards — parallax */}
      <motion.div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6" style={{ y: yCards }}>
        {[
          {
            title: "Founder Mindset",
            description: "I think in products, not features. Every project starts with 'who is this for?' and ends with 'did it ship?'",
          },
          {
            title: "Team Leadership",
            description: "Led technical teams to regional competitions. Great teams ship great products — I build both.",
          },
          {
            title: "Continuous Learning",
            description: "Always picking up new frameworks, patterns, and perspectives. The moment I stop learning is the moment I stop being useful.",
          },
          {
            title: "Real Conversations",
            description: "Some of my best product ideas came from talking to people, not reading docs. I value the human side of building.",
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            className="p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text mb-2">
              {item.title}
            </h3>
            <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-text-muted">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        className="mt-14 text-right font-[family-name:var(--font-serif)] text-lg italic text-text-muted/60 max-w-md ml-auto"
        style={{ y: yQuote }}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        &ldquo;Let&apos;s build something that actually ships.&rdquo;
      </motion.p>
    </div>
  );
}

export function About() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [direction, setDirection] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Section scroll progress — drives parallax on ALL elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Decorative parallax
  const yDecor1 = useTransform(scrollYProgress, [0, 1], [100, -80]);
  const yDecor2 = useTransform(scrollYProgress, [0, 1], [-30, 50]);
  const yDecor3 = useTransform(scrollYProgress, [0, 1], [60, -40]);
  const yTabs = useTransform(scrollYProgress, [0, 1], [15, -8]);

  const switchTab = (newTab: 0 | 1) => {
    setDirection(newTab > activeTab ? 1 : -1);
    setActiveTab(newTab);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && activeTab === 0) {
      switchTab(1);
    } else if (info.offset.x > SWIPE_THRESHOLD && activeTab === 1) {
      switchTab(0);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      data-snap-section=""
      className="relative min-h-screen overflow-hidden py-32 md:py-40"
    >
      {/* Decorative — full bleed to edges */}
      <motion.div
        className="absolute top-20 right-[5%] w-36 h-36 rounded-full pointer-events-none"
        style={{
          y: yDecor1,
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.06) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute top-[55%] left-[2%] w-44 h-44 rounded-full pointer-events-none"
        style={{
          y: yDecor2,
          background: "radial-gradient(circle, rgba(209, 26, 42, 0.04) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="absolute bottom-[15%] right-[3%] w-28 h-28 rounded-full pointer-events-none"
        style={{
          y: yDecor3,
          background: "radial-gradient(circle, rgba(242, 184, 75, 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="w-full px-8 md:px-16 lg:px-24 relative z-10">

        {/* Tab navigation — parallax */}
        <motion.div
          className="flex items-center gap-8 mb-12"
          style={{ y: yTabs }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={() => switchTab(0)}
            className={`relative font-[family-name:var(--font-mono)] text-sm uppercase tracking-[0.15em] transition-all duration-300 ${
              activeTab === 0 ? "text-text" : "text-text-muted/40 hover:text-text-muted/70"
            }`}
          >
            Development
            {activeTab === 0 && (
              <motion.div
                layoutId="about-tab-indicator"
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-accent rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
          <button
            onClick={() => switchTab(1)}
            className={`relative font-[family-name:var(--font-mono)] text-sm uppercase tracking-[0.15em] transition-all duration-300 ${
              activeTab === 1 ? "text-text" : "text-text-muted/40 hover:text-text-muted/70"
            }`}
          >
            Beyond the Code
            {activeTab === 1 && (
              <motion.div
                layoutId="about-tab-indicator"
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-accent rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>

          <motion.span
            className="ml-auto font-[family-name:var(--font-mono)] text-[10px] text-text-muted/30 uppercase tracking-widest hidden md:block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            ← drag →
          </motion.span>
        </motion.div>

        {/* Panel container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.25 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="cursor-grab active:cursor-grabbing"
            >
              {activeTab === 0
                ? <DevelopmentPanel scrollYProgress={scrollYProgress} />
                : <PersonalPanel scrollYProgress={scrollYProgress} />
              }
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
