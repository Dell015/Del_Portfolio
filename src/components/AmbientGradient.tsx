"use client";

import { useSnapScroll } from "@/components/SmoothScroll";
import DarkVeil from "@/components/effects/DarkVeil";

/**
 * Ambient background — DarkVeil only visible when user is on the About page.
 * Computes opacity directly from scroll progress (no setState).
 */
export function AmbientGradient() {
  const { scrollProgress } = useSnapScroll();

  // About section is roughly at scrollProgress 1.0 - 2.0
  let opacity = 0;
  if (scrollProgress >= 0.7 && scrollProgress < 1.0) {
    opacity = ((scrollProgress - 0.7) / 0.3) * 0.35;
  } else if (scrollProgress >= 1.0 && scrollProgress < 2.0) {
    opacity = 0.35;
  } else if (scrollProgress >= 2.0 && scrollProgress < 2.3) {
    opacity = 0.35 * (1 - (scrollProgress - 2.0) / 0.3);
  }

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity, transition: "opacity 0.4s ease" }}
    >
      <DarkVeil
        hueShift={240}
        noiseIntensity={0.02}
        scanlineIntensity={0}
        speed={2}
        scanlineFrequency={0}
        warpAmount={0.3}
      />
    </div>
  );
}
