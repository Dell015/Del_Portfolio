import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlackHoleLab } from "@/components/lab/BlackHoleLab";

export const metadata: Metadata = {
  title: "Lab | black hole",
  robots: { index: false, follow: false },
};

/** Development-only preview. It 404s in production builds. */
export default function BlackHoleLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <BlackHoleLab />;
}
