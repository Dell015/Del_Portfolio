import type { NextConfig } from "next";

/**
 * Baseline security headers. A strict Content-Security-Policy is deliberately not
 * set here: Next.js inlines small scripts, so a CSP needs per-request nonces and is
 * best added together with a report-only trial. See docs/review/QA-REPORT.md.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
