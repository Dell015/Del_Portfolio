/**
 * Paid work: projects someone hired Randel to build. Each one becomes a node
 * orbiting the sun in the project solar system (the sun is him).
 *
 * Add them one at a time, newest first. Until the first one is here, the sun shows
 * a single "open slot" node that points people to the contact form.
 *
 * Copy this into the list to add one:
 *
 *   {
 *     slug: "cafe-landing",                 // unique, lowercase, no spaces
 *     title: "Landing page for a café",     // what you built, in plain words
 *     client: "Local café, Cauayan",        // a name only if they're OK with it
 *     year: "2026",
 *     kind: "Landing page",                 // Landing page · Portfolio · Web app · ...
 *     summary: "One or two sentences: what they needed and what you made.",
 *     stack: ["Next.js", "Tailwind CSS"],
 *     url: "https://...",                   // optional: the live site
 *   },
 */

export interface Commission {
  slug: string;
  title: string;
  client: string;
  year: string;
  kind: string;
  summary: string;
  stack: string[];
  /** Optional link to the live work. */
  url?: string;
}

export const commissions: Commission[] = [];
