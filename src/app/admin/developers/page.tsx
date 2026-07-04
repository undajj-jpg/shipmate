import { getDevelopers } from "@/lib/admin-data";

export default async function AdminDevelopersPage() {
  const devs = await getDevelopers();

  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        Developers
      </h1>
      {devs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline px-4 py-8 text-center text-sm text-muted-ink">
          No developers yet. Create a user and set their role to
          <span className="font-mono"> developer</span>.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-hairline bg-white">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-hairline text-left font-mono text-[11px] uppercase tracking-[0.06em] text-muted-ink">
                <th className="px-4 py-3">Developer</th>
                <th className="px-4 py-3">Clients</th>
                <th className="px-4 py-3">Open requests</th>
                <th className="px-4 py-3">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {devs.map((d) => {
                const loaded = d.clientCount >= 6 || d.openRequests >= 10;
                return (
                  <tr key={d.id}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{d.name ?? "—"}</span>
                      <div className="text-[12px] text-muted-ink">{d.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono">{d.clientCount}</td>
                    <td className="px-4 py-3 font-mono">{d.openRequests}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          loaded
                            ? "rounded-md bg-red-50 px-1.5 py-0.5 font-mono text-[11px] text-red-600"
                            : "rounded-md bg-green-tint px-1.5 py-0.5 font-mono text-[11px] text-green"
                        }
                      >
                        {loaded ? "at capacity" : "has room"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
