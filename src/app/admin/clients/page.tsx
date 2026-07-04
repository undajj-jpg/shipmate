import Link from "next/link";
import { getAdminClients, getDeveloperOptions } from "@/lib/admin-data";
import { reassignDeveloper } from "@/lib/admin-actions";
import { BUILD_TYPE_LABELS } from "@/lib/plans";
import { cn } from "@/lib/utils";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string }>;
}) {
  const { q = "", plan = "" } = await searchParams;
  const [allClients, devOptions] = await Promise.all([
    getAdminClients(),
    getDeveloperOptions(),
  ]);

  const needle = q.trim().toLowerCase();
  const rows = allClients.filter((c) => {
    if (plan && c.plan !== plan) return false;
    if (!needle) return true;
    return (
      c.companyName.toLowerCase().includes(needle) ||
      (c.email ?? "").toLowerCase().includes(needle)
    );
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          Clients
        </h1>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            className="rounded-[10px] border border-hairline bg-white px-3.5 py-2 text-sm text-ink outline-none focus:border-ink"
          />
          <select
            name="plan"
            defaultValue={plan}
            className="rounded-[10px] border border-hairline bg-white px-3 py-2 text-sm text-ink outline-none"
          >
            <option value="">All plans</option>
            <option value="build">Build</option>
            <option value="maintain">Maintain</option>
            <option value="none">No plan</option>
          </select>
          <button
            type="submit"
            className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white"
          >
            Filter
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-muted-ink">
          No clients match. Clear the filters or wait for your first signup.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Developer</th>
                <th className="px-4 py-3">Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {rows.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="font-medium text-ink underline-offset-2 hover:underline"
                    >
                      {c.companyName}
                    </Link>
                    <div className="text-[12px] text-muted-ink">{c.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 font-mono text-[11px]",
                        c.planStatus === "active"
                          ? "bg-green-tint text-green"
                          : c.planStatus === "past_due"
                            ? "bg-red-50 text-red-600"
                            : "bg-background text-muted-ink"
                      )}
                    >
                      {c.plan} · {c.planStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-ink">
                    {c.buildType ? BUILD_TYPE_LABELS[c.buildType] : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <form action={reassignDeveloper} className="flex items-center gap-1.5">
                      <input type="hidden" name="clientId" value={c.id} />
                      <select
                        name="developerId"
                        defaultValue={c.developerId ?? "none"}
                        className="rounded-lg border border-hairline bg-white px-2 py-1 text-[13px] outline-none"
                      >
                        <option value="none">Unassigned</option>
                        {devOptions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg border border-hairline px-2 py-1 font-mono text-[11px] text-muted-ink hover:border-ink hover:text-ink"
                      >
                        save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px]">
                    {c.stripeCustomerId ? (
                      <a
                        href={`https://dashboard.stripe.com/customers/${c.stripeCustomerId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink underline underline-offset-2"
                      >
                        stripe ↗
                      </a>
                    ) : (
                      <span className="text-muted-ink">no stripe</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
