"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/content/projects";
import "./karela.css";

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

const ENGINES = [
  {
    cls: "kz-engine--a",
    n: "ENGINE 01",
    title: "The fitness engine",
    text: "Adaptive running that learns how you actually move, with a coach and a progression system that reward showing up.",
    points: [
      "Adaptive running algorithms",
      "A ghost pacer that models your fatigue",
      "Ani, the AI coach",
      "RPG-style progression for consistency",
    ],
  },
  {
    cls: "kz-engine--b",
    n: "ENGINE 02",
    title: "The civic engine",
    text: "Crowdsourced urban sensing, so the walking and running people already do helps the place they do it in.",
    points: [
      "Reports from everyday movement",
      "Spatial clustering on PostGIS",
      "Daily effort tied to real community impact",
      "Load that bends to how your body feels",
    ],
  },
];

const DECISIONS = [
  {
    k: "Backend",
    title: "Supabase over Firebase",
    text: "PostGIS makes spatial queries first-class. Civic clustering is DBSCAN-inspired and runs on ST_DWithin.",
  },
  {
    k: "Data",
    title: "Offline-first with expo-sqlite",
    text: "High-frequency run telemetry stays on the device, built for low-end Android phones and prepaid data.",
  },
  {
    k: "Coaching",
    title: "Gemini Flash for Ani",
    text: "Fast, frequent coaching at session start, mid-run and after the session.",
  },
  {
    k: "Core idea",
    title: "The Resonance System",
    text: "Fuses the runner's physical state with their civic contribution load.",
  },
];

function parsePhases(text?: string) {
  if (!text) return { phases: [] as { n: string; items: string[] }[], target: "" };
  const phases = [...text.matchAll(/Phase (\d): ([^.]+)\./g)].map((m) => ({
    n: m[1],
    items: m[2].split(" + ").map((s) => s.trim()).map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  }));
  const target = text.match(/Target: ([^.]+(?:\.\d+)?)\.?\s*$/)?.[1] ?? "";
  return { phases, target };
}

export function KarelaCaseStudy({ project, others }: { project: Project; others: Project[] }) {
  const { phases, target } = parsePhases(project.caseStudy?.nextSteps);
  const [challengeA, challengeB] = (project.caseStudy?.challenge ?? "").split(" Also: ");
  const chipsFirst = project.techStack;

  return (
    <main id="main" tabIndex={-1} className="kz outline-none">
      <div className="kz-bg" aria-hidden>
        <div className="kz-blob kz-blob--1" />
        <div className="kz-blob kz-blob--2" />
        <div className="kz-blob kz-blob--3" />
        <div className="kz-grain" />
      </div>

      {/* HERO */}
      <section className="kz-hero">
        <div className="kz-wrap">
          <Link href="/#projects" className="kz-back">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            Back to projects
          </Link>

          <div className="kz-hero__grid">
            <div>
              <div className="kz-status">
                <i />
                {project.status}
              </div>
              <h1 className="kz-title">
                <span className="kz-title__line" data-text="Karela">
                  Karela
                </span>
              </h1>
              <p className="kz-tagline">
                A better you, <span className="kz-grad">one quest at a time.</span>
              </p>
              <p className="kz-lead kz-sub">{project.pitch}</p>
              <div className="kz-cta">
                {project.liveUrl && (
                  <a className="kz-btn kz-btn--primary" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    Visit the project site
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                )}
                {project.demoUrl && (
                  <a className="kz-btn kz-btn--outline" href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    Try the browser demo
                  </a>
                )}
                {project.repoUrl && (
                  <a className="kz-btn kz-btn--outline" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    Source code
                  </a>
                )}
              </div>
            </div>

            <div className="kz-stage" aria-hidden>
              <div className="kz-stage__ghost kz-sprite kz-sprite--run" />
              <div className="kz-hud">
                <div className="kz-hud__top">
                  <span className="kz-hud__live">Run</span>
                  <span>Quest 07</span>
                </div>
                <div className="kz-hud__pace">
                  5:12<small>/km</small>
                </div>
                <div className="kz-hud__row">
                  <div className="kz-hud__cell">
                    <b>3.4</b>
                    <span>km</span>
                  </div>
                  <div className="kz-hud__cell">
                    <b>17:42</b>
                    <span>time</span>
                  </div>
                </div>
                <div className="kz-hud__ghost">Ghost 12 m ahead</div>
                <div className="kz-hud__bar" />
                <div className="kz-hud__fine">Illustration of the run screen, not a screenshot.</div>
              </div>
              <div className="kz-stage__ani kz-sprite kz-sprite--run" />
              <span className="kz-note kz-stage__note">tara, takbo!</span>
            </div>
          </div>
        </div>
      </section>

      {/* FACTS */}
      <div className="kz-wrap">
        <Reveal>
          <dl className="kz-facts">
            {[
              ["Role", project.role],
              ["Team", project.teamSize],
              ["Platform", project.platform === "mobile" ? "Mobile" : project.platform],
              ["Status", project.caseStudy?.timeline ?? project.status],
            ].map(([k, v]) => (
              <div className="kz-fact" key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* IDEA */}
      <section className="kz-section">
        <div className="kz-wrap">
          <Reveal>
            <p className="kz-eyebrow">The idea</p>
            <h2 className="kz-statement" style={{ marginTop: "1rem" }}>
              Turns the movement you already do into fitness progress and real <em>civic impact.</em>
            </h2>
            <p className="kz-lead">{project.plain}</p>
          </Reveal>
          <div className="kz-engines">
            {ENGINES.map((e, i) => (
              <Reveal key={e.n} delay={i * 0.1}>
                <article className={`kz-engine ${e.cls}`}>
                  <span className="kz-engine__n">{e.n}</span>
                  <h3 className="kz-h3">{e.title}</h3>
                  <p>{e.text}</p>
                  <ul>
                    {e.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GHOST */}
      <section className="kz-section" style={{ paddingTop: 0 }}>
        <div className="kz-wrap">
          <Reveal>
            <p className="kz-eyebrow">The hard part</p>
            <h2 className="kz-h2">
              Race the version of you that you can <span className="kz-grad">actually beat.</span>
            </h2>
          </Reveal>
          <Reveal>
            <div className="kz-race" aria-hidden>
              <div className="kz-race__lane">
                <span className="kz-race__who">Ghost pacer</span>
                <div className="kz-race__track" />
                <div className="kz-race__runner kz-race__runner--ghost kz-sprite kz-sprite--run" />
              </div>
              <div className="kz-race__lane">
                <span className="kz-race__who">You</span>
                <div className="kz-race__track" />
                <div className="kz-race__runner kz-sprite kz-sprite--run" />
              </div>
              <p className="kz-race__cap">Animation for illustration. The real ghost adapts to your fatigue instead of replaying your best run.</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="kz-two">
              <p>{challengeA}</p>
              {challengeB && <p>{challengeB.charAt(0).toUpperCase() + challengeB.slice(1)}</p>}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="kz-section" style={{ paddingTop: 0 }}>
        <div className="kz-wrap">
          <Reveal>
            <p className="kz-eyebrow">Architecture</p>
            <h2 className="kz-h2">
              Four decisions that <span className="kz-grad">shaped the build.</span>
            </h2>
          </Reveal>
          <div className="kz-decisions">
            {DECISIONS.map((d, i) => (
              <Reveal key={d.title} delay={(i % 2) * 0.08}>
                <article className="kz-decision">
                  <span className="kz-decision__k">{d.k}</span>
                  <h3 className="kz-h3">{d.title}</h3>
                  <p>{d.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="kz-chips" aria-label="Tech stack">
              {chipsFirst.map((t) => (
                <span className="kz-chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ROADMAP */}
      {phases.length > 0 && (
        <section className="kz-section" style={{ paddingTop: 0 }}>
          <div className="kz-wrap">
            <Reveal>
              <p className="kz-eyebrow">What&apos;s next</p>
              <h2 className="kz-h2">
                Four phases, <span className="kz-grad">one city at a time.</span>
              </h2>
            </Reveal>
            <div className="kz-road">
              {phases.map((p, i) => (
                <Reveal key={p.n} delay={i * 0.08}>
                  <div className="kz-phase">
                    <span className="kz-phase__dot" />
                    <span className="kz-phase__n">Phase {p.n}</span>
                    {p.items.map((it) => (
                      <p key={it} style={{ color: "var(--ink)", fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.3, marginTop: "0.4rem" }}>
                        {it}
                      </p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
            {target && (
              <Reveal>
                <div className="kz-target">
                  Target <b>{target}</b>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* LINKS */}
      <section className="kz-section" style={{ paddingTop: 0 }}>
        <div className="kz-wrap">
          <Reveal>
            <div className="kz-paper">
              <p className="kz-eyebrow">See it yourself</p>
              <h2 className="kz-h2">Take Karela for a walk.</h2>
              <p className="kz-paper__p">
                The project site has the full story and the waitlist. The browser demo runs on demo data only, and the code is open on GitHub.
              </p>
              <div className="kz-cta">
                {project.liveUrl && (
                  <a className="kz-btn kz-btn--ink" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    Project site
                  </a>
                )}
                {project.demoUrl && (
                  <a className="kz-btn kz-btn--outline" href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    Browser demo
                  </a>
                )}
                {project.repoUrl && (
                  <a className="kz-btn kz-btn--outline" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                )}
              </div>
              <p className="kz-paper__fine">The app is still in development and not in the stores yet.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OTHER PROJECTS */}
      <section className="kz-foot">
        <div className="kz-wrap">
          <p className="kz-eyebrow">More work</p>
          <div className="kz-others">
            {others.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="kz-other">
                <b>{p.name}</b>
                <span>{p.pitch}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
