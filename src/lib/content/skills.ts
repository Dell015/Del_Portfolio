export interface Skill {
  name: string;
  category: "language" | "frontend" | "backend" | "ai" | "tools";
  usageNote?: string;
}

export const skills: Skill[] = [
  // Languages
  {
    name: "TypeScript",
    category: "language",
    usageNote: "Primary language across all web and mobile projects",
  },
  {
    name: "Python",
    category: "language",
    usageNote: "FastAPI backends for Icarus and garahe, AI integration",
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
    usageNote: "PostgreSQL queries, schema design, PostGIS spatial queries",
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
    usageNote: "Used in Tag.Ai, HIRED.PH, garahe — PWA-capable, SSR, SEO-friendly",
  },
  {
    name: "Angular",
    category: "frontend",
    usageNote: "Icarus frontend — Signals UI for complex audit state machine",
  },
  {
    name: "React Native + Expo",
    category: "frontend",
    usageNote: "Karela — cross-platform mobile with hot-reloading and sensor testing",
  },
  {
    name: "Flutter",
    category: "frontend",
    usageNote: "Cross-platform mobile development",
  },
  {
    name: "Tailwind CSS",
    category: "frontend",
    usageNote: "Utility-first styling across Tag.Ai, garahe, portfolio",
  },
  {
    name: "Framer Motion",
    category: "frontend",
    usageNote: "Card flip, swipe, drag-to-trash animations in Tag.Ai",
  },
  {
    name: "Three.js / React Three Fiber",
    category: "frontend",
    usageNote: "3D vehicle viewer with clickable hotspots in garahe",
  },
  {
    name: "React Navigation v6+",
    category: "frontend",
    usageNote: "Stack + Tab navigation with deep linking in Karela",
  },

  // Backend & Infrastructure
  {
    name: "Supabase",
    category: "backend",
    usageNote:
      "PostgreSQL + PostGIS, Auth, Storage, Realtime, Edge Functions — used across Karela, Tag.Ai, Icarus, garahe",
  },
  {
    name: "FastAPI",
    category: "backend",
    usageNote: "Async Python backend for Icarus (audit engine) and garahe (business logic)",
  },
  {
    name: "PostgreSQL",
    category: "backend",
    usageNote: "Primary relational DB across all projects via Supabase",
  },
  {
    name: "PostGIS",
    category: "backend",
    usageNote: "Spatial queries for civic clustering in Karela (ST_DWithin, DBSCAN-inspired)",
  },
  {
    name: "expo-sqlite",
    category: "backend",
    usageNote: "Offline mission caching and run telemetry in Karela",
  },
  {
    name: "Firebase",
    category: "backend",
    usageNote: "Realtime database in Tag.Ai",
  },
  {
    name: "SQLAlchemy + Alembic",
    category: "backend",
    usageNote: "ORM + migrations for garahe's FastAPI backend",
  },
  {
    name: "pgvector",
    category: "backend",
    usageNote: "Semantic history retrieval across audit sessions in Icarus",
  },

  // AI & APIs
  {
    name: "Claude API",
    category: "ai",
    usageNote: "Multi-agent Socratic auditing in Icarus, AI diagnostics in garahe",
  },
  {
    name: "LangGraph",
    category: "ai",
    usageNote: "Multi-agent orchestration for Icarus audit system (cyclical graph topology)",
  },
  {
    name: "Gemini Flash",
    category: "ai",
    usageNote: "Lightweight LLM for Ani coaching, quest generation in Karela",
  },
  {
    name: "OpenWeatherMap API",
    category: "ai",
    usageNote: "Environmental context for Karela's mission engine and safety tiers",
  },
  {
    name: "PayMongo",
    category: "backend",
    usageNote: "Philippine payments (GCash, Maya, credit/debit) in Tag.Ai",
  },

  // Tools & Services
  {
    name: "Git",
    category: "tools",
    usageNote: "Version control across all projects",
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
    name: "Vercel",
    category: "tools",
    usageNote: "Next.js deployment for Tag.Ai, garahe, portfolio",
  },
  {
    name: "Railway",
    category: "tools",
    usageNote: "FastAPI backend deployment for garahe",
  },
  {
    name: "Zustand",
    category: "tools",
    usageNote: "Lightweight global state in Karela and garahe",
  },
  {
    name: "Expo Notifications",
    category: "tools",
    usageNote: "Push notifications — streak alerts, squad events in Karela",
  },
];

export const skillCategories = [
  { key: "language", label: "Languages" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend & Infrastructure" },
  { key: "ai", label: "AI & APIs" },
  { key: "tools", label: "Tools & Services" },
] as const;
