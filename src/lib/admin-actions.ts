"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { clients, projects, users } from "@/db/schema";
import { addPassthroughCharge, sendChargesToInvoice } from "@/lib/passthrough-actions";
import { notifyInfraCharges } from "@/lib/email";
import { passthroughCharges } from "@/db/schema";
import { and } from "drizzle-orm";

async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Admin only");
  }
  return session.user.id;
}

export async function reassignDeveloper(formData: FormData) {
  await requireAdmin();
  const { clientId, developerId } = z
    .object({
      clientId: z.string().uuid(),
      developerId: z.union([z.string().uuid(), z.literal("none")]),
    })
    .parse({
      clientId: formData.get("clientId"),
      developerId: formData.get("developerId"),
    });

  if (developerId !== "none") {
    const dev = await db.query.users.findFirst({ where: eq(users.id, developerId) });
    if (!dev || dev.role !== "developer") throw new Error("Not a developer");
  }

  await db
    .update(clients)
    .set({ assignedDeveloperId: developerId === "none" ? null : developerId })
    .where(eq(clients.id, clientId));

  revalidatePath("/admin/clients");
  revalidatePath("/admin");
}

export async function updateProjectLinks(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      projectId: z.string().uuid(),
      repoUrl: z.string().url().or(z.literal("")),
      productionUrl: z.string().url().or(z.literal("")),
      vercelProjectId: z.string().max(100),
      status: z.enum(["onboarding", "active", "maintained", "archived"]),
    })
    .parse({
      projectId: formData.get("projectId"),
      repoUrl: (formData.get("repoUrl") as string)?.trim() ?? "",
      productionUrl: (formData.get("productionUrl") as string)?.trim() ?? "",
      vercelProjectId: (formData.get("vercelProjectId") as string)?.trim() ?? "",
      status: formData.get("status"),
    });

  await db
    .update(projects)
    .set({
      repoUrl: parsed.repoUrl || null,
      productionUrl: parsed.productionUrl || null,
      vercelProjectId: parsed.vercelProjectId || null,
      status: parsed.status,
    })
    .where(eq(projects.id, parsed.projectId));

  revalidatePath(`/admin/clients`);
}

export async function addChargeAction(formData: FormData) {
  await requireAdmin();
  const parsed = z
    .object({
      clientId: z.string().uuid(),
      period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
      category: z.enum(["hosting", "ai_usage", "domain", "database", "email", "other"]),
      description: z.string().min(1).max(500),
      amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "amount like 12.40"),
    })
    .parse({
      clientId: formData.get("clientId"),
      period: formData.get("period"),
      category: formData.get("category"),
      description: formData.get("description"),
      amount: formData.get("amount"),
    });

  await addPassthroughCharge({
    clientId: parsed.clientId,
    period: parsed.period,
    category: parsed.category,
    description: parsed.description,
    amountCents: Math.round(parseFloat(parsed.amount) * 100),
  });

  revalidatePath(`/admin/clients/${parsed.clientId}`);
}

export async function sendToInvoiceAction(formData: FormData) {
  await requireAdmin();
  const { clientId, period } = z
    .object({
      clientId: z.string().uuid(),
      period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
    })
    .parse({ clientId: formData.get("clientId"), period: formData.get("period") });

  const sent = await sendChargesToInvoice(clientId, period);

  // Email the client the itemized breakdown BEFORE the invoice is charged
  // (and alert admins if the total crosses the threshold).
  if (sent > 0) {
    const charges = await db.query.passthroughCharges.findMany({
      where: and(
        eq(passthroughCharges.clientId, clientId),
        eq(passthroughCharges.period, period),
        eq(passthroughCharges.status, "invoiced")
      ),
    });
    void notifyInfraCharges(clientId, period, charges).catch(() => {});
  }

  revalidatePath(`/admin/clients/${clientId}`);
}
