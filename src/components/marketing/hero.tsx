import Link from "next/link";
import { HeroFeed } from "@/components/marketing/hero-feed";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated color field */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float absolute -left-24 -top-24 h-96 w-96 rounded-full bg-green/25 blur-[90px]" />
        <div className="animate-float-slow absolute right-0 top-10 h-[26rem] w-[26rem] rounded-full bg-blue/20 blur-[100px]" />
        <div className="animate-float absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-violet/20 blur-[90px]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pt-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-hairline bg-white/70 px-3.5 py-1.5 font-mono text-[12px] font-medium text-ink shadow-sm backdrop-blur">
            <span className="animate-ship-pulse inline-block h-2 w-2 rounded-full bg-green" />
            Development, on subscription
          </div>
          <h1 className="mb-5 font-display text-[clamp(38px,5.4vw,60px)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
            A senior developer + AI.
            <br />
            <span className="text-gradient animate-gradient">One flat rate.</span>
          </h1>
          <p className="mb-8 max-w-[46ch] text-lg text-muted-ink sm:text-[19px]">
            Your own dedicated developer, supercharged with AI, building your site, SaaS, or
            automation — and shipping changes the same day you ask for them. Chat. Ship.
            Repeat.
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/signup?plan=build"
              className="group relative overflow-hidden rounded-[12px] bg-ink px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(16,24,43,0.5)] transition hover:-translate-y-0.5"
            >
              <span className="relative z-10">Start building — $1,499/mo</span>
              <span className="absolute inset-0 -z-0 bg-gradient-to-r from-green via-blue to-violet opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              href="/#how-it-works"
              className="rounded-[12px] border-[1.5px] border-hairline bg-white/60 px-6 py-3.5 text-[15px] font-semibold text-ink backdrop-blur transition hover:border-ink"
            >
              See how it works
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12.5px] text-muted-ink">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> No contracts
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue" /> Switch plans anytime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet" /> First change in 48h
            </span>
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-green/30 via-blue/20 to-violet/30 opacity-70 blur-2xl"
          />
          <HeroFeed />
        </div>
      </div>
    </section>
  );
}
