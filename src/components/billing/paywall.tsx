import Link from "next/link";
import { openBillingPortal } from "@/lib/billing-actions";
import {
  PLAN_COPY,
  BUILD_TYPE_LABELS,
  money,
  planPriceCents,
  type BuildType,
  type PaidPlan,
} from "@/lib/plans";
import type { Client } from "@/db/schema";
import { cn } from "@/lib/utils";

const PLAN_FEATURES: Record<PaidPlan, string[]> = {
  build: [
    "Unlimited requests, one at a time",
    "Direct chat with your developer",
    "Deploys to production on Vercel",
  ],
  maintain: [
    "Hosting, monitoring & uptime",
    "Security patches & updates",
    "Bug fixes included",
  ],
};

export function Paywall({ client, buildType }: { client: Client; buildType: BuildType }) {
  const pastDue = client.planStatus === "past_due";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-ink">
            {pastDue ? "Your payment needs attention" : "Pick a plan to enter your portal"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-muted-ink">
            {pastDue
              ? "Your last payment failed, so your portal is paused. Update your card and you're back in seconds — your project and chat history are safe."
              : "Your workspace is ready. Subscribe to unlock chat with your developer, the request queue, and production deploys."}
          </p>
        </div>

        {pastDue ? (
          <div className="mx-auto max-w-sm">
            <form action={openBillingPortal}>
              <button
                type="submit"
                className="w-full rounded-[10px] bg-ink px-5 py-3 text-[15px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
              >
                Update payment method
              </button>
            </form>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {(["build", "maintain"] as PaidPlan[]).map((plan) => {
              const copy = PLAN_COPY[plan];
              const featured = plan === "build";
              return (
                <div
                  key={plan}
                  className={cn(
                    "flex flex-col rounded-2xl bg-white p-6",
                    featured
                      ? "border-[1.5px] border-ink shadow-[0_20px_50px_-28px_rgba(16,24,43,0.3)]"
                      : "border border-hairline"
                  )}
                >
                  <div className="mb-2 font-mono text-[13px] uppercase tracking-[0.08em] text-muted-ink">
                    {copy.name}
                  </div>
                  <div className="mb-1 font-display text-3xl font-bold tracking-[-0.03em] text-ink">
                    {money(planPriceCents(plan, buildType))}
                    <span className="font-body text-sm font-medium text-muted-ink">
                      {" "}
                      /month
                    </span>
                  </div>
                  {plan === "maintain" && (
                    <p className="mb-3 font-mono text-[11.5px] text-muted-ink">
                      rate for a {BUILD_TYPE_LABELS[buildType].toLowerCase()}
                    </p>
                  )}
                  <ul className="mb-6 mt-2 flex-1 space-y-2 text-sm text-ink">
                    {PLAN_FEATURES[plan].map((f) => (
                      <li key={f} className="flex items-baseline gap-2">
                        <span className="font-semibold text-green">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/checkout?plan=${plan}`}
                    className={cn(
                      "w-full rounded-[10px] px-5 py-2.5 text-center text-[15px] font-semibold transition hover:-translate-y-px",
                      featured
                        ? "bg-ink text-white hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
                        : "border-[1.5px] border-hairline text-ink hover:border-ink"
                    )}
                  >
                    Choose {copy.name}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
