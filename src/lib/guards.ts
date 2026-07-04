import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import type { Client } from "@/db/schema";
import { clients } from "@/db/schema";

export type ClientContext = {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  client: Client;
};

/**
 * Loads the signed-in user's client row, redirecting to login/onboarding
 * when the prerequisite is missing. Does NOT enforce an active plan —
 * callers decide whether to render the paywall.
 */
export async function getClientContext(): Promise<ClientContext> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectTo=/app");
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.userId, session.user.id),
  });
  if (!client) {
    redirect("/onboarding");
  }

  return {
    userId: session.user.id,
    userName: session.user.name ?? null,
    userEmail: session.user.email ?? null,
    client,
  };
}

export function hasActivePlan(client: Client): boolean {
  return client.planStatus === "active";
}
