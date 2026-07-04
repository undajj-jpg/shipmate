"use server";

import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients, deployments, messages, requests } from "@/db/schema";
import { requireActor, requireProjectAccess } from "@/lib/access";
import { notifyRequestShipped } from "@/lib/email";
import { desc, gte } from "drizzle-orm";

async function requireStaffForRequest(requestId: string) {
  const actor = await requireActor();
  if (actor.role === "client") {
    throw new Error("Only developers can change request status");
  }
  const request = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
  if (!request) throw new Error("Request not found");
  const { project } = await requireProjectAccess(actor, request.projectId);
  return { actor, request, project };
}

/**
 * Starts a request: sets it active and auto-queues any other active request.
 * Enforces the app-level rule of at most one active request per project.
 */
export async function startRequest(input: { requestId: string }) {
  const { requestId } = z.object({ requestId: z.string().uuid() }).parse(input);
  const { request } = await requireStaffForRequest(requestId);

  await db
    .update(requests)
    .set({ status: "queued" })
    .where(
      and(
        eq(requests.projectId, request.projectId),
        ne(requests.id, requestId),
        eq(requests.status, "active")
      )
    );

  await db.update(requests).set({ status: "active" }).where(eq(requests.id, requestId));

  revalidatePath("/dev");
}

export async function markInReview(input: { requestId: string }) {
  const { requestId } = z.object({ requestId: z.string().uuid() }).parse(input);
  await requireStaffForRequest(requestId);
  await db.update(requests).set({ status: "in_review" }).where(eq(requests.id, requestId));
  revalidatePath("/dev");
}

const shipSchema = z.object({
  requestId: z.string().uuid(),
  note: z.string().max(1000).optional(),
});

/**
 * Ships a request: marks it shipped, posts a system message to chat
 * (linking a deployment from the last hour if one exists), and emails
 * the client.
 */
export async function shipRequest(input: z.infer<typeof shipSchema>) {
  const { requestId, note } = shipSchema.parse(input);
  const { request, project } = await requireStaffForRequest(requestId);

  const now = new Date();
  await db
    .update(requests)
    .set({ status: "shipped", shippedAt: now })
    .where(eq(requests.id, requestId));

  // Link a deployment that completed in the last hour, if any.
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const recentDeploy = await db.query.deployments.findFirst({
    where: and(
      eq(deployments.projectId, request.projectId),
      eq(deployments.state, "ready"),
      gte(deployments.readyAt, hourAgo)
    ),
    orderBy: [desc(deployments.readyAt)],
  });

  const actor = await requireActor();
  const body = note
    ? `Shipped: ${request.title} — ${note}`
    : `Shipped: ${request.title}`;

  await db.insert(messages).values({
    projectId: request.projectId,
    senderId: actor.userId,
    body: recentDeploy?.url ? `${body} · live at ${recentDeploy.url}` : body,
    type: "system",
  });

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, project.clientId),
  });
  if (client) {
    void notifyRequestShipped(client.userId, project.name, request.title, note).catch(
      () => {}
    );
  }

  revalidatePath("/dev");
  revalidatePath("/app/requests");
}

/** Developer sends a message into a project chat (used by the /dev chat view). */
export async function devSendMessage(input: { projectId: string; body: string }) {
  const { projectId, body } = z
    .object({ projectId: z.string().uuid(), body: z.string().min(1).max(4000) })
    .parse(input);
  const actor = await requireActor();
  if (actor.role === "client") throw new Error("Not a developer");
  await requireProjectAccess(actor, projectId);

  await db
    .insert(messages)
    .values({ projectId, senderId: actor.userId, body: body.trim(), type: "text" });

  revalidatePath("/dev");
}
