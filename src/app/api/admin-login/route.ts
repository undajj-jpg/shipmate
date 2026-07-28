import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { env } from "@/env";

export const runtime = "nodejs";

const SESSION_DAYS = 30;

function safeEqual(a: string, b: string): boolean {
  // Hash both sides so length differences don't leak via timingSafeEqual.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function adminEmails(): string[] {
  return env.ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function sessionCookieName(): string {
  return env.NEXT_PUBLIC_APP_URL.startsWith("https")
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

/**
 * Bootstrap password login: active only while ADMIN_PASSWORD is set, and
 * only for emails listed in ADMIN_EMAILS. Creates a normal Auth.js database
 * session, indistinguishable from a magic-link login.
 */
export async function POST(req: Request) {
  if (!env.ADMIN_PASSWORD) {
    return new Response("Not found", { status: 404 });
  }

  const form = await req.formData();
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");

  const authorized =
    adminEmails().includes(email) && safeEqual(password, env.ADMIN_PASSWORD);

  if (!authorized) {
    // flat delay to blunt brute-force attempts
    await new Promise((r) => setTimeout(r, 1500));
    return Response.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/admin-login?error=1`,
      303
    );
  }

  let user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    [user] = await db
      .insert(users)
      .values({ email, name: "Admin", role: "admin", emailVerified: new Date() })
      .returning();
  } else if (user.role !== "admin") {
    await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
  }

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ sessionToken: token, userId: user.id, expires });

  const secure = env.NEXT_PUBLIC_APP_URL.startsWith("https");
  const cookie = [
    `${sessionCookieName()}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_DAYS * 24 * 60 * 60}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  return new Response(null, {
    status: 303,
    headers: {
      Location: `${env.NEXT_PUBLIC_APP_URL}/admin`,
      "Set-Cookie": cookie,
    },
  });
}
