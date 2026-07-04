import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url().optional(),

  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  STRIPE_PRICE_BUILD: z.string().min(1, "STRIPE_PRICE_BUILD is required"),
  // Maintain is tiered by build type — one Stripe price per tier.
  STRIPE_PRICE_MAINTAIN_SITE: z.string().min(1, "STRIPE_PRICE_MAINTAIN_SITE is required"),
  STRIPE_PRICE_MAINTAIN_LANDING: z
    .string()
    .min(1, "STRIPE_PRICE_MAINTAIN_LANDING is required"),
  STRIPE_PRICE_MAINTAIN_SAAS: z.string().min(1, "STRIPE_PRICE_MAINTAIN_SAAS is required"),
  STRIPE_PRICE_MAINTAIN_AUTOMATION: z
    .string()
    .min(1, "STRIPE_PRICE_MAINTAIN_AUTOMATION is required"),

  VERCEL_TOKEN: z.string().min(1, "VERCEL_TOKEN is required"),
  VERCEL_TEAM_ID: z.string().min(1, "VERCEL_TEAM_ID is required"),
  VERCEL_WEBHOOK_SECRET: z.string().min(1, "VERCEL_WEBHOOK_SECRET is required"),

  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  /** Alert admin when a client's monthly infra pass-through total exceeds this. */
  INFRA_ALERT_THRESHOLD_CENTS: z.coerce.number().int().positive().default(10000),

  /** Comma-separated emails that are auto-promoted to admin on sign-in. */
  ADMIN_EMAILS: z.string().default(""),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Client-side Supabase Realtime (chat). Optional: chat falls back to
  // polling when not configured (e.g. local dev without Supabase).
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  // Skip strict validation during `next build`'s static analysis / lint pass
  // and in test runs, where secrets legitimately aren't present.
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    return process.env as unknown as Env;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const missing = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `\n\nInvalid or missing environment variables:\n${missing}\n\nCheck .env.example for the full list of required variables.\n`
    );
  }

  return parsed.data;
}

export const env = loadEnv();
