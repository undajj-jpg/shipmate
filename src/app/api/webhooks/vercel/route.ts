import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { deployments, messages, projects } from "@/db/schema";
import { mapVercelState } from "@/lib/vercel";
import { notifyDeployFailed } from "@/lib/email";
import { env } from "@/env";

export const runtime = "nodejs";

const eventSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    createdAt: z.number(),
    payload: z
      .object({
        project: z.object({ id: z.string() }).passthrough(),
        deployment: z
          .object({
            id: z.string(),
            url: z.string().nullish(),
            meta: z
              .object({
                githubCommitSha: z.string().nullish(),
                githubCommitMessage: z.string().nullish(),
              })
              .passthrough()
              .nullish(),
          })
          .passthrough(),
        target: z.string().nullish(),
      })
      .passthrough(),
  })
  .passthrough();

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac("sha1", env.VERCEL_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

const HANDLED = new Set([
  "deployment.created",
  "deployment.succeeded",
  "deployment.error",
  "deployment.canceled",
]);

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifySignature(rawBody, req.headers.get("x-vercel-signature"))) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: z.infer<typeof eventSchema>;
  try {
    event = eventSchema.parse(JSON.parse(rawBody));
  } catch {
    return Response.json({ error: "Unrecognized payload" }, { status: 400 });
  }

  if (!HANDLED.has(event.type)) {
    return Response.json({ received: true });
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.vercelProjectId, event.payload.project.id),
  });
  if (!project) {
    // Not a project we track — acknowledge so Vercel stops retrying.
    return Response.json({ received: true });
  }

  const dep = event.payload.deployment;
  const state =
    event.type === "deployment.succeeded"
      ? ("ready" as const)
      : event.type === "deployment.error"
        ? ("error" as const)
        : event.type === "deployment.canceled"
          ? ("canceled" as const)
          : mapVercelState(null); // created → building

  const existing = await db.query.deployments.findFirst({
    where: eq(deployments.vercelDeploymentId, dep.id),
  });

  const readyAt = state === "ready" ? new Date(event.createdAt) : null;

  await db
    .insert(deployments)
    .values({
      projectId: project.id,
      vercelDeploymentId: dep.id,
      state,
      commitSha: dep.meta?.githubCommitSha ?? null,
      commitMessage: dep.meta?.githubCommitMessage ?? null,
      url: dep.url ?? null,
      startedAt: new Date(event.createdAt),
      readyAt,
    })
    .onConflictDoUpdate({
      target: deployments.vercelDeploymentId,
      set: {
        state,
        url: dep.url ?? null,
        ...(readyAt ? { readyAt } : {}),
      },
    });

  // Post the "watch it ship" deploy card into chat exactly once per
  // terminal state transition (idempotent across webhook retries).
  const isTerminal = state === "ready" || state === "error";
  const alreadyAnnounced = existing?.state === state;
  if (isTerminal && !alreadyAnnounced) {
    const durationSecs =
      existing && readyAt
        ? Math.max(0, Math.round((readyAt.getTime() - existing.startedAt.getTime()) / 1000))
        : undefined;

    await db.insert(messages).values({
      projectId: project.id,
      senderId: null,
      body: state === "ready" ? "Deployed to production" : "Deploy failed",
      type: "deploy",
      deployMeta: {
        deploymentId: dep.id,
        url: dep.url ?? undefined,
        state,
        commitSha: dep.meta?.githubCommitSha ?? undefined,
        duration: durationSecs,
      },
    });

    if (state === "error") {
      void notifyDeployFailed(
        project.id,
        dep.url ?? null,
        dep.meta?.githubCommitMessage ?? null
      ).catch(() => {});
    }
  }

  return Response.json({ received: true });
}
