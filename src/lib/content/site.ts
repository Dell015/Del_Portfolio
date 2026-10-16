export const site = {
  name: "Randel Serafica",
  identityStatement:
    "Full-stack developer and startup founder. I build products, lead the teams behind them, and make sure both scale.",
  heroQuestion:
    "Founder. Developer. Team lead. Which one are you about to meet?",
  heroCta: "Find out →",
} as const;

export const bio = {
  short:
    "I'm Randel, a full-stack developer and startup founder from Cauayan, Isabela. I design products for problems I find genuinely interesting, lead the teams behind them, and build them to scale from day one.",
} as const;

/** Concrete facts shown in About, specifics instead of slogans. */
export const facts = [
  "Based in Cauayan, Isabela, Philippines",
  "BS Computer Science, University of Saint Louis Tuguegarao (2027)",
  "Led teams of up to 5 in regional startup competitions",
  "Builds for the Philippine market: local users, local pricing",
  "Enterprise ERP internship experience (under NDA)",
  "Currently open to work",
] as const;

export const stats = [
  { value: "7", label: "Products designed" },
  { value: "5", label: "People on my biggest team" },
  { value: "2", label: "Competition placements" },
  { value: "3", label: "Layers I own" },
] as const;

export const contact = {
  email: "randelserafica1505@gmail.com",
  github: "https://github.com/Dell015",
  linkedin: "https://www.linkedin.com/in/randel-serafica/",
  facebook: "https://www.facebook.com/randel.serafica.2024",
  phone: "+63 956 762 0063",
} as const;

export const footer = {
  personalityLine: "Let's build something worth shipping.",
} as const;

/** Hand-reveal / resume section copy.
 *  `href` points at the PDF in /public. If it is ever set back to "#", the button
 *  turns into "Request my resume" (an email link) instead of a dead download.
 *  `preview` is the short, NDA-safe text printed on the paper card; keep it in
 *  sync with the PDF. */
export const resume = {
  eyebrow: "Almost there",
  ctaLabel: "Download resume",
  requestLabel: "Request my resume",
  href: "/Randel_Serafica_Resume.pdf",
  fileName: "Randel_Serafica_Resume.pdf",
  meta: "PDF · 1 page · Updated October 2026",
  preview: {
    role: "Full-stack developer",
    location: "Cauayan, Isabela · Philippines",
    blocks: [
      {
        label: "Experience",
        lines: ["Full Stack Developer Intern", "Internal ERP system · 240 hours · 2026"],
      },
      {
        label: "Project",
        lines: ["Karela · Team Lead, 5 members", "React Native · Supabase · Gemini API"],
      },
      {
        label: "Education",
        lines: ["BS Computer Science · USLT", "2023 to 2027 · Highest Honors"],
      },
      {
        label: "Achievements",
        lines: ["PSC 10 · Regional Finalist · 2025", "IgnITE · 1st Runner-Up · 2025"],
      },
      {
        label: "Skills",
        lines: ["TypeScript · React · Next.js · Flutter", "Python · SQL · Supabase"],
      },
    ],
  },
} as const;

/** Quick nav links in the footer's secondary row. Mirrors Nav.tsx anchors. */
export const footerNav = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
] as const;

/** Availability badge. Set `active: false` to render it muted without a pulse. */
export const availability = {
  label: "Open to work",
  active: true,
} as const;

/** "Built with" chips, the stack this site actually runs on. */
export const builtWith = [
  "Next.js",
  "React",
  "TypeScript",
  "Three.js",
  "Tailwind CSS",
  "Framer Motion",
] as const;

/** Copy for the footer contact form. */
export const contactForm = {
  eyebrow: "Get in touch",
  blurb:
    "Got a project, a role, or just want to say hi? Send it straight to my inbox.",
  emailLabel: "Your email",
  emailPlaceholder: "you@example.com",
  emailHint: "Optional. Leave it if you want a reply.",
  messageLabel: "Message",
  messagePlaceholder: "What's on your mind?",
  submitLabel: "Send message",
  submittingLabel: "Sending…",
  successText: "Message sent. I'll get back to you soon.",
  genericError: "Something went wrong. Try again, or email me directly.",
  disabledNote: "The form isn't wired up yet, so email me directly instead.",
} as const;

/** Shared field limits, imported by both the client form and the API route. */
export const CONTACT_LIMITS = {
  messageMin: 10,
  messageMax: 2000,
  emailMax: 254,
} as const;
