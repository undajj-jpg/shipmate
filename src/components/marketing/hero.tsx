import Link from "next/link";
import { HeroFeed } from "@/components/marketing/hero-feed";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-18 pt-14 md:grid-cols-[1.05fr_0.95fr] md:pt-22">
      <div>
        <div className="mb-4 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-green">
          Development, on subscription
        </div>
        <h1 className="mb-5 font-display text-[clamp(38px,5vw,58px)] font-bold leading-[1.06] tracking-[-0.03em] text-ink">
          A senior developer + AI.{" "}
          <span className="[box-shadow:inset_0_-0.28em_var(--green-tint)]">
            One flat rate.
          </span>
        </h1>
        <p className="mb-8 max-w-[46ch] text-lg text-muted-ink sm:text-[19px]">
          Your own dedicated developer, supercharged with AI, building your site, SaaS, or
          automation — and shipping changes the same day you ask for them. Chat. Ship.
          Repeat.
        </p>
        <div className="flex flex-wrap items-center gap-3.5">
          <Link
            href="/signup?plan=build"
            className="rounded-[10px] bg-ink px-5 py-3 text-[15px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
          >
            Start building — $500/mo
          </Link>
          <Link
            href="/#how-it-works"
            className="rounded-[10px] border-[1.5px] border-hairline px-5 py-3 text-[15px] font-semibold text-ink transition hover:border-ink"
          >
            See how it works
          </Link>
        </div>
        <p className="mt-4.5 font-mono text-sm text-muted-ink">
          No contracts · Switch plans anytime · First change shipped in 48h
        </p>
      </div>
      <HeroFeed />
    </section>
  );
}
