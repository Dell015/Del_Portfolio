/**
 * The project solar system: every project is a planet, and its big orbs are the
 * main parts of that project. Copy here must stay true to `projects.ts` and the
 * case studies: no "shipped" or "live" claims, and `stage` only when we know it.
 */

export interface ProjectPart {
  name: string;
  /** Two or three plain sentences: what it does and why it was hard or matters. */
  summary: string;
  /** The tools that part is built with. */
  tech: string[];
  /** Roadmap phase or honest state, only when it is known. */
  stage?: string;
}

export const projectParts: Record<string, ProjectPart[]> = {
  karela: [
    {
      name: "Running engine",
      summary:
        "Tracks every run from the phone's GPS and motion sensors and adapts to how your body is doing that day, instead of chasing one fixed plan.",
      tech: ["React Native", "Expo", "react-native-maps", "Sensor fusion"],
      stage: "Phase 1",
    },
    {
      name: "Adaptive ghost",
      summary:
        "A pacing avatar that models how you tire, using effort decay curves and spatial interpolation, rather than replaying your best run.",
      tech: ["TypeScript", "Effort decay curves", "Spatial interpolation"],
      stage: "Phase 1",
    },
    {
      name: "Ani, the AI coach",
      summary:
        "Talks you through each session: before you start, mid-run and after. Built for many short coaching moments, so it runs on a fast model.",
      tech: ["Gemini 2.5 Flash", "Expo Notifications"],
      stage: "Phase 1",
    },
    {
      name: "Civic engine",
      summary:
        "While you move, you can report problems around you. Nearby reports are clustered on a map so the community and local government can see what keeps coming up.",
      tech: ["Supabase", "PostgreSQL + PostGIS", "ST_DWithin clustering"],
    },
    {
      name: "Resonance system",
      summary:
        "Balances how much civic work you take on against your current physical state, so helping your city never costs you your training.",
      tech: ["TypeScript", "Supabase"],
    },
    {
      name: "Offline sync",
      summary:
        "Run data is written to the phone first and synced later, so it keeps working on low-end Android phones with prepaid data.",
      tech: ["expo-sqlite", "Supabase Realtime"],
      stage: "Phase 1",
    },
    {
      name: "RPG progression",
      summary:
        "Consistency earns progression. Guilds and territory quests turn solo runs into something you do with your barangay.",
      tech: ["Supabase", "Three.js + R3F"],
      stage: "Phase 2",
    },
  ],
  "tag-ai": [
    {
      name: "The table",
      summary:
        "One phone passed around the table: themed decks, wild cards and dares. Playable with no account at all.",
      tech: ["Next.js", "React", "Framer Motion", "Zustand"],
      stage: "Working",
    },
    {
      name: "Heat engine",
      summary:
        "A meter that steers which card comes next, so the night starts light and ramps up. Skips cool it down, wild cards push it up.",
      tech: ["TypeScript", "Zustand"],
      stage: "Working",
    },
    {
      name: "Online rooms",
      summary:
        "Friends join from their own phones with a room code, take a seat in the circle and play from one shared pot.",
      tech: ["Supabase", "Next.js"],
      stage: "Working",
    },
    {
      name: "Coin economy",
      summary:
        "Every card costs a coin. Each coin change runs through server functions, so a phone can never edit its own balance.",
      tech: ["Supabase", "PostgreSQL functions"],
      stage: "Working",
    },
    {
      name: "Payments and invites",
      summary:
        "Coins are bought with a QR payment and added by hand for now. Inviting friends earns coins for both of you.",
      tech: ["Supabase", "Admin tools"],
      stage: "Manual for now",
    },
    {
      name: "Safety rules",
      summary:
        "Topics can be left out before the game, anyone can skip any card, and the 18+ deck sits behind an age check. Harder to get right than the code.",
      tech: ["Next.js", "Supabase"],
      stage: "Working",
    },
    {
      name: "Beta deployment",
      summary:
        "Runs as an early beta on Vercel so friends can play real games and report what breaks.",
      tech: ["Vercel", "Vitest"],
      stage: "Early beta",
    },
  ],
  icarus: [
    {
      name: "Universal file parser",
      summary:
        "Reads whatever you hand in: a codebase, a thesis, a business plan or a pitch deck, and turns it into something the auditors can question.",
      tech: ["FastAPI", "Python"],
    },
    {
      name: "Multi-agent auditor",
      summary:
        "Four specialised agents, Scan, Question, Evaluation and Red Herring, each owning one phase of the audit instead of one prompt doing everything.",
      tech: ["LangGraph", "Claude Haiku", "Claude Sonnet"],
    },
    {
      name: "Answer evaluation",
      summary:
        "Judges free-text answers with no answer key: correct, partly correct, fluent but wrong, or an honest \"I don't know\". It scores meaning, not polished English.",
      tech: ["Claude Sonnet", "Python"],
      stage: "Hardest open problem",
    },
    {
      name: "The Gate",
      summary:
        "Locks progress until every flaw is fixed and defended. It is a rule in the system, not a line in a prompt, so it can't be talked around.",
      tech: ["FastAPI", "PostgreSQL"],
    },
    {
      name: "Audit interface",
      summary:
        "An Angular app built on Signals to keep a complex audit state machine readable while the questions branch.",
      tech: ["Angular", "TypeScript", "Signals"],
    },
    {
      name: "Defense transcript",
      summary:
        "Every audit ends in a transcript of how you defended your work, and pgvector recalls past sessions. Signed, certified transcripts come after the MVP.",
      tech: ["PostgreSQL", "pgvector", "Supabase"],
      stage: "Signing planned",
    },
  ],
  garahe: [
    {
      name: "Component data model",
      summary:
        "Every vehicle has predefined parts like engine oil, brake pads and tires, and every log entry attaches to one. That one decision lets all three phases share a schema.",
      tech: ["PostgreSQL", "SQLAlchemy", "Supabase"],
    },
    {
      name: "Timeline",
      summary:
        "Repairs, costs and decisions kept in one private history that belongs to you, not to a shop or a shoebox of receipts.",
      tech: ["Next.js", "FastAPI"],
      stage: "Phase 1",
    },
    {
      name: "Reminders and status",
      summary:
        "Odometer-based reminders and a status dashboard of what needs attention next, worked out from each part's own history.",
      tech: ["FastAPI", "PostgreSQL"],
      stage: "Phase 1",
    },
    {
      name: "Trust layer",
      summary:
        "Share without giving up your data: mechanic access codes, buyer reports and ownership transfer.",
      tech: ["Supabase Auth", "FastAPI"],
      stage: "Phase 1",
    },
    {
      name: "3D vehicle viewer",
      summary:
        "A model of your vehicle with clickable hotspots, each one coloured by the status of that part.",
      tech: ["Three.js", "React Three Fiber"],
      stage: "Phase 2",
    },
    {
      name: "AI diagnostics",
      summary:
        "An assistant that answers with your own vehicle's history as context, not generic advice.",
      tech: ["Claude API", "FastAPI"],
      stage: "Phase 3",
    },
    {
      name: "Deploy pipeline",
      summary:
        "Frontend on Vercel, API on Railway and data on Supabase, proven to talk to each other before any feature is built.",
      tech: ["Vercel", "Railway", "Supabase"],
      stage: "Phase 0",
    },
  ],
};

export function partsFor(slug: string): ProjectPart[] {
  return projectParts[slug] ?? [];
}
