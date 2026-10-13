/**
 * The "Background" timeline. This is the file to edit as the years go by.
 *
 * To add a moment, put a new object at the TOP of `moments` (newest first) and
 * save. The page lays it out, alternates its side, and animates it on its own.
 *
 * Photos are optional. Drop images into `public/moments/` and list them as
 * `photos: [{ src: "/moments/ignite-2025.jpg", alt: "…", caption: "…" }]`.
 * The first photo is the main one; an optional second sits smaller, overlapping,
 * and drifts at a different speed. Without photos a typographic card is shown.
 *
 * Client and code details from the internship are under NDA, so that entry
 * describes the kind of system only. Do not add specifics.
 */

export interface MomentPhoto {
  src: string;
  alt: string;
  /** Short line shown on the photo, e.g. a place or event. */
  caption?: string;
}

export interface Moment {
  kind: "Experience" | "Education" | "Competition" | "Training";
  /** Display year or range. Leave out if unknown: the kind is shown instead. */
  year?: string;
  title: string;
  subtitle: string;
  note?: string;
  photos?: MomentPhoto[];
}

export const background = {
  eyebrow: "Background",
  heading: "The track record so far.",
  intro:
    "School, startup competitions and an enterprise internship, the places I learned to ship, and to lead the people shipping with me.",
} as const;

export const moments: Moment[] = [
  {
    kind: "Competition",
    year: "2026",
    title: "IGNITE OGIS Start-Up Competition",
    subtitle: "In progress · Seated",
  },
  {
    kind: "Experience",
    year: "2026",
    title: "Full Stack Developer Intern",
    subtitle: "240-hour internship · Internal ERP system",
    note: "Worked with a team building an internal enterprise resource planning system for a whole company. Client and implementation details are confidential under NDA.",
  },
  {
    kind: "Competition",
    year: "2025",
    title: "IgnITE Start-Up Competition",
    subtitle: "1st Runner-Up · Team Lead & Developer",
  },
  {
    kind: "Competition",
    year: "2025",
    title: "Philippine Startup Challenge 10",
    subtitle: "Regional Finalist · DICT Region II · Team Lead & Developer",
  },
  {
    kind: "Education",
    year: "2023 – 2027",
    title: "BS Computer Science",
    subtitle: "University of Saint Louis Tuguegarao",
    note: "Thesis leader on Karela, a 5-member team project combining adaptive fitness modeling with crowdsourced civic reporting.",
  },
  {
    kind: "Training",
    title: "TCON 8 Cybersecurity Conference",
    subtitle: "HackthenorthPH · Participant",
  },
  {
    kind: "Training",
    title: "AWS Cloud Networking & EC2 Workshop",
    subtitle: "AWS User Group Philippines · Participant",
  },
];
