import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { ModeProvider } from "@/components/mode/ModeProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Nav } from "@/components/Nav";
import { contact, site } from "@/lib/content/site";
import "./globals.css";

/*
 * Fonts are self-hosted (src/app/fonts) so the site never waits on, or breaks
 * because of, a third-party font request. Four families, each with one job:
 *   Space Grotesk   — headings / display
 *   Inter           — body copy
 *   JetBrains Mono  — labels, metadata, code-ish details
 *   Instrument Serif — quiet italic accents (quotes, taglines)
 */
const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-mono",
  weight: "100 800",
  display: "swap",
});

const instrumentSerif = localFont({
  src: [
    { path: "./fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

/** Absolute site URL — set NEXT_PUBLIC_SITE_URL in production (used for link previews, sitemap, schema). */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

const TITLE = "Randel Serafica — Full-Stack Developer & Startup Founder";
const DESCRIPTION =
  "Randel Serafica — full-stack developer and startup founder from Cauayan, Isabela. Computer science student, competition-tested team lead, and builder of products for the Philippine market.";

export const metadata: Metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: { default: TITLE, template: "%s — Randel Serafica" },
  description: DESCRIPTION,
  applicationName: "Randel Serafica — Portfolio",
  authors: [{ name: site.name, url: contact.github }],
  keywords: [
    "Randel Serafica",
    "full-stack developer",
    "startup founder",
    "Philippines",
    "Next.js",
    "React Native",
    "portfolio",
  ],
  openGraph: {
    type: "profile",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Randel Serafica",
    locale: "en_PH",
    firstName: "Randel",
    lastName: "Serafica",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  colorScheme: "dark",
};

/** Structured data so search engines and AI tools can read who this is without running the page. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Full-Stack Developer & Startup Founder",
  description: DESCRIPTION,
  email: `mailto:${contact.email}`,
  ...(SITE_URL ? { url: SITE_URL } : {}),
  sameAs: [contact.github, contact.linkedin],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Cauayan",
    addressRegion: "Isabela",
    addressCountry: "PH",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University of Saint Louis Tuguegarao",
  },
  knowsAbout: [
    "Full-stack development",
    "React",
    "Next.js",
    "TypeScript",
    "Python",
    "React Native",
    "Supabase",
    "PostgreSQL",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-text focus:px-4 focus:py-2 focus:font-[family-name:var(--font-display)] focus:text-sm focus:font-semibold focus:text-bg"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <ModeProvider>
          <SmoothScroll>
            <Nav />
            {children}
          </SmoothScroll>
        </ModeProvider>
      </body>
    </html>
  );
}
