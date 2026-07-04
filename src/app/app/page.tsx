import Link from "next/link";
import { getClientContext, hasActivePlan } from "@/lib/guards";
import { Paywall } from "@/components/billing/paywall";
import { PLAN_DETAILS } from "@/lib/stripe";

// Full client portal (chat, requests, project) is built in Phase 3.
export default async function AppPage() {
  const { userName, client } = await getClientContext();

  if (!hasActivePlan(client)) {
    return <Paywall client={client} />;
  }

  const plan = client.plan === "maintain" ? PLAN_DETAILS.maintain : PLAN_DETAILS.build;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-white p-8 text-center">
        <div className="mx-auto mb-3 inline-block rounded-md bg-green-tint px-2.5 py-1 font-mono text-xs text-green">
          {plan.name} · active
        </div>
        <h1 className="font-display text-xl font-semibold text-ink">
          You&apos;re in, {userName?.split(" ")[0] ?? "there"}.
        </h1>
        <p className="mt-2 text-sm text-muted-ink">
          The full portal (chat, requests, project) arrives in the next phase.
        </p>
        <Link
          href="/app/billing"
          className="mt-5 inline-block text-sm font-medium text-ink underline underline-offset-2"
        >
          Manage billing
        </Link>
      </div>
    </div>
  );
}
