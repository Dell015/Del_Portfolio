import { ImageResponse } from "next/og";
import { projects } from "@/lib/content/projects";

export const alt = "Project case study by Randel Serafica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/** Link-preview card for one case study, in that project's own colours. */
export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  const [c0, c1] = p?.identityGradient ?? ["#D11A2A", "#D11A2A"];
  const single = c0.toLowerCase() === c1.toLowerCase();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0F0F0F", color: "#F5F5F5" }}>
        <div
          style={{
            width: 28,
            height: "100%",
            background: single ? c0 : `linear-gradient(180deg, ${c0}, ${c1})`,
          }}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "68px 76px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#A0A0A0" }}>
            <div style={{ width: 14, height: 14, borderRadius: 14, background: "#D11A2A" }} />
            Case study · Randel Serafica
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 120, fontWeight: 700, lineHeight: 1, letterSpacing: -4 }}>{p?.name ?? "Project"}</div>
            <div style={{ marginTop: 26, fontSize: 40, color: "#D0D0D0", lineHeight: 1.25, maxWidth: 940 }}>
              {p?.plain ?? ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#A0A0A0" }}>
            {(p?.techStack ?? []).slice(0, 4).map((t) => (
              <div key={t} style={{ display: "flex", border: "1px solid #333", padding: "8px 16px" }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
