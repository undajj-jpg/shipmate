import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clients, projects, type Project } from "@/db/schema";

export type Actor = {
  userId: string;
  role: "client" | "developer" | "admin";
};

export async function requireActor(): Promise<Actor> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return { userId: session.user.id, role: session.user.role };
}

/**
 * Loads a project and verifies the actor may act on it:
 * clients only their own projects, developers only assigned clients,
 * admins everything.
 */
export async function requireProjectAccess(
  actor: Actor,
  projectId: string
): Promise<{ project: Project; clientUserId: string; assignedDeveloperId: string | null }> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  if (!project) {
    throw new Error("Project not found");
  }
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, project.clientId),
  });
  if (!client) {
    throw new Error("Client not found");
  }

  const allowed =
    actor.role === "admin" ||
    (actor.role === "client" && client.userId === actor.userId) ||
    (actor.role === "developer" && client.assignedDeveloperId === actor.userId);

  if (!allowed) {
    throw new Error("Not authorized for this project");
  }

  return {
    project,
    clientUserId: client.userId,
    assignedDeveloperId: client.assignedDeveloperId,
  };
}
