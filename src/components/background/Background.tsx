import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { moments, type DiscoveredPhoto } from "@/lib/content/timeline";
import { Credentials } from "./Credentials";

const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;

/** Front photo first (name contains "#"), then the rest in natural name order. */
function orderPhotos(names: string[]): string[] {
  const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
  return names
    .filter((n) => IMAGE.test(n))
    .sort((a, b) => Number(b.includes("#")) - Number(a.includes("#")) || collator.compare(a, b));
}

/**
 * Reads each moment's folder in `public/moments/` when the page is built, so new
 * photos only need to be dropped into the folder.
 */
export async function Background() {
  const entries = await Promise.all(
    moments.map(async (m) => {
      try {
        const dir = path.join(process.cwd(), "public", "moments", m.slug);
        const all = orderPhotos(await readdir(dir));
        const names = m.only ? m.only.filter((f) => all.includes(f)) : all;
        const photos = await Promise.all(
          names.map(async (file): Promise<DiscoveredPhoto> => {
            try {
              const meta = await sharp(path.join(dir, file)).metadata();
              // EXIF orientation 5-8 means the picture is displayed rotated a quarter turn.
              const turned = (meta.orientation ?? 1) >= 5;
              const [width, height] = turned ? [meta.height, meta.width] : [meta.width, meta.height];
              return { file, width: width ?? 4, height: height ?? 5 };
            } catch {
              return { file, width: 4, height: 5 };
            }
          }),
        );
        return [m.slug, photos] as const;
      } catch {
        return [m.slug, []] as const;
      }
    }),
  );
  return <Credentials photosBySlug={Object.fromEntries(entries)} />;
}
