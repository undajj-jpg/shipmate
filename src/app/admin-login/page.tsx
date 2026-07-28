import { notFound } from "next/navigation";
import { env } from "@/env";

export const metadata = { title: "Admin login — Shipmate" };

/** Bootstrap admin login. Disappears entirely once ADMIN_PASSWORD is unset. */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!env.ADMIN_PASSWORD) {
    notFound();
  }
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-white p-8">
        <div className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-ink">
          <span className="h-2 w-2 rounded-full bg-green" />
          Shipmate
        </div>
        <h1 className="mb-5 text-sm text-muted-ink">Admin access</h1>
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            Wrong email or password.
          </p>
        )}
        <form method="POST" action="/api/admin-login" className="space-y-3">
          <input
            name="email"
            type="email"
            required
            placeholder="admin email"
            className="w-full rounded-[10px] border border-hairline bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="password"
            className="w-full rounded-[10px] border border-hairline bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
          />
          <button
            type="submit"
            className="w-full rounded-[10px] bg-ink px-5 py-3 text-[15px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
