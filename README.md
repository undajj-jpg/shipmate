# Shipmate

A productized development-subscription platform. Clients subscribe to get a dedicated
developer (working with AI) who builds their site, landing page, SaaS, or automation —
chatting inside the platform and watching changes deploy to production on Vercel in real
time.

- **Build — $500/mo**: active development, unlimited requests (one active at a time), direct chat, deploys to Vercel.
- **Maintain — $100/mo**: hosting/monitoring, security patches, bug fixes. No new features.

## Tech stack

- Next.js 15 (App Router) + TypeScript, deployed on Vercel
- Tailwind CSS v4 + shadcn/ui
- PostgreSQL (Supabase) via Drizzle ORM
- Auth.js (email magic link via Resend + Google OAuth)
- Supabase Realtime for chat
- Stripe Billing for subscriptions
- Vercel REST API + webhooks for deployment tracking
- Resend for transactional email
- Zod for all input/env validation

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Database**

   Point `DATABASE_URL` at a Postgres instance (a local Postgres works fine for
   development; use your Supabase connection string in staging/production).

   Copy `.env.example` to `.env.local` and fill in every variable — the app validates
   them all at boot with Zod (`src/env.ts`) and fails loudly if anything required is
   missing.

3. **Run migrations**

   ```bash
   npm run db:generate   # generate SQL from src/db/schema.ts (after schema changes)
   npm run db:migrate    # apply migrations in ./drizzle to DATABASE_URL
   npm run db:studio     # optional: browse the DB with Drizzle Studio
   ```

4. **Seed demo data** (added in Phase 7)

   ```bash
   npm run db:seed
   ```

5. **Run the app**

   ```bash
   npm run dev
   ```

   Visit http://localhost:3000.

## Auth

- Google OAuth: create an OAuth client at https://console.cloud.google.com/apis/credentials
  with an authorized redirect URI of `<NEXT_PUBLIC_APP_URL>/api/auth/callback/google`, and
  set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
- Email magic link: sent via Resend (`RESEND_API_KEY`). In development, use a
  [Resend test API key](https://resend.com/docs) or a sandbox domain — no SMTP server
  required.
- `NEXTAUTH_SECRET`: generate with `openssl rand -base64 32`.

## Stripe (added in Phase 2)

1. Run the seed script to create the Build/Maintain products & prices in your Stripe
   account, then copy the resulting price IDs into `STRIPE_PRICE_BUILD` /
   `STRIPE_PRICE_MAINTAIN`:

   ```bash
   npm run stripe:seed
   ```

2. Forward webhooks to your local server with the Stripe CLI:

   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

   Copy the `whsec_...` signing secret it prints into `STRIPE_WEBHOOK_SECRET`.

3. Handled webhook events: `checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`, and `invoice.paid` (marks infra pass-through
   charges paid and recovers `past_due` clients). All events are logged to
   `subscription_events` and deduped on the Stripe event ID.

### Infrastructure pass-through charges

Subscriptions cover the development service only. Hosting, database, domain,
email, and AI usage costs are billed to clients **at cost** as separate
invoice line items:

- Staff record charges per client per month (`passthrough_charges` table) via
  the admin back office; "Send to invoice" creates Stripe invoice items on the
  client's next subscription invoice (idempotent per charge).
- Clients see the itemized current-month charges and history in
  **/app/billing → Infrastructure usage**.
- Checkout requires accepting the variable-costs policy; acceptance timestamp
  and terms version are stored on the `clients` row.
- `INFRA_ALERT_THRESHOLD_CENTS` (default 10000 = $100) controls the admin
  alert for unusually high monthly infra totals.

## Vercel integration (added in Phase 6)

1. Create a Vercel API token (https://vercel.com/account/tokens) and set `VERCEL_TOKEN`
   and `VERCEL_TEAM_ID`.
2. In the admin back office, link each client project to its Vercel project — this stores
   `vercelProjectId` on the `projects` row.
3. Register a webhook in the Vercel dashboard (or via the API) pointing at
   `<NEXT_PUBLIC_APP_URL>/api/webhooks/vercel` for the `deployment.created`,
   `deployment.succeeded`, and `deployment.error` events. Set the signing secret as
   `VERCEL_WEBHOOK_SECRET` — the route verifies the `x-vercel-signature` header against
   it before processing.
4. Successful/failed deploys are upserted into `deployments` (unique on the Vercel
   deployment id) and post a `deploy` card into the project chat exactly once per state
   transition. If webhooks were registered late, the project screen's
   **↻ Refresh from Vercel** button backfills via `GET /v6/deployments?projectId=…`.

## Project structure

```
src/
  app/                 # routes (marketing, auth, onboarding, client/dev/admin portals, API)
  components/          # UI components (marketing/, ui/ shadcn primitives, portal-specific)
  db/                  # Drizzle schema + client
  lib/                 # server actions, integrations (Stripe, Vercel, Resend, Supabase)
  auth.ts              # Auth.js configuration
  env.ts               # Zod-validated environment variables
drizzle/               # generated SQL migrations
scripts/               # migrate.ts, seed.ts
```

## Quality bar

- TypeScript strict mode, no `any`.
- All mutations go through server actions or route handlers with Zod-validated input and
  role checks (a client can only touch their own project; a developer only their assigned
  clients).
- Webhooks are idempotent — Stripe events are deduped on `stripeEventId`, Vercel
  deployments on `vercelDeploymentId`.
