import Link from "next/link";
import { asc, desc, eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { deployments, requests } from "@/db/schema";
import { requireStaff, getClientForStaff } from "@/lib/dev-guards";
import { fetchMessages } from "@/lib/message-actions";
import { ClientWorkspace } from "@/components/dev/client-workspace";
import { BUILD_TYPE_LABELS, PLAN_COPY } from "@/lib/plans";
import { cn } from "@/lib/utils";

export default async function DevClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const staff = await requireStaff();
  const { clientId } = await params;
  const { client, project } = await getClientForStaff(staff, clientId);

  return (
    <div>
      <div className="mb-5">
        <Link
          href="/dev"
          className="font-mono text-[12px] text-muted-ink transition-colors hover:text-ink"
        >
          ← All clients
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
            {client.companyName}
          </h1>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-[11px]",
              client.plan === "build"
                ? "bg-green-tint text-green"
                : "bg-background text-muted-ink"
            )}
          >
            {client.plan === "none" ? "no plan" : PLAN_COPY[client.plan].name} ·{" "}
            {client.planStatus}
          </span>
          {project && (
            <span className="font-mono text-[12px] text-muted-ink">
              {project.name} · {BUILD_TYPE_LABELS[project.buildType]}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-ink">
          {client.user?.email}
          {project?.productionUrl && (
            <>
              {" · "}
              <a
                href={project.productionUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline underline-offset-2"
              >
                {project.productionUrl.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
        </p>
      </div>

      {!project ? (
        <div className="rounded-2xl border border-dashed border-hairline px-6 py-12 text-center text-sm text-muted-ink">
          This client hasn&apos;t completed onboarding yet — no project to work on.
        </div>
      ) : (
        <ClientWorkspace
          projectId={project.id}
          currentUserId={staff.userId}
          messages={await fetchMessages({ projectId: project.id })}
          requests={(
            await db.query.requests.findMany({
              where: and(eq(requests.projectId, project.id), ne(requests.status, "archived")),
              orderBy: [asc(requests.position), asc(requests.createdAt)],
            })
          ).map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            kind: r.kind,
            status: r.status,
            position: r.position,
          }))}
          deployments={(
            await db.query.deployments.findMany({
              where: eq(deployments.projectId, project.id),
              orderBy: [desc(deployments.startedAt)],
              limit: 20,
            })
          ).map((d) => ({
            id: d.id,
            state: d.state,
            commitMessage: d.commitMessage,
            url: d.url,
            startedAt: d.startedAt.toISOString(),
            readyAt: d.readyAt?.toISOString() ?? null,
          }))}
        />
      )}
    </div>
  );
}
