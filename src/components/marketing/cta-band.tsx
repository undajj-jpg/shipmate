import Link from "next/link";

export function CTABand() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-19">
      <div className="relative overflow-hidden rounded-[24px] bg-panel px-6 py-16 text-center sm:px-12">
        {/* Animated color glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="animate-float absolute -left-16 top-0 h-64 w-64 rounded-full bg-green/30 blur-[80px]" />
          <div className="animate-float-slow absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-blue/25 blur-[90px]" />
          <div className="animate-float absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-violet/25 blur-[80px]" />
        </div>
        <div className="relative">
          <h2 className="mb-2.5 font-display text-[clamp(28px,3.6vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em] text-white">
            Your first change, shipped this week.
          </h2>
          <p className="mb-8 text-[17px] text-[#9FAECB]">
            Subscribe today and chat with your developer tomorrow.
          </p>
          <Link
            href="/signup?plan=build"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-[12px] bg-green px-7 py-3.5 text-[15px] font-semibold text-[#06271A] shadow-[0_10px_30px_-8px_rgba(15,169,104,0.6)] transition hover:-translate-y-0.5"
          >
            <span className="relative z-10">Start building — $500/mo</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
