import { eq, inArray } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import { clients, passthroughCharges, subscriptionEvents, type Client } from "@/db/schema";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { env } from "@/env";

export const runtime = "nodejs";

type PlanStatus = Client["planStatus"];

function mapSubscriptionStatus(status: Stripe.Subscription.Status): PlanStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "past_due";
    case "paused":
      return "paused";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
  }
}

function customerIdOf(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null {
  if (!customer) return null;
  return typeof customer === "string" ? customer : customer.id;
}

async function findClient({
  clientId,
  stripeCustomerId,
}: {
  clientId?: string | null;
  stripeCustomerId?: string | null;
}): Promise<Client | null> {
  if (clientId) {
    const byId = await db.query.clients.findFirst({ where: eq(clients.id, clientId) });
    if (byId) return byId;
  }
  if (stripeCustomerId) {
    const byCustomer = await db.query.clients.findFirst({
      where: eq(clients.stripeCustomerId, stripeCustomerId),
    });
    if (byCustomer) return byCustomer;
  }
  return null;
}

/**
 * Records the event in the audit log. Returns false when this event ID was
 * already recorded (i.e. a retry), in which case processing must be skipped.
 */
async function recordEventOnce(clientId: string, event: Stripe.Event): Promise<boolean> {
  const inserted = await db
    .insert(subscriptionEvents)
    .values({
      clientId,
      stripeEventId: event.id,
      type: event.type,
      payload: event.data.object,
    })
    .onConflictDoNothing()
    .returning({ id: subscriptionEvents.id });
  return inserted.length > 0;
}

async function handleCheckoutCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const client = await findClient({
    clientId: session.client_reference_id ?? session.metadata?.clientId,
    stripeCustomerId: customerIdOf(session.customer),
  });
  if (!client) return;
  if (!(await recordEventOnce(client.id, event))) return;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  let plan = session.metadata?.plan === "maintain" ? ("maintain" as const) : ("build" as const);
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    plan = (priceId && planFromPriceId(priceId)) || plan;
  }

  await db
    .update(clients)
    .set({
      stripeCustomerId: customerIdOf(session.customer) ?? client.stripeCustomerId,
      stripeSubscriptionId: subscriptionId,
      plan,
      planStatus: "active",
    })
    .where(eq(clients.id, client.id));
}

async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const client = await findClient({
    clientId: subscription.metadata?.clientId,
    stripeCustomerId: customerIdOf(subscription.customer),
  });
  if (!client) return;
  if (!(await recordEventOnce(client.id, event))) return;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = priceId ? planFromPriceId(priceId) : null;

  await db
    .update(clients)
    .set({
      stripeSubscriptionId: subscription.id,
      planStatus: mapSubscriptionStatus(subscription.status),
      ...(plan ? { plan } : {}),
    })
    .where(eq(clients.id, client.id));
}

async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const client = await findClient({
    clientId: subscription.metadata?.clientId,
    stripeCustomerId: customerIdOf(subscription.customer),
  });
  if (!client) return;
  if (!(await recordEventOnce(client.id, event))) return;

  await db
    .update(clients)
    .set({ plan: "none", planStatus: "canceled", stripeSubscriptionId: null })
    .where(eq(clients.id, client.id));
}

/** Marks pass-through infra charges as paid once their invoice settles. */
async function handleInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const client = await findClient({
    stripeCustomerId: customerIdOf(invoice.customer),
  });
  if (!client) return;
  if (!(await recordEventOnce(client.id, event))) return;

  // Recovering from past_due: a paid invoice means the subscription is healthy.
  if (client.planStatus === "past_due") {
    await db
      .update(clients)
      .set({ planStatus: "active" })
      .where(eq(clients.id, client.id));
  }

  const invoiceItemIds = invoice.lines.data
    .map((line) => {
      const details = line.parent?.invoice_item_details;
      return details?.invoice_item ?? null;
    })
    .filter((id): id is string => id !== null);

  if (invoiceItemIds.length > 0) {
    await db
      .update(passthroughCharges)
      .set({ status: "paid" })
      .where(inArray(passthroughCharges.stripeInvoiceItemId, invoiceItemIds));
  }
}

async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const client = await findClient({
    stripeCustomerId: customerIdOf(invoice.customer),
  });
  if (!client) return;
  if (!(await recordEventOnce(client.id, event))) return;

  await db
    .update(clients)
    .set({ planStatus: "past_due" })
    .where(eq(clients.id, client.id));
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;
    case "invoice.payment_failed":
      await handlePaymentFailed(event);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event);
      break;
    default:
      break;
  }

  return Response.json({ received: true });
}
