"use server";

import { and, eq, inArray, max } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients, requests } from "@/db/schema";
import { requireActor, requireProjectAccess } from "@/lib/access";

const createSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  kind: z.enum(["feature", "bug"]).default("feature"),
});

export async function createRequest(input: z.infer<typeof createSchema>) {
  const parsed = createSchema.parse(input);
  const actor = await requireActor();
  const { project } = await requireProjectAccess(actor, parsed.projectId);

  // Maintain plan covers bug fixes only — new features need Build.
  if (actor.role === "client") {
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, project.clientId),
    });
    if (client?.plan === "maintain" && parsed.kind !== "bug") {
      throw new Error("New features require the Build plan");
    }
  }

  const [{ maxPos }] = await db
    .select({ maxPos: max(requests.position) })
    .from(requests)
    .where(and(eq(requests.projectId, parsed.projectId), eq(requests.status, "queued")));

  await db.insert(requests).values({
    projectId: parsed.projectId,
    title: parsed.title,
    description: parsed.description,
    kind: parsed.kind,
    status: "queued",
    position: (maxPos ?? 0) + 1,
  });

  revalidatePath("/app/requests");
}

const reorderSchema = z.object({
  projectId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).max(200),
});

export async function reorderQueue(input: z.infer<typeof reorderSchema>) {
  const { projectId, orderedIds } = reorderSchema.parse(input);
  const actor = await requireActor();
  await requireProjectAccess(actor, projectId);

  // Only reorder rows that really are queued requests of this project.
  const queued = await db.query.requests.findMany({
    where: and(
      eq(requests.projectId, projectId),
      eq(requests.status, "queued"),
      inArray(requests.id, orderedIds)
    ),
    columns: { id: true },
  });
  const validIds = new Set(queued.map((r) => r.id));

  let position = 1;
  for (const id of orderedIds) {
    if (!validIds.has(id)) continue;
    await db.update(requests).set({ position }).where(eq(requests.id, id));
    position += 1;
  }

  revalidatePath("/app/requests");
}

export async function archiveRequest(input: { requestId: string }) {
  const { requestId } = z.object({ requestId: z.string().uuid() }).parse(input);
  const actor = await requireActor();

  const request = await db.query.requests.findFirst({
    where: eq(requests.id, requestId),
  });
  if (!request) throw new Error("Request not found");
  await requireProjectAccess(actor, request.projectId);

  if (request.status === "active" && actor.role === "client") {
    throw new Error("Your developer is working on this — message them to stop it first");
  }

  await db.update(requests).set({ status: "archived" }).where(eq(requests.id, requestId));
  revalidatePath("/app/requests");
}
