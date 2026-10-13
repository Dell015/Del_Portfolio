/* eslint-disable @next/next/no-img-element */

/**
 * The resume, exactly as the PDF: a render of page 1 of the downloadable file.
 * Regenerate `public/resume-preview.png` whenever the PDF changes.
 */
export function ResumeCard({ className = "" }: { className?: string }) {
  return (
    <img
      src="/resume-preview.png"
      alt="Preview of Randel Serafica's one-page resume"
      width={1323}
      height={1871}
      draggable={false}
      className={`block h-auto w-full rounded-[3px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.8)] ${className}`}
    />
  );
}
