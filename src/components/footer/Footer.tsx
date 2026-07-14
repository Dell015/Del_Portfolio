import { contact, footer as footerContent, site } from "@/lib/content/site";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        {/* Personality line */}
        <p className="font-[family-name:var(--font-display)] text-lg font-medium text-text">
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
