import { notFound } from "next/navigation";
import Link from "next/link";
import { projects } from "@/lib/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.name} — Randel Serafica`,
    description: project.pitch,
  };
}

export default async function ProjectCaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-bg text-text">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${project.identityGradient[0]}, ${project.identityGradient[1]})`,
          }}
        />
        <div className="relative mx-auto max-w-5xl px-6 pt-28 pb-16 md:pt-36 md:pb-24">
          {/* Back link */}
          <Link
            href="/#projects"
            className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent group"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            Back to projects
          </Link>

          {/* Project name + pitch */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="h-14 w-14 shrink-0 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${project.identityGradient[0]}, ${project.identityGradient[1]})`,
              }}
            >
              <span className="font-[family-name:var(--font-display)] text-xl font-bold text-white/90">
                {project.name[0]}
              </span>
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold md:text-5xl lg:text-6xl">
                {project.name}
              </h1>
              <p className="mt-2 text-lg text-text-muted md:text-xl">
                {project.pitch}
              </p>
            </div>
          </div>

          {/* Quick meta row */}
          <div className="flex flex-wrap gap-6 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-text-muted/60">
                Role
              </span>
              <span className="font-medium text-text">{project.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-text-muted/60">
                Team
              </span>
              <span className="font-medium text-text">{project.teamSize}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-text-muted/60">
                Platform
              </span>
              <span className="font-medium text-text capitalize">{project.platform}</span>
            </div>
            {project.caseStudy?.timeline && (
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-text-muted/60">
                  Status
                </span>
                <span className="font-medium text-text">{project.caseStudy.timeline}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 pb-24">
        {/* Hero screenshot/placeholder */}
        <div
          className="relative -mt-8 mb-16 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/20"
          style={{
            background: `linear-gradient(135deg, ${project.identityGradient[0]}40, ${project.identityGradient[1]}40)`,
          }}
        >
          {project.screenshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.screenshot}
              alt={`${project.name} screenshot`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <span className="font-[family-name:var(--font-display)] text-4xl font-bold text-white/30">
                {project.name}
              </span>
              <p className="mt-2 font-[family-name:var(--font-mono)] text-xs text-white/20">
                Screenshots coming soon
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_320px]">
          {/* Main content column */}
          <div className="space-y-16">
            {/* About / Description */}
            <Section title="About">
              <p className="text-base leading-relaxed">{project.description}</p>
            </Section>

            {/* Architecture */}
            <Section title="Architecture & Key Decisions">
              {project.caseStudy?.architectureNote ? (
                <div className="space-y-4">
                  {project.caseStudy.architectureNote.split(". ").reduce((acc: string[][], sentence, i, arr) => {
                    // Group into paragraphs of ~2-3 sentences
                    const lastGroup = acc[acc.length - 1];
                    if (!lastGroup || lastGroup.length >= 2) {
                      acc.push([sentence + (i < arr.length - 1 ? "." : "")]);
                    } else {
                      lastGroup.push(sentence + (i < arr.length - 1 ? "." : ""));
                    }
                    return acc;
                  }, []).map((group, i) => (
                    <p key={i} className="text-base leading-relaxed">
                      {group.join(" ")}
                    </p>
                  ))}
                </div>
              ) : (
                <Placeholder>
                  Architecture details coming soon.
                </Placeholder>
              )}
            </Section>

            {/* Challenges */}
            <Section title="Challenges & Solutions">
              {project.caseStudy?.challenge ? (
                <p className="text-base leading-relaxed">{project.caseStudy.challenge}</p>
              ) : (
                <Placeholder>
                  Challenge and resolution narrative coming soon.
                </Placeholder>
              )}
            </Section>

            {/* Next steps */}
            <Section title="What's Next">
              {project.caseStudy?.nextSteps ? (
                <p className="text-base leading-relaxed">{project.caseStudy.nextSteps}</p>
              ) : (
                <Placeholder>
                  Next steps and reflections coming soon.
                </Placeholder>
              )}
            </Section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
            {/* Tech stack */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-text-muted">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg bg-surface-2 px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs text-text-muted transition-colors hover:text-text hover:bg-white/5"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-text-muted">
                Links
              </h3>
              <div className="space-y-3">
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent/80"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Live Site
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-text-muted/40">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Live — coming soon
                  </span>
                )}
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-accent transition-colors hover:text-accent/80"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Source Code
                  </a>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-text-muted/40">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Repo — coming soon
                  </span>
                )}
              </div>
            </div>

            {/* Project info */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-text-muted">
                Details
              </h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-text-muted/60">
                    Role
                  </dt>
                  <dd className="mt-0.5 text-text">{project.role}</dd>
                </div>
                <div>
                  <dt className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-text-muted/60">
                    Team
                  </dt>
                  <dd className="mt-0.5 text-text">{project.teamSize}</dd>
                </div>
                <div>
                  <dt className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-text-muted/60">
                    Platform
                  </dt>
                  <dd className="mt-0.5 text-text capitalize">{project.platform}</dd>
                </div>
                {project.caseStudy?.timeline && (
                  <div>
                    <dt className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-text-muted/60">
                      Timeline
                    </dt>
                    <dd className="mt-0.5 text-text">{project.caseStudy.timeline}</dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>

        {/* Navigation to other projects */}
        <div className="mt-24 border-t border-border pt-12">
          <h3 className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.2em] text-text-muted">
            Other Projects
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((p) => p.slug !== project.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:border-accent/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
                >
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${p.identityGradient[0]}, ${p.identityGradient[1]})`,
                    }}
                  >
                    <span className="font-[family-name:var(--font-display)] text-sm font-bold text-white/90">
                      {p.name[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-[family-name:var(--font-display)] text-sm font-semibold text-text group-hover:text-accent transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-xs text-text-muted line-clamp-1">
                      {p.pitch}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-2xl font-semibold">
        {title}
      </h2>
      <div className="text-text-muted leading-relaxed">{children}</div>
    </section>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface/50 px-4 py-3 text-sm italic text-text-muted/60">
      {children}
    </div>
  );
}
