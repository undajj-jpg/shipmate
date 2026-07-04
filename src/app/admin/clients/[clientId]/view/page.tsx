import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { clients, deployments, projects, requests } from "@/db/schema";
import { fetchMessages } from "@/lib/message-actions";
import { ChatScreen } from "@/components/chat/chat-screen";
import { DeploymentList } from "@/components/deployments/deployment-list";
import { cn } from "@/lib/utils";

/** Read-only impersonation: what the client sees, without write access. */
export default async function AdminImpersonationView({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await db.query.clients.findFirst({ where: eq(clients.id, clientId) });
  if (!client) notFound();

  const project = await db.query.projects.findFirst({
    where: eq(projects.clientId, client.id),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-amber/40 bg-amber-tint px-4 py-2.5">
        <span className="font-mono text-[12px] text-amber">
          Impersonation · viewing {client.companyName}&apos;s portal read-only
        </span>
        <Link
          href={`/admin/clients/${client.id}`}
          className="font-mono text-[12px] text-ink underline underline-offset-2"
        >
          exit
        </Link>
      </div>

      {!project ? (
        <p className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-muted-ink">
          No project yet — the client hasn&apos;t completed onboarding.
        </p>
      ) : (
        <>
          <ChatScreen
            projectId={project.id}
            initialMessages={await fetchMessages({ projectId: project.id })}
            currentUserId={client.userId}
            canSend={false}
            emptyState="No messages in this workspace yet."
          />

          <div>
            <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
              Their request queue
            </h2>
            <ul className="divide-y divide-hairline rounded-2xl border border-hairline bg-white">
              {(
                await db.query.requests.findMany({
                  where: and(
                    eq(requests.projectId, project.id),
                    ne(requests.status, "archived")
                  ),
                  orderBy: [asc(requests.position), asc(requests.createdAt)],
                })
              ).map((r) => (
                <li key={r.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-ink">{r.title}</span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-mono text-[11px]",
                      r.status === "active" || r.status === "in_review"
                        ? "bg-green-tint text-green"
                        : "bg-background text-muted-ink"
                    )}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
              Their deployments
            </h2>
            <DeploymentList
              deployments={(
                await db.query.deployments.findMany({
                  where: eq(deployments.projectId, project.id),
                  orderBy: [desc(deployments.startedAt)],
                  limit: 10,
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
          </div>
        </>
      )}
    </div>
  );
}
