export interface Project {
  slug: string;
  name: string;
  platform: "mobile" | "web" | "web+mobile";
  cardVariant: "mobile" | "desktop";
  pitch: string;
  description: string;
  role: string;
  teamSize: string;
  techStack: string[];
  identityGradient: [string, string];
  accentColor?: string;
  liveUrl?: string;
  repoUrl?: string;
  screenshot?: string;
  caseStudy?: {
    timeline?: string;
    architectureNote?: string;
    challenge?: string;
    nextSteps?: string;
  };
}

export const projects: Project[] = [
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
    techStack: [
      "React Native",
      "Expo SDK 51+",
      "expo-sqlite",
      "Supabase",
      "PostgreSQL + PostGIS",
      "Supabase Auth",
      "Supabase Realtime",
      "Supabase Edge Functions",
      "react-native-maps",
      "OpenWeatherMap API",
      "Gemini Flash",
      "Zustand",
      "React Navigation v6+",
      "Expo Notifications",
    ],
    identityGradient: ["#17936F", "#C4E86B"],
    caseStudy: {
      timeline: "Active development — Version 3.1, thesis submission 2026",
      architectureNote:
        "Supabase over Firebase for PostGIS spatial queries (DBSCAN-inspired civic clustering via ST_DWithin). Offline-first with expo-sqlite for high-frequency run telemetry on low-end Android devices with prepaid data. Gemini Flash for high-frequency AI coaching (session start, mid-run, post-session). Resonance System fuses physical state with civic contribution load.",
      challenge:
        "Building an Adaptive Ghost System — a pacing avatar that models personal fatigue patterns using effort decay curves and spatial interpolation, rather than a static replay of the user's best run. Also: designing the Resonance System that dynamically modulates civic contribution based on the user's current physical state — novel architecture with no existing precedent.",
      nextSteps:
        "Phase 1: Sensor fusion + Ghost System + Ani coaching + offline sync. Phase 2: Guild formation + Territory Quests + Scout Pass. Phase 3: Full Bayanihan Protocol + LGU admin panel. Phase 4: Multi-city expansion across Cagayan Valley. Target: 10,000 DAU.",
    },
  },
  {
    slug: "hired-ph",
    name: "HIRED.PH",
    platform: "web+mobile",
    cardVariant: "desktop",
    pitch:
      "A skills-first job platform that gets people hired without degrees, resumes, or even internet access.",
    description:
      "Inclusive, skills-first job platform for skilled non-degree-holding Filipinos (blue-collar workers, undergraduates). Eliminates the need for college degrees, polished resumes, and even internet access as hiring barriers. Competed at Philippine Startup Challenge (Regional Finalist) and IgnITE Start-Up Competition (1st Runner Up).",
    role: "Lead Developer / Founding CEO",
    teamSize: "3–4 members",
    techStack: ["Next.js", "PostgreSQL", "Offline-first architecture"],
    identityGradient: ["#2B6CB0", "#7FC1F5"],
    caseStudy: {
      timeline: "2025 — competition year (PSC Regional Finalist, IgnITE 1st Runner Up)",
      architectureNote:
        "Offline-first architecture as core design decision — the platform must work without internet access because many target users (construction workers, drivers, service workers) don't have consistent connectivity. Skills-first matching algorithms replace traditional degree/resume filtering.",
      challenge:
        "Building a job platform that works for people who may not have a degree, a resume, consistent internet, or experience with digital hiring platforms. Every design and technical decision must account for these constraints without patronizing the user.",
      nextSteps:
        "Post-competition iteration planned. Validated product-market fit through two competitions with different team configurations.",
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
      "Social drinking game webapp built around the philosophy: one phone, passed around the table, eye contact enforced. Curated card library, wildcard system, coin economy, escalation engine, customizable decks — every session unique. Designed for Filipino barkadas ages 18–30.",
    role: "Solo Developer",
    teamSize: "Solo project",
    techStack: [
      "Next.js",
      "Tailwind CSS",
      "Framer Motion",
      "Supabase",
      "Supabase Realtime",
      "PayMongo",
      "Vercel",
    ],
    identityGradient: ["#C93B96", "#FF8FCF"],
    caseStudy: {
      timeline: "In development",
      architectureNote:
        "Supabase Realtime channels for live session sync (card draws, heat changes, coin spending, player joins/leaves). PayMongo for Philippine payments (GCash, Maya, credit/debit). Escalation engine drives intensity curve — sessions start light and ramp up via heat levels (1–5). Coin economy creates engagement loop with micro-transactions culturally appropriate for Filipino market.",
      challenge:
        "Designing a card library that works across wildly different group dynamics (barkadas, couples, coworkers, strangers) while respecting comfort boundaries. Privacy-first filter system where players can privately flag topics (visible to host only). Balancing fun with respect at scale is harder than the technical work.",
      nextSteps:
        "MVP build order: auth → card library → session flow → coin economy → deck builder → social features. Then: community deck marketplace and AI-generated cards (deferred).",
    },
  },
  {
    slug: "icarus",
    name: "Icarus",
    platform: "web",
    cardVariant: "desktop",
    pitch:
      "Proves you actually understand the work you submitted — code, thesis, pitch deck, or otherwise.",
    description:
      "A Universal Integrity & Logic Auditor. Challenges users to prove they genuinely understand work they submit — a codebase, thesis, business plan, pitch deck, or any document representing their thinking. Uses Socratic questioning, a Gate mechanic that locks progress until flaws are fixed, and produces a verifiable Defense Transcript. Not an AI detector — a mentor.",
    role: "Solo Developer & Architect",
    teamSize: "Solo project",
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
    identityGradient: ["#2E2E2E", "#E7E7E7"],
    accentColor: "#E6484F",
    caseStudy: {
      timeline: "Pre-MVP development — targeting Philippine Startup Challenge 11",
      architectureNote:
        "Angular frontend (Signals UI for complex audit state machine). FastAPI async backend for audit orchestration + universal file parser. LangGraph multi-agent system: Scan Agent, Question Agent, Evaluation Agent, and Red Herring Agent — each specialized for different audit phases. Claude Haiku for routine tasks, Claude Sonnet for answer evaluation. pgvector for semantic history retrieval across sessions. The Batch-Audit Gate mechanic locks progress until flaws are fixed AND defended — a system mechanic, not a prompt.",
      challenge:
        "Answer evaluation — the hardest unsolved problem. Free-text explanations have no ground truth. Must distinguish between: genuinely correct, partially correct, fluent but wrong, and honest 'I don't know.' Filipino users often write in non-standard English — evaluation must score semantic accuracy, not linguistic polish. Language bias mitigation is critical.",
      nextSteps:
        "MVP validation with 10–15 target users (pre/post comprehension testing). Then: Philippine Startup Challenge 11 submission. Post-MVP: cross-session memory, institutional pilot (bootcamp/university cohort), certified Defense Transcripts with cryptographic signing.",
    },
  },
  {
    slug: "garahe",
    name: "garahe",
    platform: "web",
    cardVariant: "desktop",
    pitch:
      "Your entire vehicle history — repairs, costs, decisions — in one place, and smarter the longer you use it.",
    description:
      "Private, web-based vehicle companion. Your knowledge about your vehicle lives in one place, belongs entirely to you, and gets smarter the longer you use it. Three phases: lean core (logging + reminders), 3D interactive layer (Three.js vehicle viewer with clickable hotspots), and AI diagnostic layer (Claude-powered chatbot using your own history as context).",
    role: "Solo Developer",
    teamSize: "Solo project",
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
    identityGradient: ["#B5651D", "#4A4A4A"],
    caseStudy: {
      timeline: "Architecture designed, build roadmap defined, early development",
      architectureNote:
        "Component-based data structure is the key decision — every vehicle has predefined components (engine oil, brake pads, tires, etc.) and every log entry attaches to specific components. This enables: accurate odometer-based reminders, meaningful status dashboards, 3D viewer hotspots (Phase 2), and AI diagnostic context (Phase 3) — all without schema rewrites between phases. Next.js frontend + FastAPI backend + Supabase (PostgreSQL + Auth + Storage). Trust Layer for sharing without surrendering data (mechanic access codes, buyer reports, ownership transfer).",
      challenge:
        "Designing a data model that supports three fundamentally different interfaces (timeline, 3D viewer, AI chatbot) without rewrites between phases. Also: building a product where value compounds over time while keeping onboarding under 1 minute — users won't log history if setup is painful.",
      nextSteps:
        "Phase 0: Deploy frontend + backend + DB (prove they talk). Phase 1: Vehicle CRUD → Timeline → Reminders → Status Dashboard → Trust Layer. Phase 2: Three.js 3D viewer with clickable hotspots and real-time status coloring. Phase 3: Claude-powered AI diagnostic chatbot using vehicle's own component history.",
    },
  },
];
