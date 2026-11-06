/**
 * The site's absolute URL, used for link previews, the sitemap, robots.txt and the
 * structured data. NEXT_PUBLIC_SITE_URL wins when it's set (e.g. a custom domain);
 * otherwise Vercel's own production URL is used, so these never point at localhost
 * on the live site just because the variable was forgotten.
 */
export const SITE_URL: string | undefined =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined);
