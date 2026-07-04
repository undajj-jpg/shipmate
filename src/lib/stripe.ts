import Stripe from "stripe";
import { env } from "@/env";
import type { BuildType, PaidPlan } from "@/lib/plans";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export type { PaidPlan } from "@/lib/plans";

function maintainPriceId(buildType: BuildType): string {
  switch (buildType) {
    case "site":
      return env.STRIPE_PRICE_MAINTAIN_SITE;
    case "landing_page":
      return env.STRIPE_PRICE_MAINTAIN_LANDING;
    case "saas":
      return env.STRIPE_PRICE_MAINTAIN_SAAS;
    case "automation":
      return env.STRIPE_PRICE_MAINTAIN_AUTOMATION;
  }
}

export function priceIdForPlan(plan: PaidPlan, buildType: BuildType): string {
  return plan === "build" ? env.STRIPE_PRICE_BUILD : maintainPriceId(buildType);
}

export function planFromPriceId(priceId: string): PaidPlan | null {
  if (priceId === env.STRIPE_PRICE_BUILD) return "build";
  const maintainIds = [
    env.STRIPE_PRICE_MAINTAIN_SITE,
    env.STRIPE_PRICE_MAINTAIN_LANDING,
    env.STRIPE_PRICE_MAINTAIN_SAAS,
    env.STRIPE_PRICE_MAINTAIN_AUTOMATION,
  ];
  if (maintainIds.includes(priceId)) return "maintain";
  return null;
}
