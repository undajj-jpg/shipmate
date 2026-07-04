import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import Link from "next/link";
import { startCheckout } from "@/lib/billing-actions";
import { PLAN_DETAILS, type PaidPlan } from "@/lib/stripe";
import { COST_POLICY_LABEL } from "@/lib/legal";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; canceled?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.userId, session.user.id),
  });
  if (!client) {
    redirect("/onboarding");
  }
  if (client.planStatus === "active") {
    redirect("/app");
  }

  const params = await searchParams;
  const plan: PaidPlan = params.plan === "maintain" ? "maintain" : "build";
  const details = PLAN_DETAILS[plan];
  const other: PaidPlan = plan === "build" ? "maintain" : "build";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        {params.canceled && (
          <p className="mb-4 rounded-xl border border-hairline bg-white px-4 py-3 text-sm text-muted-ink">
            Checkout canceled — no charge was made. Pick up where you left off below.
          </p>
        )}
        <div className="rounded-2xl border border-hairline bg-white p-8">
          <div className="mb-1 font-mono text-[13px] uppercase tracking-[0.08em] text-muted-ink">
            {details.name} plan
          </div>
          <div className="font-display text-4xl font-bold tracking-[-0.03em] text-ink">
            {details.amountLabel.split("/")[0]}
            <span className="font-body text-base font-medium text-muted-ink"> /month</span>
          </div>
          <p className="mb-4 mt-3 text-[15px] text-muted-ink">{details.description}</p>

          <p className="mb-5 rounded-lg bg-background px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed text-muted-ink">
            + hosting &amp; AI usage, billed at cost (typically $5–50/mo). Itemized on
            every invoice, no markup.
          </p>

          {params.error === "cost-policy" && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              Please confirm the infrastructure-costs policy below to continue.
            </p>
          )}

          <form action={startCheckout}>
            <input type="hidden" name="plan" value={plan} />
            <label className="mb-5 flex cursor-pointer items-start gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                name="costPolicy"
                required
                className="mt-1 h-4 w-4 shrink-0 accent-[#10182B]"
              />
              <span>
                {COST_POLICY_LABEL}{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-medium underline underline-offset-2"
                >
                  Terms
                </Link>
              </span>
            </label>
            <button
              type="submit"
              className="w-full rounded-[10px] bg-ink px-5 py-3 text-[15px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
            >
              Continue to payment — {details.amountLabel}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-ink">
            Cancel or switch plans anytime.{" "}
            <a
              href={`/checkout?plan=${other}`}
              className="font-medium text-ink underline underline-offset-2"
            >
              Choose {PLAN_DETAILS[other].name} instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
