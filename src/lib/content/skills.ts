export interface Skill {
  name: string;
  category: "language" | "frontend" | "backend" | "ai" | "tools";
  usageNote?: string;
}

/**
 * Only what's been used in real work (projects, sites, internship). Each note says
 * where, so every chip can be backed up in an interview.
 */
export const skills: Skill[] = [
  // Languages
  { name: "TypeScript", category: "language", usageNote: "Main language across my web and mobile projects" },
  { name: "JavaScript", category: "language", usageNote: "Websites and landing pages" },
  { name: "Python", category: "language", usageNote: "FastAPI back ends for side projects" },
  { name: "SQL", category: "language", usageNote: "PostgreSQL schemas, queries and database functions" },
  { name: "Dart", category: "language", usageNote: "Flutter apps for startup competitions" },
  { name: "Rust", category: "language", usageNote: "A Windows disk-cleanup app I'm building" },
  { name: "C#", category: "language", usageNote: "School projects" },

  // Frontend & mobile
  { name: "React", category: "frontend", usageNote: "UI for almost every web project" },
  { name: "Next.js", category: "frontend", usageNote: "Tag.Ai, this portfolio and client sites" },
  { name: "Tailwind CSS", category: "frontend", usageNote: "Styling across Tag.Ai, this portfolio and client sites" },
  { name: "Framer Motion", category: "frontend", usageNote: "Animations in Tag.Ai and this portfolio" },
  { name: "Three.js / React Three Fiber", category: "frontend", usageNote: "This portfolio's particle scenes and solar system" },
  { name: "React Native + Expo", category: "frontend", usageNote: "Karela: maps, GPS tracking, offline storage, notifications" },
  { name: "Flutter", category: "frontend", usageNote: "Mobile apps for startup competitions" },
  { name: "Angular", category: "frontend", usageNote: "An AI study tool I'm building" },
  { name: "Tauri", category: "frontend", usageNote: "A Windows disk-cleanup app I'm building" },
  { name: "Web Audio API", category: "frontend", usageNote: "A guitar practice app I'm building: tuner, metronome, chord listener" },
  { name: "React Flow", category: "frontend", usageNote: "A story-mapping prototype" },
  { name: "PWA & IndexedDB", category: "frontend", usageNote: "Installable, offline-ready web apps" },

  // Back end & data
  { name: "Supabase", category: "backend", usageNote: "Auth, database, storage and realtime in Karela and Tag.Ai" },
  { name: "PostgreSQL", category: "backend", usageNote: "Main database across projects" },
  { name: "PostGIS", category: "backend", usageNote: "Location queries in Karela" },
  { name: "FastAPI", category: "backend", usageNote: "Python APIs for side projects" },
  { name: "SQLite", category: "backend", usageNote: "Offline storage on the phone in Karela" },
  { name: "pgvector", category: "backend", usageNote: "Search over past sessions in an AI study tool" },

  // AI & APIs
  { name: "Claude API", category: "ai", usageNote: "AI agents in a study tool I'm building" },
  { name: "LangGraph", category: "ai", usageNote: "Multi-agent flow in the same study tool" },
  { name: "Gemini API", category: "ai", usageNote: "AI coach in Karela" },
  { name: "REST APIs", category: "ai", usageNote: "Building them with FastAPI, using third-party ones like OpenWeatherMap" },
  { name: "MCP", category: "ai", usageNote: "A read-only AI advisor for a desktop app I'm building" },

  // Tools
  { name: "Git & GitHub", category: "tools", usageNote: "Every project" },
  { name: "Figma", category: "tools", usageNote: "UI design and prototypes before building" },
  { name: "Photoshop", category: "tools", usageNote: "Editing photos and graphics for sites and projects" },
  { name: "Vercel & Netlify", category: "tools", usageNote: "Deploying this portfolio, Tag.Ai and client sites" },
  { name: "Vite", category: "tools", usageNote: "Builds for side projects" },
  { name: "Zustand", category: "tools", usageNote: "App state in Tag.Ai" },
  { name: "Vitest", category: "tools", usageNote: "Tests in Tag.Ai and side projects" },
];

export const skillCategories = [
  { key: "language", label: "Languages" },
  { key: "frontend", label: "Frontend & mobile" },
  { key: "backend", label: "Back end & data" },
  { key: "ai", label: "AI & APIs" },
  { key: "tools", label: "Tools" },
] as const;
