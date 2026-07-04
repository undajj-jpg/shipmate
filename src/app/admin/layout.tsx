import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/auth";
import { signOutAction } from "@/lib/auth-actions";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?redirectTo=/admin");
  if (session.user.role !== "admin") redirect("/app");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-[10px]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-display text-lg font-bold tracking-[-0.02em] text-ink"
            >
              <span className="h-2 w-2 rounded-full bg-green" />
              Shipmate
            </Link>
            <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] text-white">
              admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dev"
              className="text-sm font-medium text-muted-ink transition-colors hover:text-ink"
            >
              Dev view
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-muted-ink transition-colors hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:gap-8 md:py-8">
        <aside className="md:w-44 md:shrink-0">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
