export interface Project {
  slug: string;
  name: string;
  platform: "mobile" | "web" | "web+mobile" | "desktop";
  cardVariant: "mobile" | "desktop";
  pitch: string;
  description: string;
  role: string;
  teamSize: string;
  /** Honest, short build status shown on cards and case studies. */
  status: string;
  /** Still too early to show properly: drawn grayed out and marked "Still being built". */
  building?: boolean;
  /** Plain-language one-liner for non-technical readers. */
  plain: string;
  techStack: string[];
  identityGradient: [string, string];
  accentColor?: string;
  liveUrl?: string;
  /** What `liveUrl` is called on the case study. Defaults to "Live Site"; use it when the link is a landing page, not the product. */
  liveLabel?: string;
  /** A try-it-in-the-browser link. Say plainly what it is (e.g. demo data only). */
  demoUrl?: string;
  repoUrl?: string;
  screenshot?: string;
  caseStudy?: {
    timeline?: string;
    architectureNote?: string;
    challenge?: string;
    nextSteps?: string;
  };
}

const allProjects: Project[] = [
  {
    slug: "karela",
    name: "Karela",
    platform: "mobile",
    cardVariant: "mobile",
    pitch:
      "Turns the movement you already do into fitness progress and real civic impact.",
    description:
      "Hybrid fitness + civic intelligence platform combining adaptive running algorithms with crowdsourced urban sensing. Tracks physical activity, adapts via an AI coach named Ani, rewards consistency through an RPG progression system, and connects daily effort to real civic impact in the community.",
    role: "Lead Developer & Architect",
    teamSize: "5 members + adviser",
    status: "Thesis build · closest to launch",
    plain: "A running app that adapts to you and turns everyday exercise into reports that help your city.",
    techStack: [
      "React Native",
      "Expo SDK 57",
      "Expo Router",
      "TypeScript",
      "expo-sqlite",
      "Supabase",
      "PostgreSQL + PostGIS",
      "Supabase Auth",
      "Supabase Realtime",
      "react-native-maps",
      "OpenWeatherMap API",
      "Gemini 2.5 Flash",
      "Three.js + R3F",
      "Expo Notifications",
    ],
    identityGradient: ["#7CF205", "#209F77"],
    liveUrl: "https://karela-phi.vercel.app",
    liveLabel: "Project site (waitlist open, app in development)",
    demoUrl: "https://karela-phi.vercel.app/demo",
    repoUrl: "https://github.com/Dell015/karela",
    caseStudy: {
      timeline: "Active development, thesis submission 2026",
      architectureNote:
        "Supabase over Firebase for PostGIS spatial queries (DBSCAN-inspired civic clustering via ST_DWithin). Offline-first with expo-sqlite for high-frequency run telemetry on low-end Android devices with prepaid data. Gemini Flash for high-frequency AI coaching (session start, mid-run, post-session). Resonance System fuses physical state with civic contribution load.",
      challenge:
        "Building an Adaptive Ghost System: a pacing avatar that models personal fatigue patterns using effort decay curves and spatial interpolation, rather than a static replay of the user's best run. Also: designing the Resonance System that dynamically modulates civic contribution based on the user's current physical state. This is a novel architecture with no existing precedent.",
      nextSteps:
        "Phase 1: Sensor fusion + Ghost System + Ani coaching + offline sync. Phase 2: Guild formation + Territory Quests + Scout Pass. Phase 3: Full Bayanihan Protocol + LGU admin panel. Phase 4: Multi-city expansion across Cagayan Valley. Target: 10,000 DAU.",
    },
  },
  {
    slug: "tag-ai",
    name: "Tag.Ai",
    platform: "web",
    cardVariant: "mobile",
    pitch:
      "A social drinking game that gets people off their phones and into real conversation.",
    description:
      "Social drinking game web app built around one idea: one phone, passed around the table, eye contact enforced. Themed decks, wild cards, a shared coin pot and a heat meter that ramps the night up. Friends can also join from their own phones in an online room. Designed for Filipino barkadas ages 18 to 30.",
    role: "Solo Developer",
    teamSize: "Solo project",
    status: "Early beta · in development",
    plain: "A party game that keeps friends talking instead of scrolling.",
    techStack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
      "Zustand",
      "Supabase",
      "Vitest",
    ],
    identityGradient: ["#C93B96", "#FF8FCF"],
    liveUrl: "https://tag-ai-omega.vercel.app",
    repoUrl: "https://github.com/Dell015/tag.ai",
    liveLabel: "Early beta",
    caseStudy: {
      timeline: "In development, early beta",
      architectureNote:
        "Accounts, coins and online rooms run on Supabase, and every coin change goes through server functions so a phone cannot edit its own balance. The heat engine steers card order so sessions start light and ramp up.",
      challenge:
        "Designing cards and rules that work across very different groups while keeping everyone comfortable. Topics can be left out before the game, anyone can skip, and the 18+ deck sits behind an age check. Balancing fun with respect is harder than the technical work.",
      nextSteps:
        "More friends playing real games and fixing what they find, sign-in emails from its own address, automatic payments, offline play and Filipino-language text.",
    },
  },
  {
    slug: "rhizome",
    name: "Rhizome",
    building: true,
    platform: "desktop",
    cardVariant: "desktop",
    pitch: "See where your disk space goes, which app owns which files, and what's actually safe to clean up.",
    description:
      "An open-source, Windows-first disk explorer and cleanup advisor (formerly DiskCleaner). It scans a drive, works out which app owns which files, finds what uninstalled apps left behind, spots duplicates and old downloads, and explains every finding in plain words. Removal is built but switched off while it's tested, so for now it is read-only.",
    role: "Solo Developer",
    teamSize: "Solo project",
    status: "Early development · read-only for now",
    plain: "A Windows app that shows what's filling your disk and explains what's safe to remove.",
    techStack: ["Rust", "Tauri", "TypeScript", "Vite", "Sigma.js", "Graphology", "d3-force", "MCP", "Vitest"],
    identityGradient: ["#2EC4D6", "#9BE7F0"],
  },
  {
    slug: "gitara",
    name: "Gitara",
    building: true,
    platform: "web",
    cardVariant: "mobile",
    pitch: "A free, all-in-one jamming app for guitarists: your songbook, chord versions and practice tools in one place.",
    description:
      "Like Spotify, but for playing songs instead of listening to them. Keep a library of songs you know or want to learn, each with chord versions from you and other players, rated by the community. Built-in tuner, metronome and a chord listener help you practice. Installable, works offline, no ads.",
    role: "Solo Developer & Designer",
    teamSize: "Solo project",
    status: "In development · songbook phase",
    plain: "A free app for guitarists to keep their songs, chords and practice tools together.",
    techStack: ["React", "TypeScript", "Vite", "PWA", "Dexie (IndexedDB)", "Supabase", "Web Audio API", "Vitest"],
    identityGradient: ["#F06A2B", "#1E7A72"],
  },
  {
    slug: "timeless-voices",
    name: "Timeless Voices",
    building: true,
    platform: "web",
    cardVariant: "desktop",
    pitch: "A booking site for a hand-picked roster of event hosts and voice talents.",
    description:
      "Built for an events MC and voice-over talent. Visitors pick what they need (hosting, voice over, voice acting, ads), browse talents with voice samples, check availability, and get an instant estimate from each talent's real rates before sending an inquiry.",
    role: "Solo Developer",
    teamSize: "Solo project",
    status: "In development",
    plain: "A website where people book event hosts and voice talents, with prices and availability up front.",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    identityGradient: ["#EADBC8", "#B89B72"],
  },
  {
    slug: "icarus",
    name: "Icarus",
    building: true,
    platform: "web",
    cardVariant: "desktop",
    pitch:
      "Proves you actually understand the work you submitted: code, thesis, pitch deck, or otherwise.",
    description:
      "A Universal Integrity & Logic Auditor. Challenges users to prove they genuinely understand work they submit: a codebase, thesis, business plan, pitch deck, or any document representing their thinking. Uses Socratic questioning, a Gate mechanic that locks progress until flaws are fixed, and produces a verifiable Defense Transcript. Not an AI detector, a mentor.",
    role: "Solo Developer & Architect",
    teamSize: "Solo project",
    status: "In development · MVP stage",
    plain: "A tool that checks whether you truly understand the work you hand in.",
    techStack: [
      "Angular",
      "TypeScript",
      "FastAPI",
      "Python",
      "Claude API",
      "LangGraph",
      "PostgreSQL",
      "Supabase",
      "pgvector",
    ],
    identityGradient: ["#c9a84c", "#c9a84c"],
    accentColor: "#E6484F",
    caseStudy: {
      timeline: "Pre-MVP development, targeting Philippine Startup Challenge 11",
      architectureNote:
        "Angular frontend (Signals UI for complex audit state machine). FastAPI async backend for audit orchestration + universal file parser. LangGraph multi-agent system: Scan Agent, Question Agent, Evaluation Agent, and Red Herring Agent, each specialized for different audit phases. Claude Haiku for routine tasks, Claude Sonnet for answer evaluation. pgvector for semantic history retrieval across sessions. The Batch-Audit Gate mechanic locks progress until flaws are fixed AND defended. It is a system mechanic, not a prompt.",
      challenge:
        "Answer evaluation: the hardest unsolved problem. Free-text explanations have no ground truth. Must distinguish between: genuinely correct, partially correct, fluent but wrong, and honest 'I don't know.' Filipino users often write in non-standard English, so evaluation must score semantic accuracy, not linguistic polish. Language bias mitigation is critical.",
      nextSteps:
        "MVP validation with 10–15 target users (pre/post comprehension testing). Then: Philippine Startup Challenge 11 submission. Post-MVP: cross-session memory, institutional pilot (bootcamp/university cohort), certified Defense Transcripts with cryptographic signing.",
    },
  },
  {
    slug: "garahe",
    name: "garahe",
    building: true,
    platform: "web",
    cardVariant: "desktop",
    pitch:
      "Your entire vehicle history (repairs, costs, decisions) in one place, and smarter the longer you use it.",
    description:
      "Private, web-based vehicle companion. Your knowledge about your vehicle lives in one place, belongs entirely to you, and gets smarter the longer you use it. Three phases: lean core (logging + reminders), 3D interactive layer (Three.js vehicle viewer with clickable hotspots), and AI diagnostic layer (Claude-powered chatbot using your own history as context).",
    role: "Solo Developer",
    teamSize: "Solo project",
    status: "In development",
    plain: "One private place for everything about your car or motorcycle.",
    techStack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Three.js",
      "React Three Fiber",
      "FastAPI",
      "Python",
      "SQLAlchemy",
      "Supabase",
      "PostgreSQL",
      "Claude API",
      "Vercel",
      "Railway",
    ],
    identityGradient: ["#A68763", "#A68763"],
    caseStudy: {
      timeline: "Architecture designed, build roadmap defined, early development",
      architectureNote:
        "Component-based data structure is the key decision: every vehicle has predefined components (engine oil, brake pads, tires, etc.) and every log entry attaches to specific components. This enables: accurate odometer-based reminders, meaningful status dashboards, 3D viewer hotspots (Phase 2), and AI diagnostic context (Phase 3), all without schema rewrites between phases. Next.js frontend + FastAPI backend + Supabase (PostgreSQL + Auth + Storage). Trust Layer for sharing without surrendering data (mechanic access codes, buyer reports, ownership transfer).",
      challenge:
        "Designing a data model that supports three fundamentally different interfaces (timeline, 3D viewer, AI chatbot) without rewrites between phases. Also: building a product where value compounds over time while keeping onboarding under 1 minute: users won't log history if setup is painful.",
      nextSteps:
        "Phase 0: Deploy frontend + backend + DB (prove they talk). Phase 1: Vehicle CRUD → Timeline → Reminders → Status Dashboard → Trust Layer. Phase 2: Three.js 3D viewer with clickable hotspots and real-time status coloring. Phase 3: Claude-powered AI diagnostic chatbot using vehicle's own component history.",
    },
  },
  {
    slug: "histhoria",
    name: "Histhoria",
    building: true,
    platform: "web",
    cardVariant: "desktop",
    pitch: "A board where a game's lore can be traced line by line, with fan theories you can fork.",
    description:
      "Every fact is a sourced claim on a board: select anything and the rest fades, showing what it came from and what it led to. Fan theories sit on top of canon with the same shape, can be forked, and get a verdict only when official evidence lands. A spoiler shield hides anything past where you've played.",
    role: "Solo Developer",
    teamSize: "Solo project",
    status: "Prototype · demo world",
    plain: "A map of a game's story where every fact has a source and theories can be compared.",
    techStack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Zustand", "React Flow", "Framer Motion"],
    identityGradient: ["#7B61FF", "#B9A8FF"],
  },
];

/**
 * What the site shows. Projects marked `building` are kept here, with their planet
 * parts in planets.ts, but stay off the site until they're ready: delete their
 * `building: true` line to bring one back.
 */
export const projects = allProjects.filter((p) => !p.building);

/** Projects with a full case study page. The rest show their details on the planet only. */
const CASE_STUDIES = new Set(["karela", "tag-ai"]);
export const hasCaseStudy = (p: Pick<Project, "slug">) => CASE_STUDIES.has(p.slug);

/** Where a project's card or planet links: its case study, else its live site, else nowhere. */
export function projectLink(p: Project): { href: string; label: string; external: boolean } | null {
  if (hasCaseStudy(p)) return { href: `/projects/${p.slug}`, label: "Read the case study", external: false };
  if (p.liveUrl) return { href: p.liveUrl, label: p.liveLabel ?? "Visit the site", external: true };
  return null;
}
