import Link from "next/link";

export function CTABand() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-19">
      <div className="rounded-[20px] bg-panel px-6 py-14 text-center sm:px-12">
        <h2 className="mb-2.5 font-display text-[clamp(28px,3.4vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em] text-white">
          Your first change, shipped this week.
        </h2>
        <p className="mb-7 text-[17px] text-[#9FAECB]">
          Subscribe today and chat with your developer tomorrow.
        </p>
        <Link
          href="/signup?plan=build"
          className="inline-block rounded-[10px] bg-green px-5 py-3 text-[15px] font-semibold text-[#06271A] transition hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,169,104,0.35)]"
        >
          Start building — $500/mo
        </Link>
      </div>
    </section>
  );
}
