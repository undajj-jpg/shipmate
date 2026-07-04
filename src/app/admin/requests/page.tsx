import Link from "next/link";
import { getActiveRequests } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export default async function AdminRequestsPage() {
  const rows = await getActiveRequests();

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        Active requests
      </h1>
      <p className="mb-5 text-sm text-muted-ink">
        Everything in flight across the company. Amber after 72h, red after 7 days.
      </p>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-muted-ink">
          Nothing in flight right now.
        </p>
      ) : (
        <ul className="divide-y divide-hairline rounded-2xl border border-hairline bg-white">
          {rows.map((r) => {
            const days = Math.floor(r.ageHours / 24);
            const aging =
              r.ageHours >= 24 * 7
                ? "border-l-red-500 bg-red-50/40"
                : r.ageHours >= 72
                  ? "border-l-amber bg-amber-tint/40"
                  : "border-l-transparent";
            return (
              <li
                key={r.id}
                className={cn("flex items-center gap-3 border-l-4 px-4 py-3", aging)}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-ink">{r.title}</span>
                  <div className="text-[12px] text-muted-ink">
                    <Link
                      href={`/admin/clients/${r.clientId}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {r.companyName}
                    </Link>{" "}
                    · {r.status}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[12px]",
                    r.ageHours >= 24 * 7
                      ? "text-red-600"
                      : r.ageHours >= 72
                        ? "text-amber"
                        : "text-muted-ink"
                  )}
                >
                  {days > 0 ? `${days}d ${r.ageHours % 24}h` : `${r.ageHours}h`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
