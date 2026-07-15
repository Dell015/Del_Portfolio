"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useIsVisible } from "@/lib/hooks/useIsVisible";
import ScrollFloat from "@/components/ScrollFloat";
import { LogoLoop, type LogoItem } from "./LogoLoop";
import { GitHubCalendar } from "react-github-calendar";

const LineWaves = dynamic(() => import("./LineWaves"), { ssr: false });

// react-icons
import {
  SiTypescript,
  SiPython,
  SiDotnet,
  SiDart,
  SiReact,
  SiNextdotjs,
  SiExpo,
  SiFlutter,
  SiVuedotjs,
  SiTailwindcss,
  SiFramer,
  SiSupabase,
  SiFirebase,
  SiExpress,
  SiMongodb,
  SiPostgresql,
  SiGit,
  SiGithub,
  SiFigma,
  SiGooglegemini,
} from "react-icons/si";
import { TbAtom } from "react-icons/tb";

// Frontend row
const frontendLogos: LogoItem[] = [
  { node: <SiReact />, title: "React" },
  { node: <SiNextdotjs />, title: "Next.js" },
  { node: <SiTypescript />, title: "TypeScript" },
  { node: <SiReact />, title: "React Native" },
  { node: <SiFlutter />, title: "Flutter" },
  { node: <SiDart />, title: "Dart" },
  { node: <SiVuedotjs />, title: "Vue" },
  { node: <SiTailwindcss />, title: "Tailwind CSS" },
  { node: <SiFramer />, title: "Framer Motion" },
  { node: <SiExpo />, title: "Expo" },
  { node: <TbAtom />, title: "Zustand" },
  { node: <SiFigma />, title: "Figma" },
];

// Backend row
const backendLogos: LogoItem[] = [
  { node: <SiPython />, title: "Python" },
  { node: <SiDotnet />, title: "C#" },
  { node: <SiPostgresql />, title: "PostgreSQL" },
  { node: <SiSupabase />, title: "Supabase" },
  { node: <SiFirebase />, title: "Firebase" },
  { node: <SiExpress />, title: "Express" },
  { node: <SiMongodb />, title: "MongoDB" },
  { node: <SiGit />, title: "Git" },
  { node: <SiGithub />, title: "GitHub" },
  { node: <SiGooglegemini />, title: "Gemini Flash" },
];

const GITHUB_USERNAME = "Dell015";

export function SkillsField() {
  const { containerRef } = useSnapScroll();
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: visRef, visible: skillsVisible } = useIsVisible("300px");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const yDecor1 = useTransform(scrollYProgress, [0, 1], [90, -70]);
  const yDecor2 = useTransform(scrollYProgress, [0, 1], [-20, 40]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      data-snap-section=""
      className="relative overflow-hidden py-32 md:py-40"
    >
      <div ref={visRef} className="absolute inset-0" />

      {/* LineWaves background */}
      {skillsVisible && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <LineWaves
            speed={0.3}
            innerLineCount={32}
            outerLineCount={36}
            warpIntensity={1.0}
            rotation={-45}
            edgeFadeWidth={0.0}
            colorCycleSpeed={1.0}
            brightness={0.2}
            color1="#D11A2A"
            color2="#ff7400"
            color3="#D11A2A"
            enableMouseInteraction={false}
            mouseInfluence={2.0}
          />
        </div>
      )}

      {/* Decorative */}
      <motion.div
        className="absolute top-[15%] right-[10%] w-36 h-36 rounded-full pointer-events-none"
        style={{ y: yDecor1, background: "radial-gradient(circle, rgba(209, 26, 42, 0.05) 0%, transparent 70%)" }}
      />
      <motion.div
        className="absolute bottom-[25%] left-[6%] w-44 h-44 rounded-full pointer-events-none"
        style={{ y: yDecor2, background: "radial-gradient(circle, rgba(242, 184, 75, 0.03) 0%, transparent 70%)" }}
      />

      <div className="relative z-10">
        {/* Header - constrained */}
        <div className="px-6 mx-auto w-full max-w-6xl">
          <motion.p
            className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            Skills & Activity
          </motion.p>

          <ScrollFloat
            containerClassName="mb-14 font-[family-name:var(--font-display)] text-4xl font-bold text-text md:text-5xl lg:text-6xl leading-[1.1]"
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.03}
          >
            Tech I work with.
          </ScrollFloat>
        </div>

        {/* Logo loops + GitHub — shared soft edge fade aligned with container */}
        <div
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black calc((100% - 1152px) / 2 + 24px), black calc(100% - (100% - 1152px) / 2 - 24px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black calc((100% - 1152px) / 2 + 24px), black calc(100% - (100% - 1152px) / 2 - 24px), transparent 100%)",
          }}
        >
          <div className="flex flex-col gap-6 mb-10">
            {/* Frontend row - scrolls left */}
            <motion.div
              className="h-[60px] relative text-text-muted"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <LogoLoop
                logos={frontendLogos}
                speed={70}
                direction="left"
                logoHeight={36}
                gap={48}
                hoverSpeed={0}
                scaleOnHover
                ariaLabel="Frontend technologies"
              />
            </motion.div>

            {/* Backend row - scrolls right */}
            <motion.div
              className="h-[60px] relative text-text-muted"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <LogoLoop
                logos={backendLogos}
                speed={60}
                direction="right"
                logoHeight={36}
                gap={48}
                hoverSpeed={0}
                scaleOnHover
                ariaLabel="Backend technologies"
              />
            </motion.div>
          </div>

          {/* GitHub Activity */}
          <div className="px-6 mx-auto w-full max-w-6xl">
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
              <SiGithub className="h-4 w-4" />
              @Dell015
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
