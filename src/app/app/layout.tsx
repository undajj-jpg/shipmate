import Link from "next/link";
import type { ReactNode } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { deployments, projects } from "@/db/schema";
import { getClientContext, hasActivePlan } from "@/lib/guards";
import { getClientBuildType } from "@/lib/client-plan";
import { Paywall } from "@/components/billing/paywall";
import { PortalNav } from "@/components/portal/portal-nav";
import { PLAN_COPY } from "@/lib/plans";
import { cn } from "@/lib/utils";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { userName, client } = await getClientContext();

  if (!hasActivePlan(client)) {
    const buildType = await getClientBuildType(client.id);
    return <Paywall client={client} buildType={buildType} />;
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.clientId, client.id),
  });
  const latestDeployment = project
    ? await db.query.deployments.findFirst({
        where: eq(deployments.projectId, project.id),
        orderBy: [desc(deployments.startedAt)],
      })
    : undefined;

  const deployHealthy = latestDeployment?.state === "ready";
  const planName = PLAN_COPY[client.plan === "maintain" ? "maintain" : "build"].name;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-[10px]">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="flex items-center gap-2 font-display text-lg font-bold tracking-[-0.02em] text-ink"
            >
              <span className="h-2 w-2 rounded-full bg-green" />
              Shipmate
            </Link>
            <span className="hidden text-hairline sm:inline">/</span>
            <span className="hidden max-w-[200px] truncate text-sm text-muted-ink sm:inline">
              {client.companyName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-green-tint px-2 py-1 font-mono text-[11px] text-green">
              {planName}
            </span>
            <span
              className="flex items-center gap-1.5 font-mono text-[11px] text-muted-ink"
              title={
                latestDeployment
                  ? `Latest deploy: ${latestDeployment.state}`
                  : "No deployments yet"
              }
            >
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full",
                  deployHealthy
                    ? "animate-ship-pulse bg-green"
                    : latestDeployment?.state === "error"
                      ? "bg-red-500"
                      : "bg-hairline"
                )}
              />
              <span className="hidden sm:inline">
                {deployHealthy
                  ? "production healthy"
                  : (latestDeployment?.state ?? "no deploys")}
              </span>
            </span>
            <span className="hidden text-sm text-muted-ink md:inline">
              {userName?.split(" ")[0]}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:gap-8 md:py-8">
        <aside className="md:w-44 md:shrink-0">
          <PortalNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
