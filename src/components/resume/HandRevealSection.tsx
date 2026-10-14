"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";
import dynamic from "next/dynamic";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { useIsVisible } from "@/lib/hooks/useIsVisible";
import { availability, resume } from "@/lib/content/site";
import {
  alignCloudTipToOrigin,
  cloneCloud,
  rotateCloudZ,
  sampleImageToPoints,
  subsampleCloud,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";

const HandParticleCanvas = dynamic(
  () => import("./HandParticleCanvas").then((m) => m.HandParticleCanvas),
  { ssr: false },
);

const GOD_SRC = "/hand-god.png";
const ADAM_SRC = "/hand-adam.png";
const BUDGET = { high: 60_000, low: 12_000 } as const;
type Orientation = "landscape" | "portrait";

function subscribeOrientation(cb: () => void) {
  window.addEventListener("resize", cb);
  window.addEventListener("orientationchange", cb);
  return () => {
    window.removeEventListener("resize", cb);
    window.removeEventListener("orientationchange", cb);
  };
}
const getOrientation = (): Orientation => (window.innerWidth < window.innerHeight ? "portrait" : "landscape");
const getOrientationServer = (): Orientation => "landscape";
import { HandRevealStatic } from "./HandRevealStatic";
import { CopyEmailButton } from "@/components/ui/CopyEmailButton";
import { ResumeButton } from "./ResumeButton";
import { ResumeCard } from "./ResumeCard";

/** Scroll distance the section stays pinned. 300vh matches ProjectSphereSection,
 *  the pattern already established for pinning on this page. */
const PIN_HEIGHT_VH = 400;

/** Progress at which the button becomes interactive, the page is essentially
 *  printed by here, and gating clicks avoids an invisible-but-clickable target. */
const BUTTON_ACTIVE_AT = 0.84;

/** Two particle hands reach in, touch, and the resume appears between them. */
export function HandRevealSection() {
  const { webglAvailable, tier } = useDeviceCapability();
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <HandRevealStatic />;
  if (tier === "unknown" || !webglAvailable || tier === "none") return <HandRevealStatic />;
  return <HandRevealImmersive tier={tier === "low" ? "low" : "high"} />;
}

function HandRevealImmersive({ tier }: { tier: "high" | "low" }) {
  const { containerRef } = useSnapScroll();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { ref: visibilityRef, visible } = useIsVisible("400px");
  const orientation = useSyncExternalStore(subscribeOrientation, getOrientation, getOrientationServer);
  const [rawSamples, setRawSamples] = useState<{ god: PointCloud; adam: PointCloud } | null>(null);
  const [failed, setFailed] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const progressRef = useRef(0);

  const clouds = useMemo(
    () => (rawSamples ? deriveClouds(rawSamples, orientation) : null),
    [rawSamples, orientation],
  );

  useEffect(() => {
    if (!visible || rawSamples || failed) return;
    let cancelled = false;
    (async () => {
      try {
        const interval = tier === "high" ? 1 : 2;
        const [god, adam] = await Promise.all([
          sampleImageToPoints(GOD_SRC, { gridInterval: interval, alphaThreshold: 10 }),
          sampleImageToPoints(ADAM_SRC, { gridInterval: interval, alphaThreshold: 10 }),
        ]);
        if (cancelled) return;
        const budget = BUDGET[tier];
        setRawSamples({ god: subsampleCloud(god, budget), adam: subsampleCloud(adam, budget, 0x5bf03635) });
      } catch (err) {
        if (cancelled) return;
        console.error("[hand-reveal] Failed to sample hand crops:", err);
        setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, tier, failed, rawSamples]);

  // ── Scroll progress over the pinned range ──
  // "start start" → sticky begins pinning; "end end" → sticky releases. So 0→1
  // maps exactly onto the pinned duration, with no magic page numbers.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    container: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    const active = v >= BUTTON_ACTIVE_AT;
    // Only flips twice across the whole section, so the render cost is trivial.
    setButtonActive((prev) => (prev === active ? prev : active));
  });

  // Everything below rides motion values, so scrolling never re-renders React.
  //
  // Each range spans the FULL 0→1 progress domain with the final value repeated
  // to hold it. Relying on out-of-range clamping proved unsafe: an opacity
  // transform declared as [0.15, 0.82] → [0.25, 1] ramped back down past 0.82.
  //
  // Story over the pinned scroll: the hands reach in → touch (flash) → the page
  // unfolds out of the contact point, small, blurred and tipped back, and grows
  // to full size while a scan line writes its text in (that part is `reveal`,
  // read by the card itself) → the actions settle in below it.
  const handsOpacity = useTransform(scrollYProgress, [0, 1], [1, 1]);
  const handsScale = useTransform(scrollYProgress, [0, 1], [1, 1]);
  const flashOpacity = useTransform(scrollYProgress, [0, 0.5, 0.56, 0.7, 1], [0, 0, 0.7, 0, 0]);
  const flashScale = useTransform(scrollYProgress, [0, 0.5, 0.7, 1], [0.4, 0.4, 2.4, 2.4]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.06, 0.45, 0.55, 1], [0, 1, 1, 0, 0]);

  if (failed) return <HandRevealStatic />;

  return (
    <div
      ref={sectionRef}
      id="resume"
      data-snap-section=""
      className="relative z-[2]"
      style={{ height: `${PIN_HEIGHT_VH}vh` }}
    >
      <div ref={visibilityRef} className="pointer-events-none absolute inset-0" />

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {clouds && (
          <motion.div className="absolute inset-0 z-[1]" style={{ opacity: handsOpacity, scale: handsScale }}>
            <HandParticleCanvas
              godCloud={clouds.god}
              adamCloud={clouds.adam}
              portrait={orientation === "portrait"}
              progressRef={progressRef}
              active={visible}
            />
          </motion.div>
        )}

        {/* Overlay content. The wrapper ignores pointer events so it never
            swallows scroll; the button re-enables them on itself. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
          <motion.p
            className="absolute top-[18%] font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.18em] text-accent"
            style={{ opacity: eyebrowOpacity }}
          >
            {resume.eyebrow}
          </motion.p>

          {/* Contact flash, a soft ring that opens where the fingertips meet */}
          <motion.div
            aria-hidden="true"
            className="absolute h-[34vmin] w-[34vmin] rounded-full"
            style={{
              opacity: flashOpacity,
              scale: flashScale,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(209,26,42,0.45) 28%, transparent 66%)",
            }}
          />

          {/* Side notes, only where the screen is wide enough that they sit
              between the hands and the card instead of on top of either. */}
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 hidden w-[calc(50vw-100px)] -translate-x-1/2 -translate-y-[62%] justify-between min-[1700px]:flex"
          >
            <div className="w-[calc((50vw-100px-380px)/2-24px)] space-y-7">
              <SideNote p={scrollYProgress} at={0.26} right label="Format" value="One page" detail="PDF · ATS-friendly" />
              <SideNote p={scrollYProgress} at={0.34} right label="Updated" value="October 2026" detail="Always the latest" />
            </div>
            <div className="w-[calc((50vw-100px-380px)/2-24px)] space-y-7">
              <SideNote p={scrollYProgress} at={0.42} label="Based in" value="Cauayan, Isabela" detail="Philippines · Remote-friendly" />
              <SideNote p={scrollYProgress} at={0.5} label="Status" value={availability.label} detail="Internships and junior roles" live />
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-7 sm:gap-9">
            <Reveal p={scrollYProgress} at={0.52} len={0.16} y={34} scaleFrom={0.9} blur={10}
              className={`w-[min(72vw,40vh,380px)] portrait:w-[min(56vw,34vh,380px)] ${buttonActive ? "pointer-events-auto" : ""}`}>
              <ResumeCard />
            </Reveal>

            <div className="pointer-events-auto flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                <Reveal p={scrollYProgress} at={0.7} len={0.07} y={20}>
                  <ResumeButton active={buttonActive} />
                </Reveal>
                <Reveal p={scrollYProgress} at={0.74} len={0.07} y={20}>
                  <CopyEmailButton />
                </Reveal>
              </div>
              <Reveal p={scrollYProgress} at={0.79} len={0.06} y={10}>
                <p className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-text-muted">
                  <span aria-hidden="true" className="resume-pulse h-1.5 w-1.5 rounded-full bg-accent" />
                  {resume.meta}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fades an element in over a slice of the section's scroll progress: from `at` to
 * `at + len`, rising from `y` px (and sliding from `x`, growing from `scaleFrom`,
 * clearing from `blur`). Holds its final state afterwards.
 */
function Reveal({
  p,
  at,
  len,
  x = 0,
  y = 0,
  scaleFrom = 1,
  blur = 0,
  className,
  children,
}: {
  p: MotionValue<number>;
  at: number;
  len: number;
  x?: number;
  y?: number;
  scaleFrom?: number;
  blur?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const range = [0, at, at + len, 1];
  const opacity = useTransform(p, range, [0, 0, 1, 1]);
  const tx = useTransform(p, range, [x, x, 0, 0]);
  const ty = useTransform(p, range, [y, y, 0, 0]);
  const scale = useTransform(p, range, [scaleFrom, scaleFrom, 1, 1]);
  const b = useTransform(p, range, [blur, blur, 0, 0]);
  const filter = useTransform(b, (v) => (v < 0.2 ? "none" : `blur(${v}px)`));
  return (
    <motion.div className={className} style={{ opacity, x: tx, y: ty, scale, filter }}>
      {children}
    </motion.div>
  );
}

/** Fingers face the gap: landscape keeps the fresco geometry; portrait turns both
 *  a quarter turn so they approach from top and bottom. */
function deriveClouds(
  raw: { god: PointCloud; adam: PointCloud },
  orientation: Orientation,
): { god: PointCloud; adam: PointCloud } {
  const god = cloneCloud(raw.god);
  const adam = cloneCloud(raw.adam);
  if (orientation === "portrait") {
    rotateCloudZ(god, Math.PI / 2);
    rotateCloudZ(adam, Math.PI / 2);
    return { god: alignCloudTipToOrigin(god, "y", "min"), adam: alignCloudTipToOrigin(adam, "y", "max") };
  }
  return { god: alignCloudTipToOrigin(god, "x", "min"), adam: alignCloudTipToOrigin(adam, "x", "max") };
}

function SideNote({
  p,
  at,
  label,
  value,
  detail,
  live,
  right,
}: {
  label: string;
  value: string;
  detail: string;
  live?: boolean;
  right?: boolean;
  p: MotionValue<number>;
  at: number;
}) {
  return (
    <Reveal p={p} at={at} len={0.09} x={right ? -28 : 28} blur={6} className={right ? "text-right" : ""}>
      <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-accent">{label}</p>
      <p className={`mt-1.5 flex items-center gap-2 font-[family-name:var(--font-serif)] text-[26px] leading-tight text-text ${right ? "justify-end" : ""}`}>
        {live && <span className="resume-pulse h-2 w-2 rounded-full bg-accent" />}
        {value}
      </p>
      <p className="mt-1 text-[13px] text-text-muted">{detail}</p>
    </Reveal>
  );
}
