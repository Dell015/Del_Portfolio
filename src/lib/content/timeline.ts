/**
 * The "Background" timeline. This is the file to edit as the years go by.
 *
 * To add a moment, add a new object to `moments` with its `date` (YYYY-MM-DD) and
 * save. The list is sorted by `date`, oldest first, so the order in this file does
 * not matter. The page lays it out, alternates its side, and animates it on its own.
 *
 * Photos are picked up automatically. Every moment has its own folder,
 * `public/moments/<slug>/`: drop JPG, PNG or WebP files in it and they appear.
 *   - A file with "#" in its name is the front photo (e.g. `Intern2#.jpg`).
 *   - The rest follow in name order. The 2nd sits smaller, overlapping the front,
 *     and the 3rd shows on wide screens. More than 3 are ignored.
 *   - To pick specific files from a crowded folder, set `only: ["a.jpg", "b.jpg"]` on the moment.
 *   - Without photos a typographic card is shown.
 * (RAW files such as .DNG cannot be shown in a browser: export them to JPG first.)
 * For a NEW moment, create a folder that matches its `slug`.
 *
 * Optionally set `photos` here to override the folder: file names, or objects with
 * alt text and a caption, e.g. [{ src: "1.jpg", alt: "…", caption: "…" }, "2.jpg"].
 *
 * Client and code details from the internship are under NDA, so that entry
 * describes the kind of system only. Do not add specifics.
 */

export interface MomentPhoto {
  src: string;
  alt: string;
  /** Natural size of the file, so the page can keep its proportions. */
  width?: number;
  height?: number;
  /** Short line shown on the photo, e.g. a place or event. */
  caption?: string;
}

export interface Moment {
  /** Folder name under public/moments/ for this moment's photos. */
  slug: string;
  kind: "Experience" | "Education" | "Competition" | "Training";
  /** Sort key, YYYY-MM-DD. For a range, use the start. Month or day can be approximate. */
  date: string;
  /** Display year or range. Leave out if unknown: the kind is shown instead. */
  year?: string;
  title: string;
  subtitle: string;
  note?: string;
  /** Show only these files from the folder, in this order (the others stay in the folder, unused). */
  only?: string[];
  /** File names in `public/moments/<slug>/`, or objects with alt text and a caption. */
  photos?: (string | MomentPhoto)[];
}

/** A photo found in a moment's folder, with its natural size. */
export interface DiscoveredPhoto {
  file: string;
  width: number;
  height: number;
}

/** Resolves a moment's photos to full URLs with alt text. */
export function momentPhotos(m: Moment, discovered: DiscoveredPhoto[] = []): MomentPhoto[] {
  const list: (string | MomentPhoto | DiscoveredPhoto)[] = m.photos ?? discovered;
  return list.map((p, i) => {
    const photo: MomentPhoto =
      typeof p === "string"
        ? { src: p, alt: "" }
        : "file" in p
          ? { src: p.file, alt: "", width: p.width, height: p.height }
          : p;
    return {
      ...photo,
      // "#" and spaces in file names must be encoded or the browser treats them as a URL fragment.
      src: photo.src.startsWith("/") ? photo.src : `/moments/${m.slug}/${encodeURIComponent(photo.src)}`,
      alt: photo.alt || `${m.title}, photo ${i + 1}`,
    };
  });
}

export const background = {
  eyebrow: "Background",
  heading: "The track record so far.",
  intro:
    "School, startup competitions and an enterprise internship, the places I learned to ship, and to lead the people shipping with me.",
} as const;

const unsorted: Moment[] = [
  {
    kind: "Experience",
    year: "2026",
    slug: "2026-erp-internship",
    date: "2026-01-05",
    title: "Full Stack Developer Intern",
    subtitle: "240-hour internship · Internal ERP system",
    note: "Worked with a team building an internal enterprise resource planning system for a whole company. Client and implementation details are confidential under NDA.",
  },
  {
    kind: "Competition",
    year: "2025",
    slug: "2025-ignite",
    date: "2025-05-09",
    title: "IgnITE Start-Up Competition",
    subtitle: "1st Runner-Up · Team Lead & Developer",
  },
  {
    kind: "Competition",
    year: "2025",
    slug: "2025-psc-10",
    date: "2025-11-07",
    title: "Philippine Startup Challenge 10",
    subtitle: "Regional Finalist · DICT Region II · Team Lead & Developer",
  },
  {
    kind: "Education",
    year: "2023 – 2027",
    slug: "2023-2027-bs-computer-science",
    date: "2023-08-01",
    only: ["USL2#.jpg", "USL1.jpg", "USL6.jpg"],
    title: "BS Computer Science",
    subtitle: "University of Saint Louis Tuguegarao",
    note: "Consistent Dean's Lister with Highest Honors. Thesis leader on Karela, a 5-member team project combining adaptive fitness modeling with crowdsourced civic reporting.",
  },
  {
    kind: "Training",
    slug: "training-tcon-8",
    date: "2025-11-28",
    year: "2025",
    title: "TCON 8 Cybersecurity Conference",
    subtitle: "HackthenorthPH · Participant · Nov 28–30, 2025",
  },
  {
    kind: "Training",
    slug: "training-aws-workshop",
    date: "2025-10-10",
    year: "2025",
    title: "AWS Cloud Networking & EC2 Workshop",
    subtitle: "AWS User Group Philippines · Participant · Oct 10, 2025",
  },
];

/** Oldest first. */
export const moments: Moment[] = [...unsorted].sort((a, b) => a.date.localeCompare(b.date));
