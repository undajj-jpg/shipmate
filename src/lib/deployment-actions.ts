"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { deployments } from "@/db/schema";
import { requireActor, requireProjectAccess } from "@/lib/access";
import { listVercelDeployments } from "@/lib/vercel";

/**
 * Manual "Refresh from Vercel": pulls the latest deployments from the
 * Vercel API and upserts them (idempotent on vercelDeploymentId).
 */
export async function refreshDeployments(formData: FormData) {
  const projectId = z.string().uuid().parse(formData.get("projectId"));
  const actor = await requireActor();
  const { project } = await requireProjectAccess(actor, projectId);

  if (!project.vercelProjectId) {
    return; // nothing linked yet — the button is hidden in this case anyway
  }

  const fresh = await listVercelDeployments(project.vercelProjectId);
  for (const d of fresh) {
    await db
      .insert(deployments)
      .values({
        projectId: project.id,
        vercelDeploymentId: d.vercelDeploymentId,
        state: d.state,
        commitSha: d.commitSha,
        commitMessage: d.commitMessage,
        url: d.url,
        startedAt: d.startedAt,
        readyAt: d.readyAt,
      })
      .onConflictDoUpdate({
        target: deployments.vercelDeploymentId,
        set: { state: d.state, url: d.url, readyAt: d.readyAt },
      });
  }

  revalidatePath("/app/project");
  revalidatePath("/dev");
}
