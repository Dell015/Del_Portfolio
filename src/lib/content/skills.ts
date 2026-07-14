export interface Skill {
  name: string;
  category: "language" | "frontend" | "backend" | "tools";
  usageNote?: string;
}

export const skills: Skill[] = [
  // Languages
  {
    name: "TypeScript",
    category: "language",
    usageNote: "Primary language across all web projects",
  },
  {
    name: "Python",
    category: "language",
    usageNote: "Scripting, automation, and backend services",
  },
  {
    name: "C#",
    category: "language",
  },
  {
    name: "Dart",
    category: "language",
    usageNote: "Cross-platform mobile with Flutter",
  },
  {
    name: "SQL",
    category: "language",
    usageNote: "PostgreSQL queries, schema design, PostGIS",
  },

  // Frontend
  {
    name: "React",
    category: "frontend",
    usageNote: "Primary UI framework across web projects",
  },
  {
    name: "Next.js",
    category: "frontend",
    usageNote: "PWA-capable, SEO-friendly React framework",
  },
  {
    name: "React Native",
    category: "frontend",
    usageNote: "Cross-platform mobile with Expo SDK 51+",
  },
  {
    name: "Flutter",
    category: "frontend",
    usageNote: "Cross-platform mobile development",
  },
  {
    name: "Vue",
    category: "frontend",
    usageNote: "Used in garahe vehicle companion",
  },
  {
    name: "Tailwind CSS",
    category: "frontend",
    usageNote: "Utility-first styling for fast UI iteration",
  },
  {
    name: "Framer Motion",
    category: "frontend",
    usageNote: "Card flip, swipe, drag-to-trash animations",
  },

  // Backend & Infrastructure
  {
    name: "Supabase",
    category: "backend",
    usageNote:
      "Auth, Storage, Realtime, Edge Functions, PostgreSQL + PostGIS",
  },
  {
    name: "Firebase",
    category: "backend",
    usageNote: "Realtime database for Tag.Ai",
  },
  {
    name: "Express",
    category: "backend",
    usageNote: "Node.js backend for garahe",
  },
  {
    name: "MongoDB",
    category: "backend",
    usageNote: "Document store for garahe",
  },
  {
    name: "PostgreSQL",
    category: "backend",
    usageNote: "Primary relational DB via Supabase",
  },

  // Tools & Services
  {
    name: "Git",
    category: "tools",
    usageNote: "Version control",
  },
  {
    name: "GitHub",
    category: "tools",
    usageNote: "Repo hosting + collaboration",
  },
  {
    name: "Figma",
    category: "tools",
    usageNote: "UI/UX design and prototyping",
  },
  {
    name: "Zustand",
    category: "tools",
    usageNote: "Lightweight global state management",
  },
  {
    name: "Gemini Flash",
    category: "tools",
    usageNote: "LLM for AI coaching and quest generation in Karela",
  },
];

export const skillCategories = [
  { key: "language", label: "Languages" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "tools", label: "Tools & Services" },
] as const;
