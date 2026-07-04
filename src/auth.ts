import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { Resend as ResendClient } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { env } from "@/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  trustHost: true,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: env.RESEND_API_KEY,
      from: "Shipmate <hello@shipmate.dev>",
      async sendVerificationRequest({ identifier, url, provider }) {
        const resend = new ResendClient(provider.apiKey as string);
        await resend.emails.send({
          from: provider.from as string,
          to: identifier,
          subject: "Sign in to Shipmate",
          html: `<p style="font-family: sans-serif; font-size: 15px; color: #10182B;">
            Click the link below to sign in to Shipmate.
          </p>
          <p><a href="${url}" style="display:inline-block;background:#0FA968;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-family:sans-serif;">
            Sign in
          </a></p>
          <p style="font-family: sans-serif; font-size: 13px; color: #5A6478;">If you didn't request this, you can safely ignore this email.</p>`,
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, user.id),
        });
        session.user.id = user.id;
        session.user.role = dbUser?.role ?? "client";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
});
