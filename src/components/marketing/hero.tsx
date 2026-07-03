import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroFeed } from "@/components/marketing/hero-feed";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 pt-16 pb-20 md:grid-cols-2 md:items-center md:pt-24 md:pb-28">
      <div className="flex flex-col gap-6">
        <span className="w-fit rounded-full border border-hairline bg-white px-3 py-1 text-xs font-medium text-muted-ink">
          A developer, on subscription
        </span>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          Your product,
          <br />
          always shipping.
        </h1>
        <p className="max-w-md text-lg text-muted-ink">
          Subscribe to a dedicated developer working with AI. Chat your changes, watch them
          deploy to production — no tickets, no agencies, no waiting rooms.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="bg-green text-white hover:bg-green/90">
            <Link href="/signup?plan=build">Start building — $500/mo</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-hairline">
            <Link href="/signup?plan=maintain">Just maintain — $100/mo</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-ink">Cancel or switch plans anytime.</p>
      </div>
      <HeroFeed />
    </section>
  );
}
