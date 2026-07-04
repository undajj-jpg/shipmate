import { asc, eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { projects, requests } from "@/db/schema";
import { getClientContext } from "@/lib/guards";
import { RequestBoard, type BoardRequest } from "@/components/requests/request-board";

export default async function RequestsPage() {
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

  const rows = await db.query.requests.findMany({
    where: and(eq(requests.projectId, project.id), ne(requests.status, "archived")),
    orderBy: [asc(requests.position), asc(requests.createdAt)],
  });

  const boardRequests: BoardRequest[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    kind: r.kind,
    status: r.status,
    position: r.position,
    createdAt: r.createdAt.toISOString(),
    shippedAt: r.shippedAt?.toISOString() ?? null,
  }));

  return (
    <RequestBoard projectId={project.id} requests={boardRequests} plan={client.plan} />
  );
}
