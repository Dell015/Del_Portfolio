"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { projects } from "@/lib/content/projects";
import { stats } from "@/lib/content/site";
import { EASE } from "@/components/motion/tokens";

/**
 * About, as one terminal window (`developer.sh`).
 *
 * The window ends with a prompt ("want to see the source?"). Press Enter on a
 * keyboard, tap the prompt on a phone. The command is "typed", runs, and moves on to
 * the projects. (The planned particle transition will hook in here, see
 * docs/planning/about-transitions-decisions.md.)
 *
 * Reduced motion: no typing or fades, the command still works.
 */

/** Milestones for the history view, in the order they are told (no dates claimed). */
const HISTORY = [
  { tag: "root", text: "Cauayan, Isabela. Where every one of these products starts: someone nearby with a real problem." },
  { tag: "learn", text: "Started by generating code I could not explain. Stopped, and rebuilt the habit: understand every layer first." },
  { tag: "lead", text: "Led teams of 3–5 through national and regional startup competitions." },
  { tag: "place", text: "HIRED.PH: Philippine Startup Challenge 11 regional finalist, and IgnITE Start-Up Competition 1st runner up." },
  { tag: "work", text: "Enterprise ERP internship (under NDA)." },
  { tag: "now", text: "BS Computer Science, University of Saint Louis Tuguegarao, 2027. Thesis build, plus open to work." },
] as const;

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[var(--tab-accent)]">$</span>{" "}
      <span className="text-text">{children}</span>
    </div>
  );
}

/** A block that "prints" in after its predecessors. Instant for reduced motion. */
function Out({ i, children, reduced }: { i: number; children: React.ReactNode; reduced: boolean }) {
  if (reduced) return <div>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.12 + i * 0.16, ease: EASE.out }}
    >
      {children}
    </motion.div>
  );
}

function DeveloperBody({ reduced }: { reduced: boolean }) {
  return (
    <div className="space-y-3">
      <Out i={0} reduced={reduced}>
        <Prompt>whoami</Prompt>
        <div>randel serafica / cs student / cauayan, isabela</div>
      </Out>
      <Out i={1} reduced={reduced}>
        <Prompt>cat about.md</Prompt>
        <p className="max-w-[62ch]">
          I design the product, architect the system, write the code and lead the team around
          it. I used to ship code I couldn&apos;t explain. Now I understand every layer I build
          on.
        </p>
      </Out>
      <Out i={2} reduced={reduced}>
        <Prompt>git log --oneline projects/</Prompt>
        <ul>
          {projects.map((p, i) => (
            <li key={p.slug} className="flex gap-3">
              <span className="w-[3ch] shrink-0 text-text-muted/45">{String(7 - i).padStart(3, "0")}</span>
              <span className="w-[8ch] shrink-0 text-text sm:w-[9ch]">{p.name.toLowerCase()}</span>
              <span className="truncate">{p.status.toLowerCase()}</span>
            </li>
          ))}
        </ul>
      </Out>
      <Out i={3} reduced={reduced}>
        <Prompt>git log --graph --oneline history/</Prompt>
        <ul>
          {HISTORY.map((h, i) => (
            <li key={h.tag} className="flex gap-3">
              <span aria-hidden="true" className="w-[2ch] shrink-0 text-[var(--tab-accent)]">
                {i === HISTORY.length - 1 ? "*" : "|"}
              </span>
              <span className="w-[6ch] shrink-0 text-text">{h.tag}</span>
              <span>{h.text}</span>
            </li>
          ))}
        </ul>
      </Out>
      <Out i={4} reduced={reduced}>
        <Prompt>./numbers</Prompt>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <dd className="text-lg font-semibold text-[var(--tab-accent)]">{s.value}</dd>
              <dt className="text-[11px] leading-tight">{s.label.toLowerCase()}</dt>
            </div>
          ))}
        </dl>
      </Out>
    </div>
  );
}


const PROMPT = { question: "want to see the source?", cmd: "./source --why" } as const;

export function About() {
  const reduced = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.5 });
  const [typing, setTyping] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const run = useCallback(() => {
    if (typing) return;
    const apply = () => {
      setTyping(null);
      document.getElementById("projects")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    };
    if (reduced) return apply();
    setTyping(PROMPT.cmd);
    timer.current = setTimeout(apply, 520);
  }, [typing, reduced]);

  // Enter runs the prompt while the window is on screen (and nothing else has focus).
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && el !== document.body && el.closest("button, a, input, textarea, select")) return;
      e.preventDefault();
      run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, run]);

  return (
    <section
      id="about"
      ref={sectionRef}
      data-snap-section=""
      aria-label="About"
      // Opaque and above the fixed particle canvas, so nothing floats behind the text.
      className="relative z-[2] flex min-h-screen items-center bg-bg py-24 md:py-28"
    >
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-8">
        <p className="mb-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.22em] text-text-muted">
          About / developer.sh
        </p>

        <div
          className="overflow-hidden rounded-xl border border-border bg-[#0a0a0a] font-[family-name:var(--font-mono)] text-[12px] leading-[1.7] text-text-muted shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)] sm:text-[13px]"
          style={{ ["--tab-accent" as string]: "#d11a2a" }}
        >
          {/* Title bar */}
          <div className="flex items-end gap-1 border-b border-border bg-[#101010] px-3 pt-2.5">
            <div className="mr-3 mb-2.5 hidden items-center gap-1.5 sm:flex" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
            </div>
            <span className="relative rounded-t-md bg-[#0a0a0a] px-3.5 py-2 text-[12px] text-text">
              developer.sh
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-md bg-[var(--tab-accent)]"
              />
            </span>
            <span className="mb-2.5 ml-auto hidden text-[11px] text-text-muted/60 md:block">
              randel@cauayan ~ /about
            </span>
          </div>

          {/* Output */}
          <div className="min-h-[26rem] px-4 py-5 sm:px-6">
            <DeveloperBody reduced={reduced} />

            {/* The prompt. Enter on a keyboard, tap on touch. */}
            <button
              type="button"
              onClick={run}
              className="group mt-6 flex w-full items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-left transition-colors hover:border-[var(--tab-accent)] focus-visible:border-[var(--tab-accent)] focus-visible:outline-none"
              aria-label={`${PROMPT.question} Run ${PROMPT.cmd}`}
            >
              <span className="text-[var(--tab-accent)]">$</span>
              {typing ? (
                <span className="text-text">
                  {typing}
                  <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[2px] bg-text" />
                </span>
              ) : (
                <>
                  <span className="text-text">{PROMPT.question}</span>
                  <span className="inline-block h-[1em] w-[0.5ch] translate-y-[2px] animate-pulse bg-text-muted" />
                </>
              )}
              <span className="ml-auto shrink-0 rounded border border-border px-2 py-0.5 text-[11px] text-text-muted transition-colors group-hover:text-text">
                <span className="hidden pointer-fine:inline">press enter ↵</span>
                <span className="pointer-fine:hidden">tap to run ↵</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
