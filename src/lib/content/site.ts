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
  "Led teams of 3–5 in national and regional startup competitions",
  "Builds for the Philippine market: local users, local pricing",
  "Enterprise ERP internship experience (under NDA)",
  "Currently open to work",
] as const;

export const stats = [
  { value: "7", label: "Products designed" },
  { value: "3–5", label: "People per team led" },
  { value: "5", label: "Tech stacks used" },
  { value: "2", label: "Competition placements" },
] as const;

export const contact = {
  email: "randelserafica1505@gmail.com",
  github: "https://github.com/Dell015",
  linkedin: "https://www.linkedin.com/in/randel-serafica/",
  phone: "+63 956 762 0063",
} as const;

export const footer = {
  personalityLine: "Let's build something worth shipping.",
} as const;

/** Hand-reveal / resume section copy.
 *  Set `href` to the PDF path (e.g. "/Randel_Serafica_Resume.pdf") once it is in /public.
 *  While it is "#", the button turns into "Request my resume" (an email link). */
export const resume = {
  eyebrow: "Almost there",
  ctaLabel: "Download resume",
  requestLabel: "Request my resume",
  href: "#",
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

/** "Background" section, experience, education, competitions, trainings.
 *  Client and code details from the internship are under NDA, so the entry
 *  describes the kind of system only. Do not add specifics. */
export const credentials = {
  eyebrow: "Background",
  heading: "The track record so far.",
  groups: [
    {
      title: "Experience",
      items: [
        {
          primary: "Software Development Intern",
          secondary: "On-the-job training · Enterprise ERP system",
          note: "Worked on a large, complex enterprise resource planning system. Client and implementation details are confidential under NDA.",
        },
      ],
    },
    {
      title: "Education",
      items: [
        {
          primary: "BS Computer Science",
          secondary: "University of Saint Louis Tuguegarao · 2023–2027",
          note: "Thesis leader on Karela, a 5-member team project combining adaptive fitness modeling with crowdsourced civic reporting.",
        },
      ],
    },
    {
      title: "Competitions",
      items: [
        {
          primary: "Philippine Startup Challenge 11: Regional Finalist",
          secondary: "DICT Region II · 2025 · Founding CEO & Lead Developer",
        },
        {
          primary: "IgnITE Start-Up Competition: 1st Runner-Up",
          secondary: "2025 · Founding CEO & Lead Developer",
        },
        {
          primary: "IGNITE OGIS Start-Up Competition",
          secondary: "2026 · In progress · Seated",
        },
      ],
    },
    {
      title: "Training",
      items: [
        {
          primary: "TCON 8 Cybersecurity Conference",
          secondary: "HackthenorthPH · Participant",
        },
        {
          primary: "AWS Cloud Networking & EC2 Workshop",
          secondary: "AWS User Group Philippines · Participant",
        },
      ],
    },
  ],
} as const;
