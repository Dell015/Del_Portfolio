"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { contact } from "@/lib/content/site";

/**
 * The two side panels of the hero. Each is a small "instrument": a mono label, a
 * thin rule that draws toward the portrait, real facts (a live Cauayan clock,
 * counted-up numbers, the stack), and ways to reach Randel without scrolling.
 *
 * Sizes and positions are driven by the parent so the existing scroll exits
 * (top panel leaves first, bottom panel second) keep working.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Cauayan City, Isabela. */
const COORDS = "16.93°N 121.77°E";

const STACK = ["React", "Next.js", "TypeScript", "Flutter", "Supabase", "Python", "C#", "Figma"] as const;

function useManilaClock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Manila",
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Rule({ delay, align }: { delay: number; align: "left" | "right" }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px w-full bg-gradient-to-r ${align === "right" ? "origin-right from-transparent to-white/40" : "origin-left from-white/40 to-transparent"}`}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    />
  );
}

function CountUp({ to, delay, pad = 2, suffix = "" }: { to: number; delay: number; pad?: number; suffix?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => String(Math.round(v)).padStart(pad, "0") + suffix);
  useEffect(() => {
    const c = animate(mv, to, { duration: 1.6, delay, ease: EASE });
    return () => c.stop();
  }, [mv, to, delay]);
  return <motion.span>{text}</motion.span>;
}

const linkClass =
  "pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-text backdrop-blur-sm transition-colors duration-300 hover:border-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function ContactLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a href="#footer" className={`${linkClass} !border-accent/60 !bg-accent/90 hover:!bg-text hover:!text-bg`}>
        Contact <span aria-hidden="true">→</span>
      </a>
      <a href={contact.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
        GitHub <span aria-hidden="true">↗</span>
      </a>
      <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
        LinkedIn <span aria-hidden="true">↗</span>
      </a>
      <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Facebook <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

export function TopRightPanel({ delay, style }: { delay: number; style: { y: MotionValue<number>; opacity: MotionValue<number> } }) {
  const clock = useManilaClock();
  return (
    <motion.div
      className="absolute right-6 top-[19%] z-[3] w-[300px] text-right lg:right-10 lg:w-[330px]"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      style={style}
    >
      <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-accent">[ 01 / profile ]</p>
      <Rule delay={delay + 0.2} align="right" />
      <p className="mt-3 font-[family-name:var(--font-body)] text-[15px] leading-relaxed text-text">
        CS student from Cauayan, Isabela. I design the product, architect the system and build it end to end.
      </p>

      <div className="mt-4 flex items-center justify-end gap-3 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.1em] text-text-muted">
        <span className="inline-flex items-center gap-1.5 text-text">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          open to work
        </span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums" aria-label="Local time in Cauayan">
          {clock ?? "--:--:--"} PHT
        </span>
      </div>
      <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] tracking-[0.18em] text-text-muted/70">{COORDS}</p>

      <ContactLinks className="mt-5 justify-end" />
    </motion.div>
  );
}

export function BottomLeftPanel({ delay, style }: { delay: number; style: { y: MotionValue<number>; opacity: MotionValue<number> } }) {
  return (
    <motion.div
      className="absolute bottom-[17%] left-6 z-[3] w-[290px] lg:left-10 lg:w-[320px]"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      style={style}
    >
      <p className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.24em] text-accent">[ 02 / record ]</p>
      <Rule delay={delay + 0.2} align="left" />

      <dl className="mt-3 grid grid-cols-3 gap-4">
        {[
          { to: 7, label: "products designed", suffix: "", pad: 2 },
          { to: 2, label: "competition placements", suffix: "", pad: 2 },
          { to: 5, label: "people, largest team led", suffix: "", pad: 2 },
        ].map((s, i) => (
          <div key={s.label}>
            <dd className="font-[family-name:var(--font-display)] text-4xl font-bold leading-none tabular-nums text-text">
              <CountUp to={s.to} delay={delay + 0.35 + i * 0.12} pad={s.pad} suffix={s.suffix} />
            </dd>
            <dt className="mt-1.5 font-[family-name:var(--font-mono)] text-[9.5px] uppercase leading-snug tracking-[0.12em] text-text-muted">
              {s.label}
            </dt>
          </div>
        ))}
      </dl>

      <p className="mt-4 font-[family-name:var(--font-serif)] text-base italic leading-snug text-text-muted">
        And a habit of understanding every line I write.
      </p>

      {/* Stack ticker */}
      <div
        aria-label={`Stack: ${STACK.join(", ")}`}
        className="relative mt-4 overflow-hidden border-y border-white/10 py-1.5 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
      >
        <div className="hero-ticker flex w-max gap-6 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.18em] text-text-muted" aria-hidden="true">
          {[...STACK, ...STACK].map((t, i) => (
            <span key={`${t}-${i}`} className="whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** Corner brackets and a caption that frame the portrait like a viewfinder. */
export function PortraitFrame({ delay, opacity }: { delay: number; opacity: MotionValue<number> }) {
  const corner = "absolute h-5 w-5 border-white/50";
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center"
      style={{ opacity }}
    >
      <motion.div
        className="relative h-[72%] aspect-[3/4]"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        <span className={`${corner} left-0 top-0 border-l border-t`} />
        <span className={`${corner} right-0 top-0 border-r border-t`} />
        <span className={`${corner} bottom-0 left-0 border-b border-l`} />
        <span className={`${corner} bottom-0 right-0 border-b border-r`} />
        <span className="absolute -bottom-6 left-0 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-text-muted/80">
          fig. 01 / randel serafica
        </span>
        <span className="absolute -bottom-6 right-0 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.22em] text-text-muted/80">
          scroll ↓
        </span>
      </motion.div>
    </motion.div>
  );
}
