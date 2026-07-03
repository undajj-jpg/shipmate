import Link from "next/link";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "build",
    name: "Build",
    price: "$500",
    description: "Active development. Your dedicated developer + AI, shipping continuously.",
    features: [
      "Unlimited requests, one at a time",
      "Direct chat with your developer",
      "Average 48-hour turnaround",
      "Deploys to production on Vercel",
      "You own 100% of the code",
      "Switch or cancel anytime",
    ],
    cta: "Start building",
    featured: true,
  },
  {
    id: "maintain",
    name: "Maintain",
    price: "$100",
    description: "Done building? Keep your product fast, secure, and online.",
    features: [
      "Hosting, monitoring & uptime",
      "Security patches & updates",
      "Bug fixes included",
      "Priority re-activation to Build",
      "Monthly health report",
    ],
    cta: "Choose Maintain",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-19">
      <div className="mb-11 max-w-[60ch]">
        <h2 className="mb-3 font-display text-[clamp(28px,3.4vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
          Two plans. Zero surprises.
        </h2>
        <p className="text-lg text-muted-ink">
          Build while you&apos;re growing, maintain when you&apos;re done. Switch between
          them anytime.
        </p>
      </div>
      <div className="grid max-w-[880px] gap-5.5 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-2xl bg-white p-8",
              plan.featured
                ? "border-[1.5px] border-ink shadow-[0_20px_50px_-28px_rgba(16,24,43,0.3)]"
                : "border border-hairline"
            )}
          >
            <div className="mb-3.5 font-mono text-[13px] uppercase tracking-[0.08em] text-muted-ink">
              {plan.name}
            </div>
            <div className="font-display text-[44px] font-bold leading-none tracking-[-0.03em] text-ink">
              {plan.price}
              <span className="font-body text-base font-medium text-muted-ink"> /month</span>
            </div>
            <p className="mb-5.5 mt-3 text-[15.5px] text-muted-ink">{plan.description}</p>
            <ul className="mb-7 flex-1">
              {plan.features.map((f, i) => (
                <li
                  key={f}
                  className={cn(
                    "flex items-baseline gap-2.5 py-2 text-[15px] text-ink",
                    i < plan.features.length - 1 && "border-b border-hairline"
                  )}
                >
                  <span className="font-semibold text-green">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={`/signup?plan=${plan.id}`}
              className={cn(
                "rounded-[10px] px-5 py-3 text-center text-[15px] font-semibold transition hover:-translate-y-px",
                plan.featured
                  ? "bg-ink text-white hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
                  : "border-[1.5px] border-hairline text-ink hover:border-ink"
              )}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
