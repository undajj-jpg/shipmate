import { getAdminMetrics } from "@/lib/admin-data";
import { money } from "@/lib/plans";

export default async function AdminDashboard() {
  const m = await getAdminMetrics();

  const cards = [
    { label: "MRR", value: money(m.mrrCents), accent: "text-green" },
    { label: "Build clients", value: String(m.activeBuild), accent: "text-blue" },
    { label: "Maintain clients", value: String(m.activeMaintain), accent: "text-violet" },
    { label: "Churn this month", value: String(m.churnThisMonth), accent: "text-pink" },
    { label: "Shipped this week", value: String(m.shippedThisWeek), accent: "text-green" },
    {
      label: "Avg turnaround",
      value: m.avgTurnaroundHours === null ? "—" : `${m.avgTurnaroundHours}h`,
      accent: "text-amber",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-hairline bg-white p-5">
            <div className={`font-display text-3xl font-bold tracking-[-0.02em] ${c.accent}`}>
              {c.value}
            </div>
            <div className="mt-1 text-[13px] text-muted-ink">{c.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[13px] text-muted-ink">
        MRR sums active subscriptions at their current plan rate (Maintain priced by each
        client&apos;s product type). Infra pass-through is excluded — it&apos;s at cost.
      </p>
    </div>
  );
}
