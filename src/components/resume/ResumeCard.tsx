"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiDownload, FiX } from "react-icons/fi";
import { resume } from "@/lib/content/site";

/**
 * The resume, exactly as the PDF: a render of page 1 of the downloadable file.
 * Regenerate `public/resume-preview.png` whenever the PDF changes.
 *
 * On a phone the page is far too small to read where it sits, so it opens a reader:
 * a full-screen view where the page is shown at a readable size, scrolls both ways and
 * can be pinch-zoomed.
 */
export function ResumeCard({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Read the resume at full size"
        className="group relative block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <img
          src="/resume-preview.png"
          alt="Preview of Randel Serafica's one-page resume"
          width={1323}
          height={1871}
          draggable={false}
          className={`block h-auto w-full rounded-[3px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.8)] ${className}`}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <span className="rounded-full bg-[#0F0F0F]/85 px-3 py-1.5 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-white shadow-lg backdrop-blur transition-colors group-hover:bg-accent">
            Tap to read
          </span>
        </span>
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Resume"
            className="fixed inset-0 z-[200] flex flex-col bg-[#0A0A0A]/95 backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-white/60">
                Resume · pinch or scroll to zoom
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={resume.href}
                  download={resume.fileName}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <FiDownload aria-hidden="true" /> PDF
                </a>
                <button
                  ref={closeBtn}
                  type="button"
                  onClick={close}
                  aria-label="Close resume"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
            </div>
            <div
              className="min-h-0 flex-1 overflow-auto overscroll-contain p-4"
              style={{ touchAction: "pan-x pan-y pinch-zoom" }}
              onClick={(e) => {
                if (e.target === e.currentTarget) close();
              }}
            >
              <img
                src="/resume-preview.png"
                alt="Randel Serafica's resume, page 1"
                width={1323}
                height={1871}
                className="mx-auto block h-auto w-[900px] max-w-none rounded-[3px] shadow-[0_20px_80px_-10px_rgba(0,0,0,0.9)] md:w-[min(1000px,92vw)]"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
