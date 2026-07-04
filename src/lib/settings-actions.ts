"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireActor } from "@/lib/access";

const companySchema = z.object({
  companyName: z.string().min(1).max(200),
});

export async function updateCompanyName(formData: FormData) {
  const actor = await requireActor();
  const { companyName } = companySchema.parse({
    companyName: formData.get("companyName"),
  });

  // A client can only edit their own company.
  await db
    .update(clients)
    .set({ companyName: companyName.trim() })
    .where(eq(clients.userId, actor.userId));

  revalidatePath("/app/settings");
}
