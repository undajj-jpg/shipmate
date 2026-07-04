import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { session_id: sessionId } = await searchParams;
  if (!sessionId) {
    redirect("/app");
  }

  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  const paid = checkout.payment_status === "paid";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-white p-8 text-center">
        {paid ? (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-tint">
              <span className="text-xl font-semibold text-green">✓</span>
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
              You&apos;re subscribed.
            </h1>
            <p className="mt-2 text-[15px] text-muted-ink">
              Your developer is being assigned now. Head into your portal to say hello and
              queue your first request.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
              Payment processing…
            </h1>
            <p className="mt-2 text-[15px] text-muted-ink">
              Stripe is still confirming your payment. Your plan activates automatically
              the moment it clears — check back in a minute.
            </p>
          </>
        )}
        <Link
          href="/app"
          className="mt-6 inline-block w-full rounded-[10px] bg-ink px-5 py-3 text-[15px] font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
        >
          Open your portal
        </Link>
      </div>
    </div>
  );
}
