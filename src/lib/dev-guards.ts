import { redirect } from "next/navigation";
import { and, count, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clients, deployments, messages, projects, requests } from "@/db/schema";

export type StaffContext = {
  userId: string;
  role: "developer" | "admin";
  name: string | null;
};

export async function requireStaff(): Promise<StaffContext> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectTo=/dev");
  }
  if (session.user.role !== "developer" && session.user.role !== "admin") {
    redirect("/app");
  }
  return {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name ?? null,
  };
}

export type DevClientCard = {
  clientId: string;
  companyName: string;
  plan: "build" | "maintain" | "none";
  planStatus: string;
  projectId: string | null;
  projectName: string | null;
  activeRequest: string | null;
  unread: number;
  lastDeployState: string | null;
};

/**
 * Clients assigned to this developer (or all clients, for admins),
 * with the at-a-glance data the dashboard shows.
 */
export async function getAssignedClients(staff: StaffContext): Promise<DevClientCard[]> {
  const rows = await db.query.clients.findMany({
    where:
      staff.role === "admin" ? undefined : eq(clients.assignedDeveloperId, staff.userId),
    with: { projects: { limit: 1 } },
    orderBy: [desc(clients.createdAt)],
  });

  const cards: DevClientCard[] = [];
  for (const client of rows) {
    const project = client.projects[0];
    let activeRequest: string | null = null;
    let unread = 0;
    let lastDeployState: string | null = null;

    if (project) {
      const active = await db.query.requests.findFirst({
        where: and(eq(requests.projectId, project.id), eq(requests.status, "active")),
      });
      activeRequest = active?.title ?? null;

      // "Unread" heuristic: messages from the client not authored by staff.
      const [{ value }] = await db
        .select({ value: count() })
        .from(messages)
        .where(and(eq(messages.projectId, project.id), eq(messages.senderId, client.userId)));
      unread = value;

      const deploy = await db.query.deployments.findFirst({
        where: eq(deployments.projectId, project.id),
        orderBy: [desc(deployments.startedAt)],
      });
      lastDeployState = deploy?.state ?? null;
    }

    cards.push({
      clientId: client.id,
      companyName: client.companyName,
      plan: client.plan,
      planStatus: client.planStatus,
      projectId: project?.id ?? null,
      projectName: project?.name ?? null,
      activeRequest,
      unread,
      lastDeployState,
    });
  }
  return cards;
}

/** Loads one client for the per-client view, enforcing assignment. */
export async function getClientForStaff(staff: StaffContext, clientId: string) {
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
    with: { user: true, assignedDeveloper: true },
  });
  if (!client) redirect("/dev");
  if (staff.role === "developer" && client.assignedDeveloperId !== staff.userId) {
    redirect("/dev");
  }
  const project = await db.query.projects.findFirst({
    where: eq(projects.clientId, client.id),
  });
  return { client, project };
}
