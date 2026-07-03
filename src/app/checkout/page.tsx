import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Stripe Checkout redirect is wired up in Phase 2.
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { plan } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm rounded-2xl border border-hairline bg-white p-8 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">
          Workspace created
        </h1>
        <p className="mt-2 text-sm text-muted-ink">
          Plan selected: <strong className="text-ink">{plan === "maintain" ? "Maintain" : "Build"}</strong>.
          Checkout is coming in the next step of setup.
        </p>
      </div>
    </div>
  );
}
