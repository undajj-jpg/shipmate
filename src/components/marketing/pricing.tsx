import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "build",
    name: "Build",
    price: "$500",
    tagline: "Active development",
    features: [
      "Unlimited requests, one active at a time",
      "Direct chat with your developer",
      "Deploys straight to Vercel",
      "New features, redesigns, integrations",
    ],
    featured: true,
  },
  {
    id: "maintain",
    name: "Maintain",
    price: "$100",
    tagline: "Your product is done",
    features: [
      "Hosting & uptime monitoring",
      "Security patches",
      "Bug fixes",
      "No new features — upgrade anytime",
    ],
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        Simple, switchable pricing
      </h2>
      <p className="mt-2 max-w-lg text-muted-ink">
        Two plans. Switch between them anytime as your product moves between building and
        running.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-2xl border p-8",
              plan.featured
                ? "border-green/40 bg-green-tint"
                : "border-hairline bg-white"
            )}
          >
            <span className="text-sm font-medium text-muted-ink">{plan.tagline}</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-ink">{plan.price}</span>
              <span className="text-muted-ink">/month</span>
            </div>
            <h3 className="mt-1 font-display text-xl font-semibold text-ink">{plan.name}</h3>
            <ul className="mt-6 flex flex-1 flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className={cn(
                "mt-8",
                plan.featured
                  ? "bg-green text-white hover:bg-green/90"
                  : "bg-ink text-white hover:bg-ink/90"
              )}
            >
              <Link href={`/signup?plan=${plan.id}`}>Choose {plan.name}</Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
