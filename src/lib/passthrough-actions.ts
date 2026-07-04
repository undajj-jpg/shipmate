"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { clients, passthroughCharges } from "@/db/schema";
import { stripe } from "@/lib/stripe";

async function requireStaff(): Promise<{ userId: string; role: "developer" | "admin" }> {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "admin" && role !== "developer")) {
    throw new Error("Not authorized");
  }
  return { userId: session.user.id, role };
}

const chargeSchema = z.object({
  clientId: z.string().uuid(),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "period must be YYYY-MM"),
  category: z.enum(["hosting", "ai_usage", "domain", "database", "email", "other"]),
  description: z.string().min(1).max(500),
  amountCents: z.coerce.number().int().positive().max(5_000_000),
});

const CATEGORY_LABELS: Record<z.infer<typeof chargeSchema>["category"], string> = {
  hosting: "Hosting",
  ai_usage: "AI usage",
  domain: "Domain",
  database: "Database",
  email: "Email",
  other: "Infrastructure",
};

export async function addPassthroughCharge(input: z.infer<typeof chargeSchema>) {
  const { userId } = await requireStaff();
  const parsed = chargeSchema.parse(input);

  await db.insert(passthroughCharges).values({
    clientId: parsed.clientId,
    period: parsed.period,
    category: parsed.category,
    description: parsed.description,
    amountCents: parsed.amountCents,
    createdBy: userId,
  });
}

/**
 * Pushes all pending charges for a client+period onto the client's next
 * Stripe invoice as invoice items. Idempotent per charge: a charge that
 * already has a stripeInvoiceItemId is never sent twice (the WHERE clause
 * only selects rows with stripe_invoice_item_id IS NULL, and each charge id
 * is stamped into the invoice item's metadata).
 */
export async function sendChargesToInvoice(clientId: string, period: string) {
  await requireStaff();

  const client = await db.query.clients.findFirst({ where: eq(clients.id, clientId) });
  if (!client?.stripeCustomerId) {
    throw new Error("Client has no Stripe customer — they must complete checkout first");
  }

  const pending = await db.query.passthroughCharges.findMany({
    where: and(
      eq(passthroughCharges.clientId, clientId),
      eq(passthroughCharges.period, period),
      eq(passthroughCharges.status, "pending"),
      isNull(passthroughCharges.stripeInvoiceItemId)
    ),
  });

  for (const charge of pending) {
    const item = await stripe.invoiceItems.create({
      customer: client.stripeCustomerId,
      amount: charge.amountCents,
      currency: charge.currency,
      description: `${CATEGORY_LABELS[charge.category]} — ${charge.description} (${charge.period}, at cost)`,
      metadata: { passthroughChargeId: charge.id, period: charge.period },
    });

    await db
      .update(passthroughCharges)
      .set({ stripeInvoiceItemId: item.id, status: "invoiced" })
      .where(eq(passthroughCharges.id, charge.id));
  }

  return pending.length;
}
