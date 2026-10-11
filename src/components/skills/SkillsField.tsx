"use client";

import { GitHubCalendar } from "react-github-calendar";
import { useIsClient } from "@/lib/hooks/useIsClient";
import { skills, skillCategories } from "@/lib/content/skills";
import { SectionHeader } from "@/components/motion/SectionHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { DotField } from "@/components/effects/DotField";
import { LogoLoop, type LogoItem } from "./LogoLoop";

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

/** Decorative strip only, the readable skill list above is the real content. */
const logos: LogoItem[] = [
  { node: <SiReact />, title: "React" },
  { node: <SiNextdotjs />, title: "Next.js" },
  { node: <SiTypescript />, title: "TypeScript" },
  { node: <SiFlutter />, title: "Flutter" },
  { node: <SiDart />, title: "Dart" },
  { node: <SiVuedotjs />, title: "Vue" },
  { node: <SiTailwindcss />, title: "Tailwind CSS" },
  { node: <SiFramer />, title: "Framer Motion" },
  { node: <SiExpo />, title: "Expo" },
  { node: <TbAtom />, title: "Zustand" },
  { node: <SiFigma />, title: "Figma" },
  { node: <SiPython />, title: "Python" },
  { node: <SiDotnet />, title: "C#" },
  { node: <SiPostgresql />, title: "PostgreSQL" },
  { node: <SiSupabase />, title: "Supabase" },
  { node: <SiFirebase />, title: "Firebase" },
  { node: <SiExpress />, title: "Express" },
  { node: <SiMongodb />, title: "MongoDB" },
  { node: <SiGit />, title: "Git" },
  { node: <SiGithub />, title: "GitHub" },
  { node: <SiGooglegemini />, title: "Gemini" },
];

/** One plain-English line per group, so the list reads for non-engineers too. */
const GROUP_BLURB: Record<(typeof skillCategories)[number]["key"], string> = {
  language: "How I write software",
  frontend: "What people see and touch",
  backend: "Servers, data and payments",
  ai: "Models and outside services",
  tools: "How I build, ship and collaborate",
};

const GITHUB_USERNAME = "Dell015";

export function SkillsField() {
  const isClient = useIsClient();

  return (
    <section
      id="skills"
      data-snap-section=""
      aria-labelledby="skills-heading"
      className="relative overflow-hidden py-28 md:py-36"
    >
      <DotField />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeader eyebrow="Skills" id="skills-heading">
          Tech I <em>work with.</em>
        </SectionHeader>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {skillCategories.map((cat, i) => (
            <Reveal key={cat.key} delay={(i % 3) * 0.07} className={i < 3 ? "lg:col-span-2" : "lg:col-span-3"}>
              <SpotlightCard className="h-full rounded-2xl border border-border bg-surface/50 p-6 backdrop-blur-[2px]">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text">
                {cat.label}
              </h3>
              <p className="mt-1 text-sm text-text-muted">{GROUP_BLURB[cat.key]}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {skills
                  .filter((s) => s.category === cat.key)
                  .map((s) => (
                    <li
                      key={s.name}
                      className="rounded-md border border-border bg-surface px-2.5 py-1 font-[family-name:var(--font-mono)] text-xs text-text/90"
                    >
                      {s.name}
                    </li>
                  ))}
              </ul>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Decorative marquee */}
      <Parallax distance={24} aria-hidden>
        <div
          className="relative mx-auto mt-16 h-[56px] max-w-6xl text-text-muted"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <LogoLoop
            logos={logos}
            speed={55}
            direction="left"
            logoHeight={32}
            gap={48}
            hoverSpeed={0}
            ariaLabel="Technology logos"
          />
        </div>
      </Parallax>

      <div className="relative z-10 mx-auto mt-16 w-full max-w-6xl px-6 md:px-10">
        <Reveal>
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface/60 p-6 md:p-8">
            {/* Browser-only widget (fetches contributions at runtime): rendered after hydration
                so the server HTML and the first client render match. */}
            {isClient ? (
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
              errorMessage="The contribution graph can't load right now."
            />
            ) : (
              <div className="h-[140px]" aria-hidden="true" />
            )}
          </div>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm text-text-muted transition-colors duration-300 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <SiGithub className="h-4 w-4" aria-hidden="true" />
            @{GITHUB_USERNAME} on GitHub
          </a>
        </Reveal>
      </div>
    </section>
  );
}
