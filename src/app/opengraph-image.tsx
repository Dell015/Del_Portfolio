import { ImageResponse } from "next/og";
import { site } from "@/lib/content/site";

export const alt = "Randel Serafica — Full-Stack Developer & Startup Founder";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview card, generated at build time. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0F0F0F",
          color: "#F5F5F5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: "#A0A0A0" }}>
          <div style={{ width: 14, height: 14, borderRadius: 14, background: "#D11A2A" }} />
          Portfolio
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>
            {site.name}
          </div>
          <div style={{ marginTop: 28, fontSize: 44, color: "#D0D0D0", lineHeight: 1.25 }}>
            Full-stack developer &amp; startup founder
          </div>
        </div>
        <div style={{ fontSize: 28, color: "#A0A0A0" }}>
          Cauayan, Isabela · BS Computer Science · Building for the Philippine market
        </div>
      </div>
    ),
    size,
  );
}
