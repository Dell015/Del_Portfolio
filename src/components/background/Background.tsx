import { discoverMomentPhotos } from "@/lib/content/discoverMomentPhotos";
import { Credentials } from "./Credentials";

/** The full experience's track record; photos are read from `public/moments/` at build time. */
export async function Background() {
  return <Credentials photosBySlug={await discoverMomentPhotos()} />;
}
