import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { getClientContext } from "@/lib/guards";
import { BUILD_TYPE_LABELS } from "@/lib/plans";
import { updateCompanyName } from "@/lib/settings-actions";
import { signOutAction } from "@/lib/auth-actions";

export default async function SettingsPage() {
  const { userId, client } = await getClientContext();

  const [user, project] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.projects.findFirst({ where: eq(projects.clientId, client.id) }),
  ]);

  const developer = client.assignedDeveloperId
    ? await db.query.users.findFirst({ where: eq(users.id, client.assignedDeveloperId) })
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
        Settings
      </h1>

      <div className="rounded-2xl border border-hairline bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Company</h2>
        <form action={updateCompanyName} className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
              Company name
            </label>
            <input
              name="companyName"
              defaultValue={client.companyName}
              required
              maxLength={200}
              className="w-full rounded-[10px] border border-hairline bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
            />
          </div>
          <button
            type="submit"
            className="rounded-[10px] bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
          >
            Save
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-hairline bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Account</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-ink">Name</dt>
            <dd className="text-ink">{user?.name || "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-ink">Email</dt>
            <dd className="text-ink">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-ink">Project</dt>
            <dd className="text-ink">
              {project ? `${project.name} · ${BUILD_TYPE_LABELS[project.buildType]}` : "—"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-ink">Your developer</dt>
            <dd className="text-ink">{developer?.name ?? "Being assigned…"}</dd>
          </div>
        </dl>
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          className="rounded-[10px] border-[1.5px] border-hairline px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
