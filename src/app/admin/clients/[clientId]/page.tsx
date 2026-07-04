import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clients, passthroughCharges, projects } from "@/db/schema";
import {
  addChargeAction,
  sendToInvoiceAction,
  updateProjectLinks,
} from "@/lib/admin-actions";
import { BUILD_TYPE_LABELS } from "@/lib/plans";
import { cn } from "@/lib/utils";

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

export default async function AdminClientDetail({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
    with: { user: true, assignedDeveloper: true },
  });
  if (!client) notFound();

  const project = await db.query.projects.findFirst({
    where: eq(projects.clientId, client.id),
  });
  const charges = await db.query.passthroughCharges.findMany({
    where: eq(passthroughCharges.clientId, client.id),
    orderBy: [desc(passthroughCharges.period), desc(passthroughCharges.createdAt)],
  });

  const byPeriod = new Map<string, typeof charges>();
  for (const c of charges) {
    byPeriod.set(c.period, [...(byPeriod.get(c.period) ?? []), c]);
  }
  const period = currentPeriod();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/clients"
          className="font-mono text-[12px] text-muted-ink hover:text-ink"
        >
          ← All clients
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
            {client.companyName}
          </h1>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-[11px]",
              client.planStatus === "active"
                ? "bg-green-tint text-green"
                : "bg-background text-muted-ink"
            )}
          >
            {client.plan} · {client.planStatus}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-ink">
          {client.user?.email} · developer:{" "}
          {client.assignedDeveloper?.name ?? "unassigned"} ·{" "}
          <Link
            href={`/admin/clients/${client.id}/view`}
            className="text-ink underline underline-offset-2"
          >
            open portal read-only
          </Link>
          {client.stripeCustomerId && (
            <>
              {" · "}
              <a
                href={`https://dashboard.stripe.com/customers/${client.stripeCustomerId}`}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline underline-offset-2"
              >
                stripe ↗
              </a>
            </>
          )}
        </p>
      </div>

      {/* Project settings */}
      {project && (
        <div className="rounded-2xl border border-hairline bg-white p-6">
          <h2 className="mb-1 font-display text-lg font-semibold text-ink">Project</h2>
          <p className="mb-4 font-mono text-[12px] text-muted-ink">
            {project.name} · {BUILD_TYPE_LABELS[project.buildType]}
          </p>
          <form action={updateProjectLinks} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="projectId" value={project.id} />
            <label className="text-sm">
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
                Repo URL
              </span>
              <input
                name="repoUrl"
                defaultValue={project.repoUrl ?? ""}
                placeholder="https://github.com/…"
                className="w-full rounded-[10px] border border-hairline bg-background px-3 py-2 outline-none focus:border-ink"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
                Production URL
              </span>
              <input
                name="productionUrl"
                defaultValue={project.productionUrl ?? ""}
                placeholder="https://…"
                className="w-full rounded-[10px] border border-hairline bg-background px-3 py-2 outline-none focus:border-ink"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
                Vercel project ID
              </span>
              <input
                name="vercelProjectId"
                defaultValue={project.vercelProjectId ?? ""}
                placeholder="prj_…"
                className="w-full rounded-[10px] border border-hairline bg-background px-3 py-2 font-mono text-[13px] outline-none focus:border-ink"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
                Status
              </span>
              <select
                name="status"
                defaultValue={project.status}
                className="w-full rounded-[10px] border border-hairline bg-background px-3 py-2 outline-none"
              >
                <option value="onboarding">onboarding</option>
                <option value="active">active</option>
                <option value="maintained">maintained</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                Save project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Infrastructure costs */}
      <div className="rounded-2xl border border-hairline bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Infrastructure costs
        </h2>
        <p className="mt-1 text-sm text-muted-ink">
          Record this client&apos;s at-cost infra charges, then send them to their next
          Stripe invoice. The client sees these in their billing screen and gets an
          itemized email before being charged.
        </p>

        <form
          action={addChargeAction}
          className="mt-5 grid gap-3 rounded-xl border border-hairline bg-background p-4 sm:grid-cols-[110px_150px_1fr_110px_auto]"
        >
          <input type="hidden" name="clientId" value={client.id} />
          <input
            name="period"
            defaultValue={period}
            pattern="\d{4}-\d{2}"
            className="rounded-[10px] border border-hairline bg-white px-3 py-2 font-mono text-[13px] outline-none focus:border-ink"
          />
          <select
            name="category"
            className="rounded-[10px] border border-hairline bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="hosting">hosting</option>
            <option value="ai_usage">ai_usage</option>
            <option value="domain">domain</option>
            <option value="database">database</option>
            <option value="email">email</option>
            <option value="other">other</option>
          </select>
          <input
            name="description"
            required
            placeholder="Vercel Pro seat + bandwidth"
            className="rounded-[10px] border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <input
            name="amount"
            required
            placeholder="12.40"
            inputMode="decimal"
            className="rounded-[10px] border border-hairline bg-white px-3 py-2 font-mono text-[13px] outline-none focus:border-ink"
          />
          <button
            type="submit"
            className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        </form>

        <div className="mt-6 space-y-5">
          {byPeriod.size === 0 && (
            <p className="rounded-xl border border-dashed border-hairline px-4 py-6 text-center text-sm text-muted-ink">
              No charges recorded yet. Add the first one above — it lands on the
              client&apos;s next invoice at cost.
            </p>
          )}
          {Array.from(byPeriod.entries()).map(([p, rows]) => {
            const total = rows.reduce((s, r) => s + r.amountCents, 0);
            const pendingCount = rows.filter((r) => r.status === "pending").length;
            return (
              <div key={p}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
                    {p} · {money(total)}
                  </span>
                  {pendingCount > 0 && (
                    <form action={sendToInvoiceAction}>
                      <input type="hidden" name="clientId" value={client.id} />
                      <input type="hidden" name="period" value={p} />
                      <button
                        type="submit"
                        className="rounded-lg bg-green px-3 py-1.5 text-[13px] font-semibold text-[#06271A] transition hover:-translate-y-px"
                      >
                        Send {pendingCount} to invoice
                      </button>
                    </form>
                  )}
                </div>
                <ul className="divide-y divide-hairline rounded-xl border border-hairline">
                  {rows.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[11px] text-muted-ink">
                          {r.category}
                        </span>{" "}
                        <span className="text-ink">{r.description}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 font-mono text-[11px]",
                            r.status === "paid"
                              ? "bg-green-tint text-green"
                              : r.status === "invoiced"
                                ? "bg-blue-tint text-blue"
                                : "bg-background text-muted-ink"
                          )}
                        >
                          {r.status}
                        </span>
                        <span className="font-mono text-ink">{money(r.amountCents)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
