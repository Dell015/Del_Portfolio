"use client";

import { useRef, useState, useId, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion, type PanInfo } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { EASE } from "@/components/motion/tokens";
import { facts, stats } from "@/lib/content/site";

const SWIPE_THRESHOLD = 60;

const TABS = [
  { label: "Development", panel: "dev" },
  { label: "Beyond the code", panel: "life" },
] as const;

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -48 : 48, opacity: 0 }),
};

const headingClass =
  "mb-8 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight text-text md:text-5xl lg:text-6xl [&_em]:not-italic [&_em]:text-accent";

function DevelopmentPanel() {
  return (
    <div>
      <h2 className={headingClass}>
        I build products <em>end to end.</em>
      </h2>

      <Reveal>
        <p className="max-w-xl text-lg leading-relaxed text-text-muted md:text-xl">
          I&apos;m a computer science student who designs the product, architects the
          system, writes the code and leads the team around it. I used to generate code
          I couldn&apos;t explain — now I make sure I understand every layer I build on.
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <ul className="mt-10 grid gap-3 text-base text-text sm:grid-cols-2">
          {facts.map((fact) => (
            <li key={fact} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              />
              {fact}
            </li>
          ))}
        </ul>
      </Reveal>

      <dl className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={0.05 * i}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <dd className="font-[family-name:var(--font-display)] text-3xl font-bold text-text md:text-4xl">
              {stat.value}
            </dd>
            <dt className="mt-1 text-sm text-text-muted">{stat.label}</dt>
          </Reveal>
        ))}
      </dl>

      <Reveal delay={0.1}>
        <p className="mt-12 max-w-lg font-[family-name:var(--font-serif)] text-2xl italic text-text-muted">
          &ldquo;Understand it before you ship it.&rdquo;
        </p>
      </Reveal>
    </div>
  );
}

const lifeCards = [
  {
    title: "Built for here",
    description:
      "Filipino users, Philippine pricing, local problems. Karela's pilot city is Tuguegarao, and HIRED.PH is designed for workers with no degree and patchy internet.",
  },
  {
    title: "Founder mindset",
    description:
      "I think in products, not features. Every project starts with “who is this for?” — then I lead the team, from 3 to 5 people, to build it.",
  },
  {
    title: "Gym, games & music",
    description:
      "Regular at the gym. Valorant, The Finals, Genshin and Mobile Legends on the side. A playlist that runs from classical to rock.",
  },
  {
    title: "Engines & big bikes",
    description:
      "Cars and big bikes have my attention, and they directly inspired garahe. I'm also curious about photography and plan to start travelling.",
  },
] as const;

function PersonalPanel() {
  return (
    <div>
      <h2 className={headingClass}>
        The person behind <em>the terminal.</em>
      </h2>

      <Reveal>
        <p className="max-w-xl text-lg leading-relaxed text-text-muted md:text-xl">
          I&apos;m from Cauayan, Isabela, and I build for the people around me. Away
          from the editor you&apos;ll find me at the gym, in a Valorant lobby, or down a
          cars-and-big-bikes rabbit hole — which is exactly how garahe started.
        </p>
      </Reveal>

      <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
        {lifeCards.map((item, i) => (
          <Reveal
            as="li"
            key={item.title}
            delay={0.05 * i}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-semibold text-text">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-muted">{item.description}</p>
          </Reveal>
        ))}
      </ul>

      <Reveal delay={0.1}>
        <p className="mt-12 max-w-md font-[family-name:var(--font-serif)] text-2xl italic text-text-muted">
          &ldquo;Let&apos;s build something worth shipping.&rdquo;
        </p>
      </Reveal>
    </div>
  );
}

export function About() {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [direction, setDirection] = useState(0);
  const reduced = useReducedMotion();
  const uid = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabId = (i: number) => `${uid}-tab-${i}`;
  const panelId = (i: number) => `${uid}-panel-${i}`;

  const switchTab = (next: 0 | 1, focus = false) => {
    if (next === activeTab) return;
    setDirection(next > activeTab ? 1 : -1);
    setActiveTab(next);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      switchTab(activeTab === 0 ? 1 : 0, true);
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD && activeTab === 0) switchTab(1);
    else if (info.offset.x > SWIPE_THRESHOLD && activeTab === 1) switchTab(0);
  };

  const Active = activeTab === 0 ? DevelopmentPanel : PersonalPanel;
  const Inactive = activeTab === 0 ? PersonalPanel : DevelopmentPanel;

  return (
    <section
      id="about"
      data-snap-section=""
      aria-label="About"
      className="relative min-h-screen py-28 md:py-36"
    >
      {/* Depth layers: far, slow-moving glows behind the content */}
      <Parallax
        aria-hidden
        distance={140}
        className="pointer-events-none absolute right-[5%] top-20 h-40 w-40 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(209,26,42,0.07) 0%, transparent 70%)" }}
      />
      <Parallax
        aria-hidden
        distance={90}
        className="pointer-events-none absolute left-[2%] top-[55%] h-48 w-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(209,26,42,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full px-8 md:px-16 lg:px-24">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="About me"
          className="mb-12 flex items-center gap-8"
        >
          {TABS.map((tab, i) => {
            const selected = activeTab === i;
            return (
              <button
                key={tab.panel}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={tabId(i)}
                type="button"
                aria-selected={selected}
                aria-controls={panelId(i)}
                tabIndex={selected ? 0 : -1}
                onClick={() => switchTab(i as 0 | 1)}
                onKeyDown={onTabKeyDown}
                className={`relative py-1 font-[family-name:var(--font-mono)] text-sm uppercase tracking-[0.12em] transition-colors duration-300 ${
                  selected ? "text-text" : "text-text-muted hover:text-text"
                }`}
              >
                {tab.label}
                {selected && (
                  <motion.span
                    layoutId="about-tab-indicator"
                    aria-hidden="true"
                    className="absolute -bottom-2 left-0 right-0 h-[2px] rounded-full bg-accent"
                    transition={{ duration: 0.35, ease: EASE.out }}
                  />
                )}
              </button>
            );
          })}
          <span
            aria-hidden="true"
            className="ml-auto hidden font-[family-name:var(--font-mono)] text-xs text-text-muted md:block"
          >
            ← swipe or drag →
          </span>
        </div>

        {/* Active panel (animated) */}
        <div className="relative overflow-x-clip">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={activeTab}
              role="tabpanel"
              id={panelId(activeTab)}
              aria-labelledby={tabId(activeTab)}
              custom={direction}
              variants={slideVariants}
              initial={reduced ? false : "enter"}
              animate="center"
              exit={reduced ? undefined : "exit"}
              transition={{ duration: 0.4, ease: EASE.out }}
              drag={reduced ? false : "x"}
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              // Horizontal drag switches tabs; vertical gestures still scroll the page.
              style={{ touchAction: "pan-y" }}
            >
              <Active />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The other tab's content stays in the document (hidden) so it is
            still readable by search engines, AI tools and "find in page". */}
        <div
          role="tabpanel"
          id={panelId(activeTab === 0 ? 1 : 0)}
          aria-labelledby={tabId(activeTab === 0 ? 1 : 0)}
          hidden
        >
          <Inactive />
        </div>
      </div>
    </section>
  );
}
