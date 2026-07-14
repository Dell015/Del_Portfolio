import { site } from "@/lib/content/site";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">
        {site.name}
      </h1>
      <p className="mt-4 max-w-lg text-center text-text-muted">
        {site.identityStatement}
      </p>
    </main>
  );
}
