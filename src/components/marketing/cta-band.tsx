import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTABand() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-hairline bg-panel px-8 py-16 text-center">
        <h2 className="max-w-xl font-display text-3xl font-semibold text-panel-foreground sm:text-4xl">
          Stop waiting on agencies. Start shipping today.
        </h2>
        <p className="max-w-md text-panel-foreground/70">
          Your developer is ready. Onboarding takes five minutes.
        </p>
        <Button asChild size="lg" className="bg-green text-white hover:bg-green/90">
          <Link href="/signup?plan=build">Get started</Link>
        </Button>
      </div>
    </section>
  );
}
