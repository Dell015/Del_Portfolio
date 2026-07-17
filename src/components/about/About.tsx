"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, type PanInfo, type MotionValue } from "framer-motion";
import { scatterFragments } from "@/lib/content/site";
import { useSnapScroll } from "@/components/SmoothScroll";

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

/**
 * Individual element with its own parallax Y offset
 */
function ParallaxItem({
  scrollYProgress,
  yRange,
  children,
  className,
}: {
  scrollYProgress: MotionValue<number>;
  yRange: [number, number];
  children: React.ReactNode;
  className?: string;
}) {
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

function DevelopmentPanel({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const yBody = useTransform(scrollYProgress, [0, 1], [25, -15]);
  const yQuote = useTransform(scrollYProgress, [0, 1], [-10, 20]);

  return (
    <div>
      <motion.h2
        className="mb-8 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
        initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        I build things that{" "}
        <span className="text-accent">actually ship.</span>
      </motion.h2>

      <motion.p
        className="max-w-xl text-lg leading-relaxed text-text-muted md:text-xl"
        style={{ y: yBody }}
      >
        From concept to production — I lead teams, architect systems, and
        write the code that holds it together. No hand-offs, no excuses.
      </motion.p>

      {/* Scatter fragments — each at its own parallax */}
      <div className="mt-10 flex flex-wrap gap-3">
        {scatterFragments.map((fragment, i) => (
          <ParallaxItem
            key={fragment}
            scrollYProgress={scrollYProgress}
            yRange={[30 + i * 3, -20 - i * 2]}
            className="cursor-default rounded-full border border-white/8 bg-white/3 px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-text-muted backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:text-text hover:bg-white/5"
          >
            {fragment}
          </ParallaxItem>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { value: "5+", label: "Products Built" },
          { value: "3", label: "Teams Led" },
          { value: "5", label: "Tech Stacks" },
          { value: "Day 1", label: "Scale Mindset" },
        ].map((stat, i) => (
          <ParallaxItem
            key={stat.label}
            scrollYProgress={scrollYProgress}
            yRange={[40 + i * 5, -25 - i * 3]}
            className="text-center p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
          >
            <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-accent md:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.15em] text-text-muted">
              {stat.label}
            </p>
          </ParallaxItem>
        ))}
      </div>

      <motion.p
        className="mt-12 font-[family-name:var(--font-serif)] text-lg italic text-text-muted/60 max-w-lg"
        style={{ y: yQuote }}
      >
        &ldquo;If it doesn&apos;t ship, it doesn&apos;t count.&rdquo;
      </motion.p>
    </div>
  );
}

function PersonalPanel({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const yBody = useTransform(scrollYProgress, [0, 1], [25, -15]);
  const yQuote = useTransform(scrollYProgress, [0, 1], [-10, 20]);

  return (
    <div>
      <motion.h2
        className="mb-8 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
        initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        The person behind{" "}
        <span className="text-accent">the terminal.</span>
      </motion.h2>

      <motion.p
        className="max-w-xl text-lg leading-relaxed text-text-muted md:text-xl"
        style={{ y: yBody }}
      >
        When I&apos;m not shipping code, I&apos;m exploring ideas that don&apos;t compile —
        conversations, communities, and the kind of problems you can&apos;t solve with a keyboard.
      </motion.p>

      {/* Personal cards */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            title: "Founder Mindset",
            description: "I think in products, not features. Every project starts with 'who is this for?' and ends with 'did it ship?'",
          },
          {
            title: "Team Leadership",
            description: "Led teams of 3–5 across different projects and stacks. Great teams ship great products — I build both.",
          },
          {
            title: "Curiosity-Driven",
            description: "I build what genuinely interests me — fitness AI, vehicle diagnostics, drinking games, integrity auditors. The stack follows the problem, not the other way around.",
          },
          {
            title: "Real Conversations",
            description: "Some of my best product ideas came from talking to people, not reading docs. I value the human side of building.",
          },
        ].map((item, i) => (
          <ParallaxItem
            key={item.title}
            scrollYProgress={scrollYProgress}
            yRange={[35 + i * 6, -20 - i * 4]}
            className="p-6 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
          >
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text mb-2">
              {item.title}
            </h3>
            <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-text-muted">
              {item.description}
            </p>
          </ParallaxItem>
        ))}
      </div>

      <motion.p
        className="mt-14 text-right font-[family-name:var(--font-serif)] text-lg italic text-text-muted/60 max-w-md ml-auto"
        style={{ y: yQuote }}
      >
        &ldquo;Let&apos;s build something that actually ships.&rdquo;
      </motion.p>
    </div>
  );
}

export function About() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [direction, setDirection] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { containerRef } = useSnapScroll();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

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
    <div ref={sectionRef}>
      <section
        id="about"
        data-snap-section=""
        className="relative min-h-screen py-32 md:py-40"
      >
        {/* Decorative — full bleed */}
        <motion.div
          className="absolute top-20 right-[5%] w-36 h-36 rounded-full pointer-events-none"
          style={{ y: yDecor1, background: "radial-gradient(circle, rgba(209, 26, 42, 0.06) 0%, transparent 70%)" }}
        />
        <motion.div
          className="absolute top-[55%] left-[2%] w-44 h-44 rounded-full pointer-events-none"
          style={{ y: yDecor2, background: "radial-gradient(circle, rgba(209, 26, 42, 0.04) 0%, transparent 70%)" }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[3%] w-28 h-28 rounded-full pointer-events-none"
          style={{ y: yDecor3, background: "radial-gradient(circle, rgba(242, 184, 75, 0.04) 0%, transparent 70%)" }}
        />

        <div className="w-full px-8 md:px-16 lg:px-24 relative z-10">
          {/* Tabs */}
          <motion.div className="flex items-center gap-8 mb-12" style={{ y: yTabs }}>
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
            <span className="ml-auto font-[family-name:var(--font-mono)] text-[10px] text-text-muted/30 uppercase tracking-widest hidden md:block">
              ← drag →
            </span>
          </motion.div>

          {/* Panel */}
          <div className="relative">
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
          </div>
        </div>
      </section>
    </div>
  );
}
