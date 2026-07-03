import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-ink sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display text-ink">Shipmate</span>
        <nav className="flex flex-wrap gap-6">
          <Link href="/#pricing" className="hover:text-ink transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-ink transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-ink transition-colors">
            Sign up
          </Link>
        </nav>
        <span>&copy; {new Date().getFullYear()} Shipmate. All rights reserved.</span>
      </div>
    </footer>
  );
}
