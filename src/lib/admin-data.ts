import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { clients, deployments, projects, requests, users } from "@/db/schema";
import {
  BUILD_PRICE_CENTS,
  MAINTAIN_PRICE_CENTS,
  type BuildType,
} from "@/lib/plans";

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfWeek(): Date {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
  return monday;
}

export type AdminMetrics = {
  mrrCents: number;
  activeBuild: number;
  activeMaintain: number;
  churnThisMonth: number;
  shippedThisWeek: number;
  avgTurnaroundHours: number | null;
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
  // Active clients with their first project's build type (for MRR of Maintain tiers).
  const activeClients = await db.query.clients.findMany({
    where: eq(clients.planStatus, "active"),
    with: { projects: { orderBy: [projects.createdAt], limit: 1 } },
  });

  let mrrCents = 0;
  let activeBuild = 0;
  let activeMaintain = 0;
  for (const c of activeClients) {
    if (c.plan === "build") {
      mrrCents += BUILD_PRICE_CENTS;
      activeBuild += 1;
    } else if (c.plan === "maintain") {
      const bt: BuildType = c.projects[0]?.buildType ?? "site";
      mrrCents += MAINTAIN_PRICE_CENTS[bt];
      activeMaintain += 1;
    }
  }

  const [{ value: churnThisMonth }] = await db
    .select({ value: count() })
    .from(clients)
    .where(and(eq(clients.planStatus, "canceled"), gte(clients.createdAt, startOfMonth())));

  const [{ value: shippedThisWeek }] = await db
    .select({ value: count() })
    .from(requests)
    .where(and(eq(requests.status, "shipped"), gte(requests.shippedAt, startOfWeek())));

  const [{ avg }] = await db
    .select({
      avg: sql<number | null>`avg(extract(epoch from (${requests.shippedAt} - ${requests.createdAt})) / 3600)`,
    })
    .from(requests)
    .where(and(eq(requests.status, "shipped"), isNotNull(requests.shippedAt)));

  return {
    mrrCents,
    activeBuild,
    activeMaintain,
    churnThisMonth,
    shippedThisWeek,
    avgTurnaroundHours: avg === null ? null : Math.round(avg),
  };
}

export type AdminClientRow = {
  id: string;
  companyName: string;
  email: string | null;
  plan: string;
  planStatus: string;
  buildType: BuildType | null;
  projectName: string | null;
  stripeCustomerId: string | null;
  developerId: string | null;
  developerName: string | null;
};

export async function getAdminClients(): Promise<AdminClientRow[]> {
  const rows = await db.query.clients.findMany({
    with: {
      user: true,
      assignedDeveloper: true,
      projects: { orderBy: [projects.createdAt], limit: 1 },
    },
    orderBy: [desc(clients.createdAt)],
  });
  return rows.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    email: c.user?.email ?? null,
    plan: c.plan,
    planStatus: c.planStatus,
    buildType: c.projects[0]?.buildType ?? null,
    projectName: c.projects[0]?.name ?? null,
    stripeCustomerId: c.stripeCustomerId,
    developerId: c.assignedDeveloperId,
    developerName: c.assignedDeveloper?.name ?? null,
  }));
}

export type DeveloperRow = {
  id: string;
  name: string | null;
  email: string;
  clientCount: number;
  openRequests: number;
};

export async function getDevelopers(): Promise<DeveloperRow[]> {
  const devs = await db.query.users.findMany({ where: eq(users.role, "developer") });
  const result: DeveloperRow[] = [];
  for (const dev of devs) {
    const assigned = await db.query.clients.findMany({
      where: eq(clients.assignedDeveloperId, dev.id),
      with: { projects: { columns: { id: true } } },
    });
    const projectIds = assigned.flatMap((c) => c.projects.map((p) => p.id));
    let openRequests = 0;
    if (projectIds.length > 0) {
      const [{ value }] = await db
        .select({ value: count() })
        .from(requests)
        .where(
          and(
            sql`${requests.projectId} = any(${projectIds})`,
            sql`${requests.status} in ('queued','active','in_review')`
          )
        );
      openRequests = value;
    }
    result.push({
      id: dev.id,
      name: dev.name,
      email: dev.email,
      clientCount: assigned.length,
      openRequests,
    });
  }
  return result;
}

export type AdminActiveRequest = {
  id: string;
  title: string;
  companyName: string;
  clientId: string;
  createdAt: string;
  ageHours: number;
  status: string;
};

export async function getActiveRequests(): Promise<AdminActiveRequest[]> {
  const rows = await db
    .select({
      id: requests.id,
      title: requests.title,
      status: requests.status,
      createdAt: requests.createdAt,
      companyName: clients.companyName,
      clientId: clients.id,
    })
    .from(requests)
    .innerJoin(projects, eq(requests.projectId, projects.id))
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(sql`${requests.status} in ('active','in_review')`)
    .orderBy(requests.createdAt);

  const now = Date.now();
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    companyName: r.companyName,
    clientId: r.clientId,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    ageHours: Math.round((now - r.createdAt.getTime()) / (1000 * 60 * 60)),
  }));
}

export async function getDeveloperOptions() {
  const devs = await db.query.users.findMany({ where: eq(users.role, "developer") });
  return devs.map((d) => ({ id: d.id, name: d.name ?? d.email }));
}

export async function getLatestDeployState(projectId: string) {
  const d = await db.query.deployments.findFirst({
    where: eq(deployments.projectId, projectId),
    orderBy: [desc(deployments.startedAt)],
  });
  return d?.state ?? null;
}
