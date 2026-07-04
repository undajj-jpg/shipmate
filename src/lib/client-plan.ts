import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import type { BuildType } from "@/lib/plans";

/**
 * A client's Maintain tier is determined by their primary (first) project's
 * build type. Defaults to "site" for clients who somehow have no project yet.
 */
export async function getClientBuildType(clientId: string): Promise<BuildType> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.clientId, clientId),
    orderBy: [asc(projects.createdAt)],
  });
  return project?.buildType ?? "site";
}
