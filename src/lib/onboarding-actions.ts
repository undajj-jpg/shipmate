"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { clients, projects } from "@/db/schema";
import { BUILD_TYPE_LABELS } from "@/lib/plans";

const onboardingSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  buildType: z.enum(["site", "landing_page", "saas", "automation"]),
  description: z.string().min(1, "Tell us a bit about what you want built").max(2000),
  plan: z.enum(["build", "maintain"]).optional(),
});

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const parsed = onboardingSchema.safeParse({
    companyName: formData.get("companyName"),
    buildType: formData.get("buildType"),
    description: formData.get("description"),
    plan: formData.get("plan") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid onboarding details";
    redirect(`/onboarding?error=${encodeURIComponent(message)}`);
  }

  const { companyName, buildType, description, plan } = parsed.data;
  const userId = session.user.id;

  const existingClient = await db.query.clients.findFirst({
    where: eq(clients.userId, userId),
  });

  const clientId =
    existingClient?.id ??
    (
      await db
        .insert(clients)
        .values({ userId, companyName, plan: "none", planStatus: "canceled" })
        .returning({ id: clients.id })
    )[0].id;

  await db.insert(projects).values({
    clientId,
    name: BUILD_TYPE_LABELS[buildType],
    description,
    buildType,
    status: "onboarding",
  });

  redirect(`/checkout?plan=${plan ?? "build"}`);
}
