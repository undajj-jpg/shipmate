import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { deployments, projects } from "@/db/schema";
import { getClientContext } from "@/lib/guards";
import { BUILD_TYPE_LABELS } from "@/lib/plans";
import { DeploymentList } from "@/components/deployments/deployment-list";

export default async function ProjectPage() {
  const { client } = await getClientContext();

  const project = await db.query.projects.findFirst({
    where: eq(projects.clientId, client.id),
  });
  if (!project) {
    return (
      <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
        <p className="text-sm text-muted-ink">
          Your project is being set up — check back in a moment.
        </p>
      </div>
    );
  }

  const deploys = await db.query.deployments.findMany({
    where: eq(deployments.projectId, project.id),
    orderBy: [desc(deployments.startedAt)],
    limit: 20,
  });
  const latest = deploys[0];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
            {project.name}
          </h1>
          <p className="mt-0.5 font-mono text-xs text-muted-ink">
            {BUILD_TYPE_LABELS[project.buildType]} · {project.status}
          </p>
        </div>
        {project.productionUrl && (
          <a
            href={project.productionUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
          >
            Open production ↗
          </a>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-hairline bg-white p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
            Production
          </div>
          {project.productionUrl ? (
            <a
              href={project.productionUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-sm font-medium text-ink underline underline-offset-2"
            >
              {project.productionUrl.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <p className="text-sm text-muted-ink">
              Not deployed yet — your first deploy will appear here.
            </p>
          )}
          {latest && (
            <p className="mt-2 font-mono text-[11.5px] text-muted-ink">
              latest deploy:{" "}
              <span className={latest.state === "ready" ? "text-green" : ""}>
                {latest.state}
              </span>
              {latest.readyAt && ` · ${latest.readyAt.toLocaleString()}`}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-hairline bg-white p-5">
          <div className="mb-1 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
            Repository
          </div>
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-sm font-medium text-ink underline underline-offset-2"
            >
              {project.repoUrl.replace(/^https?:\/\//, "")}
            </a>
          ) : (
            <p className="text-sm text-muted-ink">
              Your repository link lands here once it&apos;s created. It&apos;s yours from
              day one.
            </p>
          )}
        </div>
      </div>

      {project.productionUrl && (
        <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
          <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
            <span className="flex gap-[5px]">
              <span className="h-2 w-2 rounded-full bg-hairline" />
              <span className="h-2 w-2 rounded-full bg-hairline" />
              <span className="h-2 w-2 rounded-full bg-hairline" />
            </span>
            <span className="font-mono text-[11px] text-muted-ink">
              {project.productionUrl.replace(/^https?:\/\//, "")}
            </span>
          </div>
          <iframe
            src={project.productionUrl}
            title="Production preview"
            className="h-[420px] w-full"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      <div>
        <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
          Deployment history
        </h2>
        <DeploymentList
          deployments={deploys.map((d) => ({
            id: d.id,
            state: d.state,
            commitMessage: d.commitMessage,
            url: d.url,
            startedAt: d.startedAt.toISOString(),
            readyAt: d.readyAt?.toISOString() ?? null,
          }))}
        />
      </div>
    </div>
  );
}
