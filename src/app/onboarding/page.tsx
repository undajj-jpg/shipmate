import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/lib/onboarding-actions";

const BUILD_TYPES = [
  { value: "site", label: "A website" },
  { value: "landing_page", label: "A landing page" },
  { value: "saas", label: "A SaaS product" },
  { value: "automation", label: "An automation" },
];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?redirectTo=/onboarding");
  }

  const { plan, error } = await searchParams;
  const selectedPlan = plan === "maintain" ? "maintain" : "build";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-hairline bg-white p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Tell us about your project</h1>
        <p className="mt-1 text-sm text-muted-ink">
          This creates your workspace. You&apos;ll pick your plan on the next step.
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <form action={completeOnboarding} className="mt-6 flex flex-col gap-5">
          <input type="hidden" name="plan" value={selectedPlan} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" name="companyName" placeholder="Acme Co." required />
          </div>

          <div className="flex flex-col gap-2">
            <Label>What do you want built?</Label>
            <div className="grid grid-cols-2 gap-2">
              {BUILD_TYPES.map((type, i) => (
                <label
                  key={type.value}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-hairline px-3 py-2.5 text-sm text-ink has-[:checked]:border-green has-[:checked]:bg-green-tint"
                >
                  <input
                    type="radio"
                    name="buildType"
                    value={type.value}
                    defaultChecked={i === 0}
                    className="accent-green"
                    required
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Describe what you need</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="We need a marketing site with a pricing page and a blog..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" size="lg" className="mt-2 bg-green text-white hover:bg-green/90">
            Continue to plan & payment
          </Button>
        </form>
      </div>
    </div>
  );
}
