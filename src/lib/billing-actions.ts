"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type Stripe from "stripe";
import { auth } from "@/auth";
import { db } from "@/db";
import { clients, type Client } from "@/db/schema";
import { stripe, priceIdForPlan, type PaidPlan } from "@/lib/stripe";
import { getClientBuildType } from "@/lib/client-plan";
import { TERMS_VERSION } from "@/lib/legal";
import { env } from "@/env";

function appUrl(path: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}${path}`;
}

async function requireClient(): Promise<{ userId: string; client: Client }> {
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
  return { userId: session.user.id, client };
}

async function getOrCreateStripeCustomer(client: Client, email: string | null | undefined) {
  if (client.stripeCustomerId) {
    return client.stripeCustomerId;
  }
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: client.companyName,
    metadata: { clientId: client.id },
  });
  await db
    .update(clients)
    .set({ stripeCustomerId: customer.id })
    .where(eq(clients.id, client.id));
  return customer.id;
}

const planSchema = z.enum(["build", "maintain"]);

export async function startCheckout(formData: FormData) {
  const plan: PaidPlan = planSchema.parse(formData.get("plan"));
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?redirectTo=${encodeURIComponent(`/checkout?plan=${plan}`)}`);
  }

  // Checkout must not proceed without explicit acceptance of the
  // variable-infra-costs policy (checkbox on the checkout screen).
  if (formData.get("costPolicy") !== "on") {
    redirect(`/checkout?plan=${plan}&error=cost-policy`);
  }

  const { client } = await requireClient();

  if (client.planStatus === "active") {
    redirect("/app");
  }

  const now = new Date();
  await db
    .update(clients)
    .set({
      termsAcceptedAt: now,
      termsVersion: TERMS_VERSION,
      costPolicyAcceptedAt: now,
    })
    .where(eq(clients.id, client.id));

  const customerId = await getOrCreateStripeCustomer(client, session.user.email);
  const buildType = await getClientBuildType(client.id);

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdForPlan(plan, buildType), quantity: 1 }],
    success_url: appUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
    cancel_url: appUrl(`/checkout?plan=${plan}&canceled=1`),
    client_reference_id: client.id,
    metadata: { clientId: client.id, plan },
    subscription_data: { metadata: { clientId: client.id } },
    allow_promotion_codes: true,
  });

  if (!checkout.url) {
    throw new Error("Stripe did not return a checkout URL");
  }
  redirect(checkout.url);
}

/**
 * Switches an active subscription between Build and Maintain in place,
 * with proration. The webhook (customer.subscription.updated) is the source
 * of truth, but we optimistically update the local row so the UI reflects
 * the switch immediately.
 */
export async function switchPlan() {
  const { client } = await requireClient();

  if (!client.stripeSubscriptionId || client.planStatus !== "active") {
    redirect(`/checkout?plan=${client.plan === "maintain" ? "build" : "maintain"}`);
  }

  const targetPlan: PaidPlan = client.plan === "build" ? "maintain" : "build";
  const buildType = await getClientBuildType(client.id);

  const subscription = await stripe.subscriptions.retrieve(client.stripeSubscriptionId);
  const currentItem: Stripe.SubscriptionItem | undefined = subscription.items.data[0];
  if (!currentItem) {
    throw new Error(`Subscription ${subscription.id} has no items`);
  }

  await stripe.subscriptions.update(subscription.id, {
    items: [{ id: currentItem.id, price: priceIdForPlan(targetPlan, buildType) }],
    proration_behavior: "create_prorations",
  });

  await db.update(clients).set({ plan: targetPlan }).where(eq(clients.id, client.id));

  revalidatePath("/app/billing");
  revalidatePath("/app");
}

export async function openBillingPortal() {
  const { client } = await requireClient();
  if (!client.stripeCustomerId) {
    redirect("/checkout?plan=build");
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: client.stripeCustomerId,
    return_url: appUrl("/app/billing"),
  });

  redirect(portal.url);
}
