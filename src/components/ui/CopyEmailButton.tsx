"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { contact } from "@/lib/content/site";

/** One-click copy of the contact email, with an announced "Copied" state. */
export function CopyEmailButton({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard blocked: the visible email link still works. */
    }
  }, []);

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border border-border bg-surface/50 px-4 font-[family-name:var(--font-mono)] text-xs text-text-muted transition-colors duration-300 hover:border-accent/50 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {copied ? (
        <FiCheck className="h-3.5 w-3.5 text-[#4ADE80]" aria-hidden="true" />
      ) : (
        <FiCopy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy email"}
    </button>
  );
}
