import { notFound } from "next/navigation";
import Link from "next/link";
import { projects } from "@/lib/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.name} — Randel Serafica`,
    description: project.pitch,
  };
}

export default function ProjectCaseStudy({
  params,
}: {
  params: { slug: string };
}) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-24">
      {/* Back link */}
      <Link
        href="/#projects"
        className="mb-8 inline-flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-accent"
      >
        ← Back to projects
      </Link>

      {/* 1. Hero shot */}
      <div
        className="mb-12 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-border"
        style={{
          background: `linear-gradient(135deg, ${project.identityGradient[0]}, ${project.identityGradient[1]})`,
        }}
      >
        <span className="font-[family-name:var(--font-display)] text-3xl font-bold text-white/90 drop-shadow-md">
          {project.name}
        </span>
      </div>

      {/* 2. Problem statement */}
      <Section title="The Problem">
        <p>{project.description}</p>
      </Section>

      {/* 3. Role + timeline */}
      <Section title="Role & Timeline">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">
              Role
            </dt>
            <dd className="mt-1 font-medium">{project.role}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">
              Team
            </dt>
            <dd className="mt-1 font-medium">{project.teamSize}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">
              Timeline
            </dt>
            <dd className="mt-1 font-medium">
              {project.caseStudy?.timeline || (
                <Placeholder>Timeline coming soon</Placeholder>
              )}
            </dd>
          </div>
        </dl>
      </Section>

      {/* 4. UI/UX Decisions */}
      <Section title="UI/UX Decisions">
        <Placeholder>
          Screenshots and decision rationale will be added here — before/after
          comparisons showing why specific design choices were made.
        </Placeholder>
      </Section>

      {/* 5. Architecture */}
      <Section title="Architecture">
        {project.caseStudy?.architectureNote ? (
          <p>{project.caseStudy.architectureNote}</p>
        ) : (
          <Placeholder>
            Architecture diagram and one highlighted backend decision coming
            soon.
          </Placeholder>
        )}
        {/* Tech stack */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-surface-2 px-3 py-1 font-[family-name:var(--font-mono)] text-xs text-text-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </Section>

      {/* 6. Challenges */}
      <Section title="Challenges & Solutions">
        {project.caseStudy?.challenge ? (
          <p>{project.caseStudy.challenge}</p>
        ) : (
          <Placeholder>
            A real challenge and how it was solved — this is what separates
            junior from senior-reading portfolios. Content coming soon.
          </Placeholder>
        )}
      </Section>

      {/* 7. Links */}
      <Section title="Links">
        <div className="flex gap-4">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              Live Site →
            </a>
          ) : (
            <span className="text-text-muted/50">Live — coming soon</span>
          )}
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              GitHub →
            </a>
          ) : (
            <span className="text-text-muted/50">Repo — coming soon</span>
          )}
        </div>
      </Section>

      {/* 8. Next steps */}
      <Section title="What's Next">
        {project.caseStudy?.nextSteps ? (
          <p>{project.caseStudy.nextSteps}</p>
        ) : (
          <Placeholder>
            Reflections on what I&apos;d do differently and planned next steps.
          </Placeholder>
        )}
      </Section>
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
    <section className="mb-12">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold">
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
