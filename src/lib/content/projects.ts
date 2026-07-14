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
    role: "Lead Developer",
    teamSize: "Team project",
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
    // liveUrl: TODO
    // repoUrl: TODO
    // screenshot: TODO
    caseStudy: {
      // timeline: TODO
      // architectureNote: TODO
      // challenge: TODO
      // nextSteps: TODO
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
      "Inclusive, skills-first job platform for skilled non-degree-holding Filipinos (blue-collar workers, undergraduates). Eliminates the need for college degrees, polished resumes, and even internet access as hiring barriers.",
    role: "Lead Developer",
    teamSize: "Team project",
    techStack: ["Next.js", "PostgreSQL", "Offline-first architecture"],
    identityGradient: ["#2B6CB0", "#7FC1F5"],
    // liveUrl: TODO
    // repoUrl: TODO
    // screenshot: TODO
    caseStudy: {
      // timeline: TODO
      // architectureNote: TODO
      // challenge: TODO
      // nextSteps: TODO
    },
  },
  {
    slug: "tag-ai",
    name: "Tag.Ai",
    platform: "web+mobile",
    cardVariant: "mobile",
    pitch:
      "A social drinking game that gets people off their phones and into real conversation.",
    description:
      "Social drinking game webapp built to bring people into real conversation instead of their phones. Curated card library, wildcard system, coin economy, customizable decks — every session unique.",
    role: "Solo Developer",
    teamSize: "Solo project",
    techStack: [
      "Next.js",
      "Tailwind CSS",
      "Framer Motion",
      "Supabase",
      "Firebase",
    ],
    identityGradient: ["#C93B96", "#FF8FCF"],
    // liveUrl: TODO
    // repoUrl: TODO
    // screenshot: TODO
    caseStudy: {
      // timeline: TODO
      // architectureNote: TODO
      // challenge: TODO
      // nextSteps: TODO
    },
  },
  {
    slug: "icarus",
    name: "Icarus",
    platform: "web+mobile",
    cardVariant: "desktop",
    pitch:
      "Proves you actually understand the work you submitted — code, thesis, pitch deck, or otherwise.",
    description:
      "A Universal Integrity & Logic Auditor. Challenges the user to prove they genuinely understand work they submit — a codebase, thesis, business plan, pitch deck, or any document representing their thinking.",
    role: "Solo Developer",
    teamSize: "Solo project",
    techStack: ["TypeScript", "LLM Reasoning", "Auth"],
    identityGradient: ["#2E2E2E", "#E7E7E7"],
    accentColor: "#E6484F",
    // liveUrl: TODO
    // repoUrl: TODO
    // screenshot: TODO
    caseStudy: {
      // timeline: TODO
      // architectureNote: TODO
      // challenge: TODO
      // nextSteps: TODO
    },
  },
  {
    slug: "garahe",
    name: "garahe",
    platform: "web+mobile",
    cardVariant: "desktop",
    pitch:
      "Your entire vehicle history — repairs, costs, decisions — in one place, and smarter the longer you use it.",
    description:
      "Private, web-based vehicle companion. Vehicle knowledge lives in one place, belongs entirely to the owner, gets smarter with use. Built for people who forget service history, lose receipts, switch mechanics, or can't tell if they can really afford their next vehicle.",
    role: "Solo Developer",
    teamSize: "Solo project",
    techStack: ["Vue", "Express", "MongoDB"],
    identityGradient: ["#B5651D", "#4A4A4A"],
    // liveUrl: TODO
    // repoUrl: TODO
    // screenshot: TODO
    caseStudy: {
      // timeline: TODO
      // architectureNote: TODO
      // challenge: TODO
      // nextSteps: TODO
    },
  },
];
