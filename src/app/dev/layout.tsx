import Link from "next/link";
import type { ReactNode } from "react";
import { requireStaff } from "@/lib/dev-guards";
import { signOutAction } from "@/lib/auth-actions";

export default async function DevLayout({ children }: { children: ReactNode }) {
  const staff = await requireStaff();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-hairline bg-background/85 backdrop-blur-[10px]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dev"
              className="flex items-center gap-2 font-display text-lg font-bold tracking-[-0.02em] text-ink"
            >
              <span className="h-2 w-2 rounded-full bg-green" />
              Shipmate
            </Link>
            <span className="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] text-white">
              {staff.role === "admin" ? "admin · dev view" : "developer"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {staff.role === "admin" && (
              <Link
                href="/admin"
                className="text-sm font-medium text-muted-ink transition-colors hover:text-ink"
              >
                Admin
              </Link>
            )}
            <span className="hidden text-sm text-muted-ink sm:inline">{staff.name}</span>
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
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
