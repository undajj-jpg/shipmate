import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-background/85 backdrop-blur-[10px]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-[22px] font-bold tracking-[-0.02em] text-ink"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-green" />
          Shipmate
        </Link>
        <nav className="hidden items-center gap-7 text-[15px] font-medium text-muted-ink md:flex">
          <Link href="/#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </Link>
          <Link href="/#what-we-build" className="transition-colors hover:text-ink">
            What we build
          </Link>
          <Link href="/#pricing" className="transition-colors hover:text-ink">
            Pricing
          </Link>
          <Link href="/#faq" className="transition-colors hover:text-ink">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[15px] font-medium text-muted-ink transition-colors hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup?plan=build"
            className="rounded-[10px] bg-ink px-5 py-2.5 text-[15px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
          >
            Start building
          </Link>
        </div>
      </div>
    </header>
  );
}
