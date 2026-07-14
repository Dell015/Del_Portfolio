"use client";

import { useModeStore } from "@/lib/store/mode";

/**
 * A pill-shaped toggle switch for Clean / Immersive mode.
 * Always visible in the nav. Toggles instantly without page reload.
 */
export function ModeToggle() {
  const mode = useModeStore((s) => s.mode);
  const toggleMode = useModeStore((s) => s.toggleMode);

  return (
    <button
      onClick={toggleMode}
      aria-label={`Switch to ${mode === "clean" ? "Immersive" : "Clean"} mode`}
      aria-pressed={mode === "immersive"}
      className="relative flex items-center gap-1 rounded-full border border-border bg-surface px-1 py-1 text-xs font-medium transition-colors duration-300 hover:border-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span
        className={`relative z-10 rounded-full px-3 py-1 transition-colors duration-300 ${
          mode === "clean" ? "text-bg" : "text-text-muted"
        }`}
      >
        Clean
      </span>
      <span
        className={`relative z-10 rounded-full px-3 py-1 transition-colors duration-300 ${
          mode === "immersive" ? "text-bg" : "text-text-muted"
        }`}
      >
        Immersive
      </span>

      {/* Sliding pill indicator */}
      <span
        className="absolute top-1 bottom-1 rounded-full bg-accent transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          left: mode === "clean" ? "4px" : "calc(50% + 0px)",
          width: mode === "clean" ? "calc(50% - 4px)" : "calc(50% - 4px)",
        }}
      />
    </button>
  );
}
