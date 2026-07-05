/**
 * Creates the two Shipmate subscription products/prices in Stripe.
 *
 * Usage:
 *   npm run stripe:seed
 *
 * Idempotent: products are looked up by their metadata key before creating,
 * so re-running never duplicates them. Prints the price IDs to put in env
 * (STRIPE_PRICE_BUILD / STRIPE_PRICE_MAINTAIN).
 */
import Stripe from "stripe";
import { z } from "zod";

const key = z
  .string()
  .min(1, "STRIPE_SECRET_KEY is required (set it in .env.local)")
  .parse(process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(key, { typescript: true });

const MAINTAIN_DESCRIPTION =
  "Keep a finished product healthy: hosting and monitoring, security patches, and bug fixes. No new features. Priced by product type.";

const PLANS = [
  {
    lookupKey: "shipmate_build",
    name: "Shipmate Build",
    description:
      "Active development: a dedicated developer + AI, unlimited requests (one active at a time), direct chat, production deploys on Vercel.",
    unitAmount: 149900,
    envVar: "STRIPE_PRICE_BUILD",
  },
  {
    lookupKey: "shipmate_maintain_landing",
    name: "Shipmate Maintain — Landing page",
    description: MAINTAIN_DESCRIPTION,
    unitAmount: 4900,
    envVar: "STRIPE_PRICE_MAINTAIN_LANDING",
  },
  {
    lookupKey: "shipmate_maintain_site",
    name: "Shipmate Maintain — Website",
    description: MAINTAIN_DESCRIPTION,
    unitAmount: 6900,
    envVar: "STRIPE_PRICE_MAINTAIN_SITE",
  },
  {
    lookupKey: "shipmate_maintain_automation",
    name: "Shipmate Maintain — Automation",
    description: MAINTAIN_DESCRIPTION,
    unitAmount: 9900,
    envVar: "STRIPE_PRICE_MAINTAIN_AUTOMATION",
  },
  {
    lookupKey: "shipmate_maintain_saas",
    name: "Shipmate Maintain — SaaS app",
    description: MAINTAIN_DESCRIPTION,
    unitAmount: 39900,
    envVar: "STRIPE_PRICE_MAINTAIN_SAAS",
  },
] as const;

async function findExistingPrice(lookupKey: string): Promise<Stripe.Price | null> {
  const prices = await stripe.prices.list({
    lookup_keys: [lookupKey],
    expand: ["data.product"],
    limit: 1,
  });
  return prices.data[0] ?? null;
}

async function main() {
  const lines: string[] = [];

  for (const plan of PLANS) {
    const existing = await findExistingPrice(plan.lookupKey);
    if (existing) {
      console.log(`✓ ${plan.name}: price already exists (${existing.id})`);
      lines.push(`${plan.envVar}=${existing.id}`);
      continue;
    }

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { shipmate_plan: plan.lookupKey },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: plan.unitAmount,
      recurring: { interval: "month" },
      lookup_key: plan.lookupKey,
      metadata: { shipmate_plan: plan.lookupKey },
    });

    console.log(`✓ ${plan.name}: created product ${product.id}, price ${price.id}`);
    lines.push(`${plan.envVar}=${price.id}`);
  }

  console.log("\nAdd these to your .env.local (and Vercel project env):\n");
  console.log(lines.join("\n"));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
