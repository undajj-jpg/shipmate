import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { startCheckout } from "@/lib/billing-actions";
import { getClientBuildType } from "@/lib/client-plan";
import {
  PLAN_COPY,
  BUILD_TYPE_LABELS,
  planPriceLabel,
  money,
  planPriceCents,
  type PaidPlan,
} from "@/lib/plans";
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
  const buildType = await getClientBuildType(client.id);
  const copy = PLAN_COPY[plan];
  const other: PaidPlan = plan === "build" ? "maintain" : "build";
  const priceLabel = planPriceLabel(plan, buildType);

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
            {copy.name} plan
            {plan === "maintain" && ` · ${BUILD_TYPE_LABELS[buildType]}`}
          </div>
          <div className="font-display text-4xl font-bold tracking-[-0.03em] text-ink">
            {money(planPriceCents(plan, buildType))}
            <span className="font-body text-base font-medium text-muted-ink"> /month</span>
          </div>
          <p className="mb-4 mt-3 text-[15px] text-muted-ink">
            {copy.description}
            {plan === "maintain" &&
              ` Your rate reflects maintaining a ${BUILD_TYPE_LABELS[buildType].toLowerCase()}.`}
          </p>

          <p className="mb-5 rounded-lg bg-background px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed text-muted-ink">
            Setup of hosting &amp; infrastructure is included — your product runs from
            day one. Provider usage costs (hosting beyond Vercel&apos;s free tier, AI
            usage) are passed through at cost: often $0 to start, typically $5–50/mo as
            you grow. Itemized on every invoice, no markup.
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
              Continue to payment — {priceLabel}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-ink">
            Cancel or switch plans anytime.{" "}
            <a
              href={`/checkout?plan=${other}`}
              className="font-medium text-ink underline underline-offset-2"
            >
              Choose {PLAN_COPY[other].name} instead ({planPriceLabel(other, buildType)})
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
