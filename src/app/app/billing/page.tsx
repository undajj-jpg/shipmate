import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { passthroughCharges, type PassthroughCharge } from "@/db/schema";
import { getClientContext, hasActivePlan } from "@/lib/guards";
import { switchPlan, openBillingPortal } from "@/lib/billing-actions";
import { getClientBuildType } from "@/lib/client-plan";
import { PLAN_COPY, planPriceLabel, type PaidPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<PassthroughCharge["category"], string> = {
  hosting: "Hosting",
  ai_usage: "AI usage",
  domain: "Domain",
  database: "Database",
  email: "Email",
  other: "Other",
};

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

export default async function BillingPage() {
  const { client } = await getClientContext();

  if (!hasActivePlan(client)) {
    redirect("/app");
  }

  const plan: PaidPlan = client.plan === "maintain" ? "maintain" : "build";
  const buildType = await getClientBuildType(client.id);
  const otherPlan: PaidPlan = plan === "build" ? "maintain" : "build";

  const charges = await db.query.passthroughCharges.findMany({
    where: eq(passthroughCharges.clientId, client.id),
    orderBy: [desc(passthroughCharges.period), desc(passthroughCharges.createdAt)],
  });

  const period = currentPeriod();
  const thisMonth = charges.filter((c) => c.period === period);
  const thisMonthTotal = thisMonth.reduce((sum, c) => sum + c.amountCents, 0);

  const history = new Map<string, { total: number; statuses: Set<string> }>();
  for (const c of charges) {
    if (c.period === period) continue;
    const entry = history.get(c.period) ?? { total: 0, statuses: new Set() };
    entry.total += c.amountCents;
    entry.statuses.add(c.status);
    history.set(c.period, entry);
  }

  return (
    <div>
      <div className="max-w-2xl space-y-6">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          Billing
        </h1>

        {/* Plan */}
        <div className="rounded-2xl border border-hairline bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-md bg-green-tint px-2 py-0.5 font-mono text-xs text-green">
                  {PLAN_COPY[plan].name} · {client.planStatus}
                </span>
              </div>
              <div className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
                {planPriceLabel(plan, buildType)}
                <span className="ml-2 font-mono text-xs font-normal text-muted-ink">
                  + infra at cost
                </span>
              </div>
            </div>
            <form action={openBillingPortal}>
              <button
                type="submit"
                className="rounded-[10px] border-[1.5px] border-hairline px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink"
              >
                Manage payment &amp; invoices
              </button>
            </form>
          </div>
          <div className="mt-5 border-t border-hairline pt-5">
            <form action={switchPlan}>
              <button
                type="submit"
                className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
              >
                Switch to {PLAN_COPY[otherPlan].name} —{" "}
                {planPriceLabel(otherPlan, buildType)}
              </button>
            </form>
            <p className="mt-2.5 text-[13px] text-muted-ink">
              {plan === "build"
                ? "Done building? Maintain keeps your product online, patched, and monitored. Prorated from today."
                : "Ready to build again? Switch back and your developer picks up where you left off. Prorated from today."}
            </p>
          </div>
        </div>

        {/* Infrastructure usage */}
        <div className="rounded-2xl border border-hairline bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Infrastructure usage
          </h2>
          <p className="mt-1 text-sm text-muted-ink">
            These are your product&apos;s real infrastructure costs (hosting, AI usage,
            domain). We pass them through at cost — no markup.
          </p>

          <div className="mt-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
                {period} (current month)
              </span>
              <span className="font-mono text-sm font-medium text-ink">
                {money(thisMonthTotal)}
              </span>
            </div>
            {thisMonth.length === 0 ? (
              <p className="rounded-lg bg-background px-3.5 py-3 text-sm text-muted-ink">
                No infrastructure charges recorded yet this month.
              </p>
            ) : (
              <ul className="divide-y divide-hairline rounded-lg border border-hairline">
                {thisMonth.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-ink">
                        {CATEGORY_LABELS[c.category]}
                      </span>
                      <span className="ml-2 truncate text-muted-ink">{c.description}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-mono text-[11px]",
                          c.status === "paid"
                            ? "bg-green-tint text-green"
                            : "bg-background text-muted-ink"
                        )}
                      >
                        {c.status}
                      </span>
                      <span className="font-mono text-ink">{money(c.amountCents)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {history.size > 0 && (
            <div className="mt-6">
              <div className="mb-2 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
                Past months
              </div>
              <ul className="divide-y divide-hairline rounded-lg border border-hairline">
                {Array.from(history.entries()).map(([p, entry]) => (
                  <li
                    key={p}
                    className="flex items-center justify-between px-3.5 py-2.5 text-sm"
                  >
                    <span className="font-mono text-ink">{p}</span>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 font-mono text-[11px]",
                          entry.statuses.has("pending") || entry.statuses.has("invoiced")
                            ? "bg-background text-muted-ink"
                            : "bg-green-tint text-green"
                        )}
                      >
                        {entry.statuses.has("pending")
                          ? "pending"
                          : entry.statuses.has("invoiced")
                            ? "invoiced"
                            : "paid"}
                      </span>
                      <span className="font-mono text-ink">{money(entry.total)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[13px] text-muted-ink">
                Full invoices, including these line items, live in{" "}
                <span className="font-medium text-ink">Manage payment &amp; invoices</span>{" "}
                above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
