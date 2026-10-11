"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { projects } from "@/lib/content/projects";
import { stats } from "@/lib/content/site";
import { EASE } from "@/components/motion/tokens";

/**
 * About, as one terminal window with two tabs.
 *
 * `developer` is the work. `personal` is the person. The window ends every tab with
 * a prompt ("want to see the source?"). Press Enter on a keyboard, tap the prompt on
 * a phone. The command is "typed", runs, and the window moves on: developer →
 * personal → history → back to the code.
 *
 * Reduced motion: no typing or fades, the commands still work.
 */

type TabId = "developer" | "personal";

const TABS: { id: TabId; file: string }[] = [
  { id: "developer", file: "developer.sh" },
  { id: "personal", file: "personal.log" },
];

/** Milestones for the history view, in the order they are told (no dates claimed). */
const HISTORY = [
  { tag: "root", text: "Cauayan, Isabela. Where every one of these products starts: someone nearby with a real problem." },
  { tag: "learn", text: "Started by generating code I could not explain. Stopped, and rebuilt the habit: understand every layer first." },
  { tag: "lead", text: "Led teams of 3–5 through national and regional startup competitions." },
  { tag: "place", text: "HIRED.PH: Philippine Startup Challenge 11 regional finalist, and IgnITE Start-Up Competition 1st runner up." },
  { tag: "work", text: "Enterprise ERP internship (under NDA)." },
  { tag: "now", text: "BS Computer Science, University of Saint Louis Tuguegarao, 2027. Thesis build, plus open to work." },
] as const;

const OFF_CLOCK = [
  { k: "gym", v: "regular, and the one hour with nothing to debug" },
  { k: "games", v: "valorant, the finals, genshin, mobile legends" },
  { k: "music", v: "classical to rock, no genre loyalty" },
  { k: "engines", v: "cars and big bikes. this is how garahe started" },
  { k: "next", v: "photography, and finally some travelling" },
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

function PersonalBody({ reduced, showHistory }: { reduced: boolean; showHistory: boolean }) {
  return (
    <div className="space-y-3">
      <Out i={0} reduced={reduced}>
        <Prompt>whoami --off-the-clock</Prompt>
        <p className="max-w-[62ch]">
          From Cauayan, Isabela, building for the people around me. The code is the job. This is
          the rest of the day.
        </p>
      </Out>
      <Out i={1} reduced={reduced}>
        <Prompt>ls ~/off-the-clock</Prompt>
        <ul>
          {OFF_CLOCK.map((r) => (
            <li key={r.k} className="flex gap-3">
              <span className="w-[8ch] shrink-0 text-text sm:w-[9ch]">{r.k}</span>
              <span>{r.v}</span>
            </li>
          ))}
        </ul>
      </Out>
      {showHistory && (
        <Out i={0} reduced={reduced}>
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
      )}
    </div>
  );
}

export function About() {
  const reduced = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.5 });
  const [tab, setTab] = useState<TabId>("developer");
  const [showHistory, setShowHistory] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const personal = tab === "personal";
  // The prompt at the bottom of each state, and what running it does.
  const prompt = !personal
    ? { question: "want to see the source?", cmd: "./source --why" }
    : !showHistory
      ? { question: "want to see the history?", cmd: "git log --graph" }
      : { question: "want to see the code again?", cmd: "cd ~/projects" };

  const selectTab = useCallback((next: TabId) => {
    setTab(next);
    setShowHistory(false);
  }, []);

  const run = useCallback(() => {
    if (typing) return;
    const apply = () => {
      setTyping(null);
      if (!personal) selectTab("personal");
      else if (!showHistory) setShowHistory(true);
      else selectTab("developer");
    };
    if (reduced) return apply();
    setTyping(prompt.cmd);
    timer.current = setTimeout(apply, 520);
  }, [typing, personal, showHistory, reduced, prompt.cmd, selectTab]);

  // Enter runs the prompt while the window is on screen (and nothing else has focus).
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.repeat) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && el !== document.body && el.closest("button, a, input, textarea, select, [role=tab]")) return;
      e.preventDefault();
      run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, run]);

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      selectTab(tab === "developer" ? "personal" : "developer");
    }
  };

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
          About / two tabs, one person
        </p>

        <div
          className="overflow-hidden rounded-xl border border-border bg-[#0a0a0a] font-[family-name:var(--font-mono)] text-[12px] leading-[1.7] text-text-muted shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)] sm:text-[13px]"
          style={{ ["--tab-accent" as string]: personal ? "#e0a458" : "#d11a2a" }}
        >
          {/* Title bar + tabs */}
          <div className="flex items-end gap-1 border-b border-border bg-[#101010] px-3 pt-2.5">
            <div className="mr-3 mb-2.5 hidden items-center gap-1.5 sm:flex" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#3a3a3a]" />
            </div>
            <div role="tablist" aria-label="About me" className="flex gap-1" onKeyDown={onTabKey}>
              {TABS.map((t) => {
                const selected = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    id={`about-tab-${t.id}`}
                    aria-selected={selected}
                    aria-controls="about-panel"
                    tabIndex={selected ? 0 : -1}
                    type="button"
                    onClick={() => selectTab(t.id)}
                    className={`relative rounded-t-md px-3.5 py-2 text-[12px] transition-colors ${
                      selected ? "bg-[#0a0a0a] text-text" : "text-text-muted hover:text-text"
                    }`}
                  >
                    {t.file}
                    {selected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-[2px] rounded-t-md bg-[var(--tab-accent)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="mb-2.5 ml-auto hidden text-[11px] text-text-muted/60 md:block">
              randel@cauayan ~ /about
            </span>
          </div>

          {/* Output */}
          <div
            role="tabpanel"
            id="about-panel"
            aria-labelledby={`about-tab-${tab}`}
            className="min-h-[26rem] px-4 py-5 sm:px-6"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {tab === "developer" ? (
                  <DeveloperBody reduced={reduced} />
                ) : (
                  <PersonalBody reduced={reduced} showHistory={showHistory} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* The prompt. Enter on a keyboard, tap on touch. */}
            <button
              type="button"
              onClick={run}
              className="group mt-6 flex w-full items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-left transition-colors hover:border-[var(--tab-accent)] focus-visible:border-[var(--tab-accent)] focus-visible:outline-none"
              aria-label={`${prompt.question} Run ${prompt.cmd}`}
            >
              <span className="text-[var(--tab-accent)]">$</span>
              {typing ? (
                <span className="text-text">
                  {typing}
                  <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[2px] bg-text" />
                </span>
              ) : (
                <>
                  <span className="text-text">{prompt.question}</span>
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
