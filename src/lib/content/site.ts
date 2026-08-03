export const site = {
  name: "Randel Serafica",
  identityStatement:
    "Full-stack developer and startup founder — I build products, lead the teams behind them, and make sure both scale.",
  heroQuestion:
    "Founder. Developer. Team lead. Which one are you about to meet?",
  heroCta: "Find out →",
} as const;

export const bio = {
  short:
    "I'm Randel — a full-stack developer and startup founder. I build products that solve problems I find genuinely interesting, and I make sure they're meant to scale from day one.",
} as const;

export const scatterFragments = [
  "leads before it's asked",
  "ships fast, fixes faster",
  "founder at heart",
  "full-stack, full send",
  "curiosity-driven",
  "figures it out",
  "still building, always",
  "scales teams and code",
] as const;

export const contact = {
  email: "randelserafica1505@gmail.com",
  github: "https://github.com/Dell015",
  linkedin: "https://www.linkedin.com/in/randel-serafica/",
  phone: "+63 956 762 0063",
} as const;

export const footer = {
  personalityLine: "Let's build something that actually ships.",
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

/** "Built with" chips — the stack this site actually runs on. */
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
  emailHint: "Optional — leave it if you want a reply.",
  messageLabel: "Message",
  messagePlaceholder: "What's on your mind?",
  submitLabel: "Send message",
  submittingLabel: "Sending…",
  successText: "Message sent. I'll get back to you soon.",
  genericError: "Something went wrong. Try again, or email me directly.",
  disabledNote: "The form isn't wired up yet — email me directly instead.",
} as const;

/** Shared field limits — imported by both the client form and the API route. */
export const CONTACT_LIMITS = {
  messageMin: 10,
  messageMax: 2000,
  emailMax: 254,
} as const;
