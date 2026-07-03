import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          Shipmate
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-ink md:flex">
          <Link href="/#how-it-works" className="hover:text-ink transition-colors">
            How it works
          </Link>
          <Link href="/#what-we-build" className="hover:text-ink transition-colors">
            What we build
          </Link>
          <Link href="/#pricing" className="hover:text-ink transition-colors">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-ink transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-ink hover:text-muted-ink">
            Log in
          </Link>
          <Button asChild size="sm" className="bg-green text-white hover:bg-green/90">
            <Link href="/signup?plan=build">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
