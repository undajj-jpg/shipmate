/**
 * Demo seed: 1 admin, 2 developers, 3 clients with projects, chat
 * history, request queues, deployments, and infra pass-through charges —
 * so every screen renders with data.
 *
 * Usage: npm run db:seed   (idempotent: wipes and re-creates demo rows
 * by their fixed emails, never touches other data)
 */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { inArray } from "drizzle-orm";
import * as schema from "../src/db/schema";

const DEMO_EMAILS = [
  "ava@shipmate.demo",
  "dana@shipmate.demo",
  "marco@shipmate.demo",
  "lena@bloomstudio.demo",
  "sam@peakfit.demo",
  "iris@lumen.demo",
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  // wipe previous demo rows (cascades clean up children)
  await db.delete(schema.users).where(inArray(schema.users.email, DEMO_EMAILS));

  const [ava, dana, marco, lena, sam, iris] = await db
    .insert(schema.users)
    .values([
      { name: "Ava Ortiz", email: "ava@shipmate.demo", role: "admin" },
      { name: "Dana Reyes", email: "dana@shipmate.demo", role: "developer" },
      { name: "Marco Lieb", email: "marco@shipmate.demo", role: "developer" },
      { name: "Lena Fischer", email: "lena@bloomstudio.demo", role: "client" },
      { name: "Sam Carter", email: "sam@peakfit.demo", role: "client" },
      { name: "Iris Novak", email: "iris@lumen.demo", role: "client" },
    ])
    .returning();

  const now = Date.now();
  const hours = (n: number) => new Date(now - n * 3600_000);

  const [bloom, peakfit, lumen] = await db
    .insert(schema.clients)
    .values([
      {
        userId: lena.id,
        companyName: "Bloom Studio",
        plan: "build",
        planStatus: "active",
        assignedDeveloperId: dana.id,
        stripeCustomerId: "cus_demo_bloom",
        stripeSubscriptionId: "sub_demo_bloom",
        termsAcceptedAt: hours(24 * 30),
        termsVersion: "2026-07-04.v2",
        costPolicyAcceptedAt: hours(24 * 30),
      },
      {
        userId: sam.id,
        companyName: "PeakFit",
        plan: "maintain",
        planStatus: "active",
        assignedDeveloperId: dana.id,
        stripeCustomerId: "cus_demo_peakfit",
        stripeSubscriptionId: "sub_demo_peakfit",
        termsAcceptedAt: hours(24 * 90),
        termsVersion: "2026-07-04.v2",
        costPolicyAcceptedAt: hours(24 * 90),
      },
      {
        userId: iris.id,
        companyName: "Lumen Analytics",
        plan: "build",
        planStatus: "past_due",
        assignedDeveloperId: marco.id,
        stripeCustomerId: "cus_demo_lumen",
        stripeSubscriptionId: "sub_demo_lumen",
        termsAcceptedAt: hours(24 * 10),
        termsVersion: "2026-07-04.v2",
        costPolicyAcceptedAt: hours(24 * 10),
      },
    ])
    .returning();

  const [bloomProj, peakfitProj, lumenProj] = await db
    .insert(schema.projects)
    .values([
      {
        clientId: bloom.id,
        name: "Bloom Studio",
        description: "Booking SaaS for a florist collective",
        buildType: "saas",
        repoUrl: "https://github.com/bloom/app",
        productionUrl: "https://bloomstudio.example.com",
        status: "active",
      },
      {
        clientId: peakfit.id,
        name: "PeakFit",
        description: "Marketing site + class schedule",
        buildType: "site",
        repoUrl: "https://github.com/peakfit/site",
        productionUrl: "https://peakfit.example.com",
        status: "maintained",
      },
      {
        clientId: lumen.id,
        name: "Lumen Analytics",
        description: "Landing page for beta waitlist",
        buildType: "landing_page",
        repoUrl: "https://github.com/lumen/landing",
        productionUrl: "https://lumen.example.com",
        status: "active",
      },
    ])
    .returning();

  // ---- Bloom: rich chat with all message types
  await db.insert(schema.messages).values([
    {
      projectId: bloomProj.id,
      senderId: lena.id,
      body: "Hey Dana! Can we add gift cards before Mother's Day?",
      type: "text",
      createdAt: hours(30),
    },
    {
      projectId: bloomProj.id,
      senderId: dana.id,
      body: "Great timing — I'll ship the gift card flow this week. Stripe supports it natively.",
      type: "text",
      createdAt: hours(29),
    },
    {
      projectId: bloomProj.id,
      senderId: dana.id,
      body: "commit 9f8e7d6 · gift cards: purchase + redeem flow",
      type: "system",
      createdAt: hours(5),
    },
    {
      projectId: bloomProj.id,
      senderId: dana.id,
      body: "build passed · 3 checks · 41s",
      type: "system",
      createdAt: hours(5),
    },
    {
      projectId: bloomProj.id,
      senderId: null,
      body: "Deployed to production",
      type: "deploy",
      deployMeta: {
        deploymentId: "dpl_demo_bloom_2",
        url: "bloomstudio.example.com",
        state: "ready",
        commitSha: "9f8e7d6",
        duration: 41,
      },
      createdAt: hours(4),
    },
    {
      projectId: bloomProj.id,
      senderId: lena.id,
      body: "Gift cards look perfect. You're the best 🌸",
      type: "text",
      createdAt: hours(3),
    },
  ]);

  await db.insert(schema.requests).values([
    {
      projectId: bloomProj.id,
      title: "Gift cards",
      description: "Purchase + redeem before Mother's Day",
      kind: "feature",
      status: "shipped",
      position: 0,
      createdAt: hours(30),
      shippedAt: hours(4),
    },
    {
      projectId: bloomProj.id,
      title: "Subscription bouquets",
      description: "Weekly/monthly recurring orders",
      kind: "feature",
      status: "active",
      position: 0,
      createdAt: hours(20),
    },
    {
      projectId: bloomProj.id,
      title: "Wholesale portal",
      description: "B2B pricing for event planners",
      kind: "feature",
      status: "queued",
      position: 1,
      createdAt: hours(10),
    },
    {
      projectId: bloomProj.id,
      title: "Instagram feed on homepage",
      kind: "feature",
      status: "queued",
      position: 2,
      createdAt: hours(6),
    },
  ]);

  await db.insert(schema.deployments).values([
    {
      projectId: bloomProj.id,
      vercelDeploymentId: "dpl_demo_bloom_1",
      state: "ready",
      commitSha: "a1b2c3d",
      commitMessage: "checkout polish + SEO pass",
      url: "bloomstudio.example.com",
      startedAt: hours(50),
      readyAt: hours(50),
    },
    {
      projectId: bloomProj.id,
      vercelDeploymentId: "dpl_demo_bloom_2",
      state: "ready",
      commitSha: "9f8e7d6",
      commitMessage: "gift cards: purchase + redeem flow",
      url: "bloomstudio.example.com",
      startedAt: hours(5),
      readyAt: hours(4),
    },
  ]);

  await db.insert(schema.passthroughCharges).values([
    {
      clientId: bloom.id,
      period: new Date().toISOString().slice(0, 7),
      category: "hosting",
      description: "Vercel Pro + bandwidth",
      amountCents: 1240,
      status: "pending",
      createdBy: ava.id,
    },
    {
      clientId: bloom.id,
      period: new Date().toISOString().slice(0, 7),
      category: "ai_usage",
      description: "Anthropic API — florist chatbot",
      amountCents: 830,
      status: "pending",
      createdBy: ava.id,
    },
  ]);

  // ---- PeakFit (maintain): quieter, one bug
  await db.insert(schema.messages).values([
    {
      projectId: peakfitProj.id,
      senderId: sam.id,
      body: "Class schedule shows last week's times on mobile Safari.",
      type: "text",
      createdAt: hours(8),
    },
    {
      projectId: peakfitProj.id,
      senderId: dana.id,
      body: "Caching bug — on it. Fix goes out today under your Maintain plan.",
      type: "text",
      createdAt: hours(7),
    },
  ]);
  await db.insert(schema.requests).values({
    projectId: peakfitProj.id,
    title: "Schedule cache is stale on mobile",
    description: "Safari shows outdated class times",
    kind: "bug",
    status: "active",
    position: 0,
    createdAt: hours(8),
  });
  await db.insert(schema.deployments).values({
    projectId: peakfitProj.id,
    vercelDeploymentId: "dpl_demo_peakfit_1",
    state: "ready",
    commitSha: "77ffee1",
    commitMessage: "security patches, deps bump",
    url: "peakfit.example.com",
    startedAt: hours(24 * 6),
    readyAt: hours(24 * 6),
  });

  // ---- Lumen (past_due): aging active request + failed deploy
  await db.insert(schema.requests).values({
    projectId: lumenProj.id,
    title: "A/B test hero copy",
    description: "Two variants + conversion tracking",
    kind: "feature",
    status: "active",
    position: 0,
    createdAt: hours(24 * 8), // 8 days old → red in admin aging view
  });
  await db.insert(schema.deployments).values({
    projectId: lumenProj.id,
    vercelDeploymentId: "dpl_demo_lumen_1",
    state: "error",
    commitSha: "beefc0d",
    commitMessage: "hero variants + analytics",
    url: "lumen-git-main.example.com",
    startedAt: hours(24 * 2),
  });
  await db.insert(schema.messages).values({
    projectId: lumenProj.id,
    senderId: null,
    body: "Deploy failed",
    type: "deploy",
    deployMeta: {
      deploymentId: "dpl_demo_lumen_1",
      url: "lumen-git-main.example.com",
      state: "error",
      commitSha: "beefc0d",
    },
    createdAt: hours(24 * 2),
  });

  console.log("Seeded demo data:");
  console.log("  admin:      ava@shipmate.demo");
  console.log("  developers: dana@shipmate.demo, marco@shipmate.demo");
  console.log(
    "  clients:    lena@bloomstudio.demo (build), sam@peakfit.demo (maintain), iris@lumen.demo (past_due)"
  );
  await sql.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
