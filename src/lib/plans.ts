/**
 * Central pricing model. Client-safe: no env access here.
 *
 * Build is one flat rate. Maintain is tiered by what was built, because a
 * SaaS app costs more to keep healthy than a landing page.
 */
export type BuildType = "site" | "landing_page" | "saas" | "automation";
export type PaidPlan = "build" | "maintain";

export const BUILD_TYPE_LABELS: Record<BuildType, string> = {
  site: "Website",
  landing_page: "Landing page",
  saas: "SaaS product",
  automation: "Automation",
};

export const BUILD_PRICE_CENTS = 50000;

export const MAINTAIN_PRICE_CENTS: Record<BuildType, number> = {
  landing_page: 5000,
  site: 7500,
  automation: 10000,
  saas: 39900,
};

export const MAINTAIN_FROM_CENTS = Math.min(...Object.values(MAINTAIN_PRICE_CENTS));

export function money(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

export function planPriceCents(plan: PaidPlan, buildType: BuildType): number {
  return plan === "build" ? BUILD_PRICE_CENTS : MAINTAIN_PRICE_CENTS[buildType];
}

export function planPriceLabel(plan: PaidPlan, buildType: BuildType): string {
  return `${money(planPriceCents(plan, buildType))}/mo`;
}

export const PLAN_COPY: Record<PaidPlan, { name: string; description: string }> = {
  build: {
    name: "Build",
    description:
      "Active development. Your dedicated developer + AI, shipping continuously.",
  },
  maintain: {
    name: "Maintain",
    description:
      "Hosting, monitoring, security patches, and bug fixes for a finished product. Priced by what we maintain.",
  },
};

/** Ordered cheapest-first for display. */
export const MAINTAIN_TIERS: { type: BuildType; cents: number }[] = (
  Object.entries(MAINTAIN_PRICE_CENTS) as [BuildType, number][]
)
  .map(([type, cents]) => ({ type, cents }))
  .sort((a, b) => a.cents - b.cents);
