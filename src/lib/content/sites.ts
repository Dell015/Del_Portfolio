/**
 * Smaller builds: landing pages, portfolios and business sites. Not the big projects
 * (those are the planets). Each one is a node orbiting the sun in the project solar
 * system (the sun is Randel). Newest first.
 *
 * To add one, copy this into the list:
 *
 *   {
 *     slug: "cafe-landing",                 // unique, lowercase, no spaces
 *     title: "Café landing page",           // what you built, in plain words
 *     client: "Local café, Cauayan",        // who it's for (a name only if they're OK with it)
 *     year: "2026",
 *     kind: "Landing page",                 // Landing page · Portfolio · Business site · Event site
 *     tag: "Commission",                    // optional: Commission · Concept · Own project · Volunteer
 *     role: "Lead front end, team of 3",    // optional: only if you didn't build it alone
 *     summary: "One or two sentences: what it is and what's on it.",
 *     stack: ["Next.js", "Tailwind CSS"],   // optional
 *     url: "https://...",
 *   },
 */

export interface Site {
  slug: string;
  title: string;
  client: string;
  year: string;
  kind: string;
  /** How it came about, e.g. "Commission", "Concept", "Own project". */
  tag?: string;
  /** My part, when it wasn't a solo build, e.g. "Lead front end, team of 5". */
  role?: string;
  summary: string;
  stack?: string[];
  url?: string;
}

export const sites: Site[] = [
  {
    slug: "aws-northbound",
    title: "AWS NorthBound",
    client: "AWS Student Community Day North 2026",
    year: "2026",
    kind: "Event site",
    role: "Lead front end, team of 5",
    summary:
      "Landing page for a one-day student cloud event at USLT: speakers, schedule, tickets, venue and FAQ.",
    url: "https://awsscdnorth.com",
  },
  {
    slug: "supreme-autospa",
    title: "Supreme AutoSpa",
    client: "Car wash & detailing shop, Cauayan",
    year: "2026",
    kind: "Business site",
    tag: "Concept",
    summary:
      "Site for a car care shop: services, gallery, reviews, location and hours, and an online quote request.",
    url: "https://supreme-auto-spa-kappa.vercel.app",
  },
  {
    slug: "karela-site",
    title: "Karela project site",
    client: "Karela (my thesis team)",
    year: "2026",
    kind: "Landing page",
    tag: "Own project",
    summary:
      "The public page for Karela while the app is in development: what it does, a browser demo, a waitlist and a survey.",
    url: "https://karela-phi.vercel.app",
  },
  {
    slug: "mark-rhaven",
    title: "Mark Rhaven Baligod",
    client: "Line cook & pastry chef",
    year: "2026",
    kind: "Portfolio",
    summary: "Online culinary portfolio: his experience, plated dishes and a way to get in touch.",
    url: "https://mark-rhaven.netlify.app",
  },
];
