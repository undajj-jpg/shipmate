import Stripe from "stripe";
import { env } from "@/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const PLAN_PRICES = {
  build: () => env.STRIPE_PRICE_BUILD,
  maintain: () => env.STRIPE_PRICE_MAINTAIN,
} as const;

export type PaidPlan = keyof typeof PLAN_PRICES;

export function priceIdForPlan(plan: PaidPlan): string {
  return PLAN_PRICES[plan]();
}

export function planFromPriceId(priceId: string): PaidPlan | null {
  if (priceId === env.STRIPE_PRICE_BUILD) return "build";
  if (priceId === env.STRIPE_PRICE_MAINTAIN) return "maintain";
  return null;
}

export const PLAN_DETAILS: Record<
  PaidPlan,
  { name: string; amountLabel: string; description: string }
> = {
  build: {
    name: "Build",
    amountLabel: "$500/mo",
    description: "Active development. Your dedicated developer + AI, shipping continuously.",
  },
  maintain: {
    name: "Maintain",
    amountLabel: "$100/mo",
    description: "Hosting, monitoring, security patches, and bug fixes for a finished product.",
  },
};
