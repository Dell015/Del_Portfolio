import { contact, footer as footerContent, site } from "@/lib/content/site";

export function Footer() {
  return (
    <footer
      id="footer"
      data-snap-section=""
      className="flex h-screen snap-start flex-col items-center justify-center border-t border-border px-6"
    >
      <div className="flex max-w-4xl flex-col items-center gap-6 text-center">
        {/* Personality line */}
        <p className="font-[family-name:var(--font-display)] text-2xl font-medium text-text md:text-3xl">
          {footerContent.personalityLine}
        </p>

        {/* Contact links */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          <a
            href={`mailto:${contact.email}`}
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            Email
          </a>
          <a
            href={contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            GitHub
          </a>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            LinkedIn
          </a>
          <a
            href={`tel:${contact.phone}`}
            className="text-sm text-text-muted transition-colors hover:text-accent"
          >
            Phone
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-text-muted/50">
          © {new Date().getFullYear()} {site.name}. Built with intention.
        </p>
      </div>
    </footer>
  );
}
