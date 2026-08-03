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
  useScroll,
  useTransform,
} from "framer-motion";
import { useSnapScroll } from "@/components/SmoothScroll";
import { useDeviceCapability } from "@/lib/hooks/useDeviceCapability";
import { useIsVisible } from "@/lib/hooks/useIsVisible";
import { useModeStore } from "@/lib/store/mode";
import { resume } from "@/lib/content/site";
import {
  alignCloudTipToOrigin,
  cloneCloud,
  normalizeCloudCount,
  rotateCloudZ,
  sampleImageToPoints,
  type PointCloud,
} from "@/lib/particles/sampleImageToPoints";
import { HandParticleCanvas } from "./HandParticleCanvas";
import { FrescoWash, HandRevealStatic } from "./HandRevealStatic";
import { ResumeButton } from "./ResumeButton";

const GOD_SRC = "/hand-god.png";
const ADAM_SRC = "/hand-adam.png";

/**
 * Particle budget per hand, by device tier.
 *
 * The crops are 360×360 with ~24% opaque coverage, so 1:1 sampling yields roughly
 * 30k points each. Capping at 22k on capable devices keeps both hands (44k) well
 * under the hero's 80k, and the two systems never animate at the same time
 * anyway — the hero freezes itself once #projects leaves the viewport.
 */
const BUDGET = { high: 22_000, low: 7_000 } as const;

/** Scroll distance the section stays pinned. 300vh matches ProjectSphereSection,
 *  the pattern already established for pinning on this page. */
const PIN_HEIGHT_VH = 300;

/** Progress at which the button becomes interactive — the hands are essentially
 *  closed by here, and gating clicks avoids an invisible-but-clickable target. */
const BUTTON_ACTIVE_AT = 0.78;

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
 * Hand-reveal section — the Creation of Adam homage that pays off in the resume
 * download, immediately above the footer.
 *
 * Pinning is `position: sticky` over a tall spacer rather than wheel
 * interception. The visual result is identical, but it keeps native touch,
 * keyboard and anchor-jump scrolling intact, and avoids a second scroll-jacker
 * fighting `useVirtualScroll`, which already locks the wheel for the project
 * sphere higher up the page.
 */
export function HandRevealSection() {
  const mode = useModeStore((s) => s.mode);
  const reducedMotion = useModeStore((s) => s.reducedMotion);
  const hydrated = useModeStore((s) => s.hydrated);
  const { webglAvailable, tier } = useDeviceCapability();

  // Same gate the hero uses. Clean mode is the site default and must stay
  // WebGL-free, so this is a mode check, not just a motion check.
  const wantsImmersive = mode === "immersive" && !reducedMotion;
  const canRunParticles = wantsImmersive && webglAvailable && tier !== "none";

  // Until the mode store hydrates and the capability probe resolves, render the
  // static version: it's the safe default and avoids a WebGL flash in Clean mode.
  if (!hydrated || tier === "unknown" || !canRunParticles) {
    return <HandRevealStatic />;
  }

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
        const interval = tier === "high" ? 1 : 2;
        const [god, adam] = await Promise.all([
          sampleImageToPoints(GOD_SRC, { gridInterval: interval, alphaThreshold: 24 }),
          sampleImageToPoints(ADAM_SRC, { gridInterval: interval, alphaThreshold: 24 }),
        ]);
        if (cancelled) return;

        const budget = BUDGET[tier];
        setRawSamples({
          god: god.count > budget ? normalizeCloudCount(god, budget) : god,
          adam: adam.count > budget ? normalizeCloudCount(adam, budget) : adam,
        });
      } catch (err) {
        if (cancelled) return;
        // Matches the hero's behaviour: a failed sample degrades to the static
        // treatment rather than rendering an empty canvas.
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

  // Button visuals ride motion values directly — no re-render per frame.
  //
  // Every input range is stated across the FULL 0→1 progress domain, with the
  // final value repeated to hold it. Relying on out-of-range clamping proved
  // unsafe here: measured against a live browser, an `opacity` transform declared
  // as [0.15, 0.82] → [0.25, 1] did not hold at 1 past 0.82 — it ramped back down
  // to 0.25 by progress 1.0, inverting the whole effect over the final fifth of
  // the section. `scale` and `boxShadow` on the same element clamped correctly, so
  // this is specific to opacity. Pinning the domain end to end removes the
  // dependency on that behaviour entirely.
  const buttonOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.82, 1],
    [0.25, 1, 1],
  );
  const buttonScale = useTransform(scrollYProgress, [0.15, 0.82, 1], [0.88, 1, 1]);
  const buttonGlow = useTransform(
    scrollYProgress,
    [0.5, 0.9, 1],
    [
      "0 0 0px rgba(209,26,42,0)",
      "0 0 42px rgba(209,26,42,0.55)",
      "0 0 42px rgba(209,26,42,0.55)",
    ],
  );
  const eyebrowOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.5, 1],
    [0, 1, 0, 0],
  );
  const hintOpacity = useTransform(scrollYProgress, [0.82, 0.95, 1], [0, 1, 1]);

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
        <FrescoWash />

        {/* Particles mount only once sampled and only while near the viewport;
            the render loop stops entirely when the section scrolls away. */}
        {clouds && (
          <div className="absolute inset-0 z-[1]">
            <HandParticleCanvas
              godCloud={clouds.god}
              adamCloud={clouds.adam}
              portrait={orientation === "portrait"}
              progressRef={progressRef}
              active={visible}
            />
          </div>
        )}

        {/* Overlay content. The wrapper ignores pointer events so it never
            swallows scroll; the button re-enables them on itself. */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
          <motion.p
            className="absolute top-[18%] font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.25em] text-accent"
            style={{ opacity: eyebrowOpacity }}
          >
            {resume.eyebrow}
          </motion.p>

          {/* Sits dead centre — the same point the two fingertips close on. */}
          <motion.div
            className="pointer-events-auto rounded-full"
            style={{
              opacity: buttonOpacity,
              scale: buttonScale,
              boxShadow: buttonGlow,
            }}
          >
            <ResumeButton active={buttonActive} />
          </motion.div>

          <motion.p
            className="absolute bottom-[16%] text-center text-xs text-text-muted/50 italic"
            style={{ opacity: hintOpacity }}
          >
            {resume.placeholderNote}
          </motion.p>
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
