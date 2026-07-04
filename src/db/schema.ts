import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "@auth/core/adapters";

export const roleEnum = pgEnum("role", ["client", "developer", "admin"]);
export const planEnum = pgEnum("plan", ["build", "maintain", "none"]);
export const planStatusEnum = pgEnum("plan_status", [
  "active",
  "past_due",
  "canceled",
  "paused",
]);
export const projectStatusEnum = pgEnum("project_status", [
  "onboarding",
  "active",
  "maintained",
  "archived",
]);
export const buildTypeEnum = pgEnum("build_type", [
  "site",
  "landing_page",
  "saas",
  "automation",
]);
export const requestStatusEnum = pgEnum("request_status", [
  "queued",
  "active",
  "in_review",
  "shipped",
  "archived",
]);
export const requestKindEnum = pgEnum("request_kind", ["feature", "bug"]);
export const messageTypeEnum = pgEnum("message_type", ["text", "system", "deploy"]);
export const deploymentStateEnum = pgEnum("deployment_state", [
  "building",
  "ready",
  "error",
  "canceled",
]);
export const passthroughCategoryEnum = pgEnum("passthrough_category", [
  "hosting",
  "ai_usage",
  "domain",
  "database",
  "email",
  "other",
]);
export const passthroughStatusEnum = pgEnum("passthrough_status", [
  "pending",
  "invoiced",
  "paid",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date", withTimezone: true }),
  image: text("image"),
  role: roleEnum("role").notNull().default("client"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Auth.js adapter tables (accounts / sessions / verification tokens) ---

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: planEnum("plan").notNull().default("none"),
  planStatus: planStatusEnum("plan_status").notNull().default("canceled"),
  assignedDeveloperId: uuid("assigned_developer_id").references(() => users.id, {
    onDelete: "set null",
  }),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  termsVersion: text("terms_version"),
  costPolicyAcceptedAt: timestamp("cost_policy_accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Third-party infrastructure costs (hosting, AI usage, domains, …) passed
 * through to clients at cost. Never covered by the subscription price.
 */
export const passthroughCharges = pgTable("passthrough_charges", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  period: text("period").notNull(), // YYYY-MM
  category: passthroughCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  stripeInvoiceItemId: text("stripe_invoice_item_id"),
  status: passthroughStatusEnum("status").notNull().default("pending"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  buildType: buildTypeEnum("build_type").notNull().default("site"),
  repoUrl: text("repo_url"),
  vercelProjectId: text("vercel_project_id"),
  productionUrl: text("production_url"),
  status: projectStatusEnum("status").notNull().default("onboarding"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  kind: requestKindEnum("kind").notNull().default("feature"),
  status: requestStatusEnum("status").notNull().default("queued"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  type: messageTypeEnum("type").notNull().default("text"),
  deployMeta: jsonb("deploy_meta").$type<{
    deploymentId?: string;
    url?: string;
    state?: string;
    commitSha?: string;
    duration?: number;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deployments = pgTable(
  "deployments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    vercelDeploymentId: text("vercel_deployment_id").notNull(),
    state: deploymentStateEnum("state").notNull().default("building"),
    commitSha: text("commit_sha"),
    commitMessage: text("commit_message"),
    url: text("url"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    readyAt: timestamp("ready_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("deployments_vercel_id_idx").on(table.vercelDeploymentId)]
);

export const subscriptionEvents = pgTable(
  "subscription_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    stripeEventId: text("stripe_event_id").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("subscription_events_stripe_id_idx").on(table.stripeEventId)]
);

/** Throttle log for outbound notification emails (e.g. max 1/hour per user). */
export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  client: one(clients, {
    fields: [users.id],
    references: [clients.userId],
  }),
  assignedClients: many(clients),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  assignedDeveloper: one(users, {
    fields: [clients.assignedDeveloperId],
    references: [users.id],
  }),
  projects: many(projects),
  subscriptionEvents: many(subscriptionEvents),
  passthroughCharges: many(passthroughCharges),
}));

export const passthroughChargesRelations = relations(passthroughCharges, ({ one }) => ({
  client: one(clients, {
    fields: [passthroughCharges.clientId],
    references: [clients.id],
  }),
  createdByUser: one(users, {
    fields: [passthroughCharges.createdBy],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  requests: many(requests),
  messages: many(messages),
  deployments: many(deployments),
}));

export const requestsRelations = relations(requests, ({ one }) => ({
  project: one(projects, {
    fields: [requests.projectId],
    references: [projects.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const deploymentsRelations = relations(deployments, ({ one }) => ({
  project: one(projects, {
    fields: [deployments.projectId],
    references: [projects.id],
  }),
}));

export const subscriptionEventsRelations = relations(subscriptionEvents, ({ one }) => ({
  client: one(clients, {
    fields: [subscriptionEvents.clientId],
    references: [clients.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Request = typeof requests.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Deployment = typeof deployments.$inferSelect;
export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;
export type PassthroughCharge = typeof passthroughCharges.$inferSelect;
