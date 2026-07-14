"use client";

import { ModeToggle } from "@/components/mode/ModeToggle";
import { site } from "@/lib/content/site";

export function Nav() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md">
      <span className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-text">
        {site.name}
      </span>
      <ModeToggle />
    </header>
  );
}
