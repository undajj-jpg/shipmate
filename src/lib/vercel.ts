import { z } from "zod";
import { env } from "@/env";
import type { Deployment } from "@/db/schema";

const vercelDeploymentSchema = z
  .object({
    uid: z.string(),
    url: z.string().nullish(),
    state: z
      .enum(["BUILDING", "ERROR", "INITIALIZING", "QUEUED", "READY", "CANCELED", "DELETED"])
      .nullish(),
    created: z.number(),
    ready: z.number().nullish(),
    meta: z
      .object({
        githubCommitSha: z.string().nullish(),
        githubCommitMessage: z.string().nullish(),
      })
      .passthrough()
      .nullish(),
  })
  .passthrough();

const listResponseSchema = z
  .object({ deployments: z.array(vercelDeploymentSchema) })
  .passthrough();

export type VercelDeployment = {
  vercelDeploymentId: string;
  state: Deployment["state"];
  url: string | null;
  commitSha: string | null;
  commitMessage: string | null;
  startedAt: Date;
  readyAt: Date | null;
};

export function mapVercelState(
  state: string | null | undefined
): Deployment["state"] {
  switch (state) {
    case "READY":
      return "ready";
    case "ERROR":
      return "error";
    case "CANCELED":
    case "DELETED":
      return "canceled";
    default:
      return "building";
  }
}

/**
 * Fetches recent deployments for a Vercel project via the REST API
 * (the manual "Refresh from Vercel" fallback when webhooks lag or were
 * registered late).
 */
export async function listVercelDeployments(
  vercelProjectId: string,
  limit = 20
): Promise<VercelDeployment[]> {
  const params = new URLSearchParams({
    projectId: vercelProjectId,
    limit: String(limit),
    teamId: env.VERCEL_TEAM_ID,
  });

  const res = await fetch(`https://api.vercel.com/v6/deployments?${params}`, {
    headers: { Authorization: `Bearer ${env.VERCEL_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Vercel API ${res.status}: ${await res.text()}`);
  }

  const parsed = listResponseSchema.parse(await res.json());
  return parsed.deployments.map((d) => ({
    vercelDeploymentId: d.uid,
    state: mapVercelState(d.state),
    url: d.url ?? null,
    commitSha: d.meta?.githubCommitSha ?? null,
    commitMessage: d.meta?.githubCommitMessage ?? null,
    startedAt: new Date(d.created),
    readyAt: d.ready ? new Date(d.ready) : null,
  }));
}
