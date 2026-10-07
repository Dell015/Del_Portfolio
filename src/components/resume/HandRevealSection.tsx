"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { useIsVisible } from "@/lib/hooks/useIsVisible";
import { resume } from "@/lib/content/site";
import {
  alignCloudTipToOrigin,
  cloneCloud,
  rotateCloudZ,
  sampleImageToPoints,
  subsampleCloud,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";
import dynamic from "next/dynamic";

// Loaded only when the section is near the viewport (see `visible` below).
const HandParticleCanvas = dynamic(
  () => import("./HandParticleCanvas").then((m) => m.HandParticleCanvas),
  { ssr: false },
);
import { HandRevealStatic } from "./HandRevealStatic";
import { CopyEmailButton } from "@/components/ui/CopyEmailButton";
import { ResumeButton } from "./ResumeButton";
import { ResumeCard } from "./ResumeCard";

const GOD_SRC = "/hand-god.png";
const ADAM_SRC = "/hand-adam.png";

/**
 * Particle ceiling per hand.
 *
 * The current crops yield 30,793 and 34,170 points at 1:1 sampling, so `high` sits
 * above both and nothing is dropped — the hands render at full source fidelity.
 * The ceiling only bites if larger crops are supplied later, and `subsampleCloud`
 * then thins them uniformly instead of truncating.
 *
 * It previously capped at 22,000 with `normalizeCloudCount`, which keeps the first
 * N points in top-to-bottom scan order — silently deleting the bottom 84px of a
 * 180px-tall hand. Roughly half of each hand was simply missing.
 */
const BUDGET = { high: 60_000, low: 12_000 } as const;

/** Scroll distance the section stays pinned. 300vh matches ProjectSphereSection,
 *  the pattern already established for pinning on this page. */
const PIN_HEIGHT_VH = 300;

/** Progress at which the button becomes interactive — the hands are essentially
 *  closed by here, and gating clicks avoids an invisible-but-clickable target. */
const BUTTON_ACTIVE_AT = 0.88;

type Orientation = "landscape" | "portrait";

// ─── Orientation as an external store ─────────────────────────────────────────
//
// Viewport orientation is external mutable state, so `useSyncExternalStore` is the
// right primitive — the same approach SmoothScroll uses for scroll progress. It
// also removes the need to debounce: the snapshot is a string, so React's Object.is
// comparison means a re-render happens only when the orientation actually flips,
// not on every resize event.

function subscribeOrientation(callback: () => void) {
  window.addEventListener("resize", callback);
  window.addEventListener("orientationchange", callback);
  return () => {
    window.removeEventListener("resize", callback);
    window.removeEventListener("orientationchange", callback);
  };
}

function getOrientationSnapshot(): Orientation {
  return window.innerWidth < window.innerHeight ? "portrait" : "landscape";
}

/** Never actually used — this subtree doesn't server-render (see the hydration
 *  gate in HandRevealSection) — but useSyncExternalStore requires it. */
function getOrientationServerSnapshot(): Orientation {
  return "landscape";
}

/**
 * Hand-reveal section — two particle hands converging on the resume download,
 * immediately above the footer.
 *
 * Always renders particles. There is no Clean-mode image version: flat PNGs of the
 * fresco read as stock art, and a still can't stand in for the effect. The only
 * fallback left is for devices that cannot create a WebGL context at all, where
 * the choice is the bare CTA or a broken section.
 *
 * Pinning is `position: sticky` over a tall spacer rather than wheel interception.
 * The visual result is identical, but it keeps native touch, keyboard and
 * anchor-jump scrolling intact, and avoids a second scroll-jacker fighting
 * `useVirtualScroll`, which already locks the wheel for the project sphere.
 */
export function HandRevealSection() {
  const { webglAvailable, tier } = useDeviceCapability();
  const reducedMotion = useReducedMotion();

  // Reduced-motion visitors get the button without a 300vh scrubbed animation.
  if (reducedMotion) return <HandRevealStatic />;

  // `unknown` is the SSR/hydration snapshot. Render nothing structural until the
  // probe resolves, so we never flash a fallback at capable devices.
  if (tier === "unknown") return <HandRevealStatic />;
  if (!webglAvailable || tier === "none") return <HandRevealStatic />;

  return <HandRevealImmersive tier={tier === "low" ? "low" : "high"} />;
}

function HandRevealImmersive({ tier }: { tier: "high" | "low" }) {
  const { containerRef } = useSnapScroll();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { ref: visibilityRef, visible } = useIsVisible("400px");

  const orientation = useSyncExternalStore(
    subscribeOrientation,
    getOrientationSnapshot,
    getOrientationServerSnapshot,
  );

  /**
   * Pristine samples. Held in state rather than a ref so the positioned clouds
   * can be derived with `useMemo` — an orientation flip then re-derives without
   * re-decoding the PNGs and without a setState-in-effect round trip.
   */
  const [rawSamples, setRawSamples] = useState<{
    god: PointCloud;
    adam: PointCloud;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);

  /** Scroll progress, read inside useFrame. A ref rather than state so scrolling
   *  never triggers a React render. */
  const progressRef = useRef(0);

  /** Positioned, tip-anchored clouds for the current orientation. */
  const clouds = useMemo(
    () => (rawSamples ? deriveClouds(rawSamples, orientation) : null),
    [rawSamples, orientation],
  );

  // ── Sample the crops once, lazily, when the section approaches ──
  useEffect(() => {
    if (!visible || rawSamples || failed) return;

    let cancelled = false;

    async function load() {
      try {
        // gridInterval rather than targetCount: the sampler estimates interval
        // from TOTAL pixels, but ~76% of these images are transparent, so a
        // targetCount request would under-sample by roughly 4x.
        //
        // alphaThreshold is low (10) on purpose — it keeps the soft antialiased
        // pixels around the silhouette, which is what makes the edge read as a
        // drawn contour rather than a cut-out.
        const interval = tier === "high" ? 1 : 2;
        const [god, adam] = await Promise.all([
          sampleImageToPoints(GOD_SRC, { gridInterval: interval, alphaThreshold: 10 }),
          sampleImageToPoints(ADAM_SRC, { gridInterval: interval, alphaThreshold: 10 }),
        ]);
        if (cancelled) return;

        const budget = BUDGET[tier];
        setRawSamples({
          god: subsampleCloud(god, budget),
          adam: subsampleCloud(adam, budget, 0x5bf03635),
        });
      } catch (err) {
        if (cancelled) return;
        // A failed sample degrades to the bare CTA rather than an empty canvas.
        console.error("[hand-reveal] Failed to sample hand crops:", err);
        setFailed(true);
      }
    }

    load();
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
  // Story over the pinned scroll: the hands reach in → touch (flash) → fade back
  // as the resume rises out of the contact point → its actions appear below it.
  const handsOpacity = useTransform(scrollYProgress, [0, 0.62, 0.9, 1], [1, 1, 0.16, 0.16]);
  const handsScale = useTransform(scrollYProgress, [0, 0.62, 1], [1, 1, 1.1]);
  const flashOpacity = useTransform(scrollYProgress, [0, 0.6, 0.68, 0.84, 1], [0, 0, 0.9, 0, 0]);
  const flashScale = useTransform(scrollYProgress, [0, 0.6, 0.84, 1], [0.4, 0.4, 2.4, 2.4]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.66, 0.8, 1], [0, 0, 1, 1]);
  const cardY = useTransform(scrollYProgress, [0, 0.66, 0.88, 1], [90, 90, 0, 0]);
  const cardRotate = useTransform(scrollYProgress, [0, 0.66, 0.88, 1], [26, 26, 0, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 0.66, 0.88, 1], [0.8, 0.8, 1, 1]);
  const actionsOpacity = useTransform(scrollYProgress, [0, 0.8, 0.92, 1], [0, 0, 1, 1]);
  const actionsY = useTransform(scrollYProgress, [0, 0.8, 0.92, 1], [18, 18, 0, 0]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.12, 0.5, 0.66, 1], [0, 1, 1, 0, 0]);

  if (failed) return <HandRevealStatic />;

  return (
    <div
      ref={sectionRef}
      id="resume"
      data-snap-section=""
      className="relative z-[2]"
      style={{ height: `${PIN_HEIGHT_VH}vh` }}
    >
      <div ref={visibilityRef} className="absolute inset-0 pointer-events-none" />

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Particles mount only once sampled and only while near the viewport;
            the render loop stops entirely when the section scrolls away. */}
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

          {/* Contact flash — a soft ring that opens where the fingertips meet */}
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

          <div className="flex flex-col items-center gap-8">
            <motion.div
              className="w-[min(58vw,300px)] sm:w-[min(34vh,300px)]"
              style={{ opacity: cardOpacity, y: cardY, rotateX: cardRotate, scale: cardScale, transformPerspective: 1100 }}
            >
              <ResumeCard />
            </motion.div>

            <motion.div
              className="pointer-events-auto flex flex-col items-center gap-3 sm:flex-row sm:gap-4"
              style={{ opacity: actionsOpacity, y: actionsY }}
            >
              <ResumeButton active={buttonActive} />
              <CopyEmailButton />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Turns pristine samples into positioned clouds for the given orientation.
 *
 * Landscape keeps the fresco's geometry: God's hand points left (its tip is the
 * leftmost point), Adam's points right. Portrait rotates both a quarter turn so
 * the fingers face the vertical gap — otherwise the hands would approach from
 * top and bottom while pointing sideways, and would never appear to reach for
 * each other.
 *
 * Every cloud is anchored by its fingertip, so the shader's ±gap/2 placement
 * produces an exact pixel separation regardless of how each crop was framed.
 */
function deriveClouds(
  raw: { god: PointCloud; adam: PointCloud },
  orientation: Orientation,
): { god: PointCloud; adam: PointCloud } {
  const god = cloneCloud(raw.god);
  const adam = cloneCloud(raw.adam);

  if (orientation === "portrait") {
    // God enters from the top and must point down: rotate its leftward tip to -y.
    rotateCloudZ(god, -Math.PI / 2);
    // Adam enters from the bottom and must point up: rotate its rightward tip to +y.
    rotateCloudZ(adam, -Math.PI / 2);
    return {
      god: alignCloudTipToOrigin(god, "y", "min"),
      adam: alignCloudTipToOrigin(adam, "y", "max"),
    };
  }

  return {
    god: alignCloudTipToOrigin(god, "x", "min"),
    adam: alignCloudTipToOrigin(adam, "x", "max"),
  };
}
