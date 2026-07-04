"use server";

import { and, asc, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { requireActor, requireProjectAccess } from "@/lib/access";
import { notifyNewMessage } from "@/lib/email";

export type ChatMessage = {
  id: string;
  body: string;
  type: "text" | "system" | "deploy";
  senderId: string | null;
  senderName: string | null;
  senderRole: "client" | "developer" | "admin" | null;
  deployMeta: {
    deploymentId?: string;
    url?: string;
    state?: string;
    commitSha?: string;
    duration?: number;
  } | null;
  createdAt: string;
};

const sendSchema = z.object({
  projectId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export async function sendMessage(input: { projectId: string; body: string }) {
  const { projectId, body } = sendSchema.parse(input);
  const actor = await requireActor();
  const { clientUserId, assignedDeveloperId } = await requireProjectAccess(
    actor,
    projectId
  );

  const [inserted] = await db
    .insert(messages)
    .values({ projectId, senderId: actor.userId, body: body.trim(), type: "text" })
    .returning({ id: messages.id, createdAt: messages.createdAt });

  // Notify the other party (batched, max 1/hour) — fire and forget.
  const recipientId = actor.userId === clientUserId ? assignedDeveloperId : clientUserId;
  if (recipientId) {
    void notifyNewMessage(recipientId, projectId).catch(() => {});
  }

  revalidatePath("/app/chat");
  return { id: inserted.id, createdAt: inserted.createdAt.toISOString() };
}

export async function fetchMessages(input: {
  projectId: string;
  after?: string;
}): Promise<ChatMessage[]> {
  const { projectId, after } = z
    .object({ projectId: z.string().uuid(), after: z.string().datetime().optional() })
    .parse(input);
  const actor = await requireActor();
  await requireProjectAccess(actor, projectId);

  const rows = await db
    .select({
      id: messages.id,
      body: messages.body,
      type: messages.type,
      senderId: messages.senderId,
      senderName: users.name,
      senderRole: users.role,
      deployMeta: messages.deployMeta,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(
      after
        ? and(eq(messages.projectId, projectId), gt(messages.createdAt, new Date(after)))
        : eq(messages.projectId, projectId)
    )
    .orderBy(asc(messages.createdAt))
    .limit(500);

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}
