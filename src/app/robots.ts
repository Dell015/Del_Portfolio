import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL;
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
