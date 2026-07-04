import Link from "next/link";
import { requireStaff, getAssignedClients } from "@/lib/dev-guards";
import { cn } from "@/lib/utils";

const DEPLOY_DOT: Record<string, string> = {
  ready: "bg-green",
  building: "bg-amber-400",
  error: "bg-red-500",
  canceled: "bg-hairline",
};

export default async function DevDashboard() {
  const staff = await requireStaff();
  const clients = await getAssignedClients(staff);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          Your clients
        </h1>
        <p className="mt-0.5 text-sm text-muted-ink">
          {clients.length} {clients.length === 1 ? "client" : "clients"} assigned to you.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hairline px-6 py-12 text-center">
          <p className="text-sm text-muted-ink">
            No clients assigned yet. An admin will pair you with clients from the back
            office.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <Link
              key={c.clientId}
              href={`/dev/${c.clientId}`}
              className="group rounded-2xl border border-hairline bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_12px_32px_-16px_rgba(16,24,43,0.18)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="truncate font-display text-lg font-semibold text-ink">
                  {c.companyName}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px]",
                    c.plan === "build"
                      ? "bg-green-tint text-green"
                      : c.plan === "maintain"
                        ? "bg-background text-muted-ink"
                        : "bg-red-50 text-red-600"
                  )}
                >
                  {c.plan}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
                    active
                  </span>
                  <span className="truncate text-ink">
                    {c.activeRequest ?? (
                      <span className="text-muted-ink">nothing in flight</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-ink">
                    <span
                      className={cn(
                        "inline-block h-2 w-2 rounded-full",
                        DEPLOY_DOT[c.lastDeployState ?? ""] ?? "bg-hairline"
                      )}
                    />
                    {c.lastDeployState ?? "no deploys"}
                  </span>
                  {c.unread > 0 && (
                    <span className="rounded-full bg-ink px-2 py-0.5 font-mono text-[10.5px] text-white">
                      {c.unread} msg
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
