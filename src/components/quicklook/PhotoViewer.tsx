"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MomentPhoto } from "@/lib/content/timeline";

const mono = "font-[family-name:var(--font-mono)]";

/**
 * Full-screen photo viewer for one moment's photos. Rendered into <body> through a
 * portal so the wheel doesn't scroll the page container underneath. Esc closes,
 * ←/→ step through, clicking the dark backdrop closes, focus returns to the thumbnail.
 */
export function PhotoViewer({
  title,
  photos,
  start,
  onClose,
}: {
  title: string;
  photos: MomentPhoto[];
  start: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(start);
  const closeRef = useRef<HTMLButtonElement>(null);
  const n = photos.length;
  const step = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    const back = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      back?.focus();
    };
  }, [onClose, step]);

  const p = photos[i];
  if (!p) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: photos`}
      className="fixed inset-0 z-[200] flex flex-col bg-black/92 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`flex items-center justify-between gap-4 px-5 py-4 ${mono} text-[11px] uppercase tracking-[0.16em] text-white/60 sm:px-8`}>
        <span className="truncate text-white/85">{title}</span>
        <span className="flex shrink-0 items-center gap-5">
          {n > 1 && (
            <span>
              {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="border border-white/20 px-3 py-2 text-white transition-colors hover:border-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Close ✕
          </button>
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <Image
          key={p.src}
          src={p.src}
          alt={p.alt}
          width={p.width ?? 1600}
          height={p.height ?? 1200}
          sizes="100vw"
          className="h-auto max-h-full w-auto max-w-full object-contain"
        />
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => step(-1)}
              className={`absolute left-2 top-1/2 -translate-y-1/2 border border-white/20 bg-black/50 px-3 py-4 ${mono} text-white transition-colors hover:border-white/60 sm:left-6`}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => step(1)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 border border-white/20 bg-black/50 px-3 py-4 ${mono} text-white transition-colors hover:border-white/60 sm:right-6`}
            >
              →
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
