"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

/**
 * Kills all GSAP ScrollTriggers when the route changes.
 * This prevents "removeChild" errors caused by GSAP pin-spacer
 * wrappers conflicting with React's DOM reconciliation during
 * client-side navigation.
 */
export function RouteChangeCleanup() {
  const pathname = usePathname();

  useEffect(() => {
    // On route change, kill all ScrollTriggers to remove pin-spacers
    // before React tries to reconcile the DOM
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [pathname]);

  return null;
}
