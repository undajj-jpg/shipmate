import { Resend } from "resend";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clients, emailLog, projects, users, type PassthroughCharge } from "@/db/schema";
import { env } from "@/env";

const FROM = "Shipmate <notifications@shipmate.dev>";

const resend = new Resend(env.RESEND_API_KEY);

/**
 * All notification email goes through here: never let a mail failure
 * (bad key in dev, Resend outage) break the calling mutation.
 */
async function safeSend(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    console.error(`[email] failed to send "${subject}" to ${to}:`, err);
  }
}

function layout(title: string, bodyHtml: string): string {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#10182B">
<h2 style="font-size:20px;margin:0 0 12px">${title}</h2>
${bodyHtml}
<p style="color:#5A6478;font-size:13px;margin-top:28px">— Shipmate</p>
</div>`;
}

async function wasEmailedRecently(userId: string, type: string, withinMs: number) {
  const last = await db.query.emailLog.findFirst({
    where: and(eq(emailLog.userId, userId), eq(emailLog.type, type)),
    orderBy: [desc(emailLog.sentAt)],
  });
  return last !== undefined && Date.now() - last.sentAt.getTime() < withinMs;
}

async function logEmail(userId: string, type: string) {
  await db.insert(emailLog).values({ userId, type });
}

/** New chat message notification, batched to max one email per hour per user. */
export async function notifyNewMessage(recipientUserId: string, projectId: string) {
  const type = `new_message:${projectId}`;
  if (await wasEmailedRecently(recipientUserId, type, 60 * 60 * 1000)) return;

  const recipient = await db.query.users.findFirst({
    where: eq(users.id, recipientUserId),
  });
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!recipient?.email || !project) return;

  await logEmail(recipientUserId, type);
  await safeSend(
    recipient.email,
    `New message on ${project.name}`,
    layout(
      "You have new messages",
      `<p>There are new messages waiting for you on <strong>${project.name}</strong>.</p>
<p><a href="${env.NEXT_PUBLIC_APP_URL}" style="color:#0FA968">Open the chat</a></p>
<p style="color:#5A6478;font-size:13px">You'll get at most one of these per hour per project.</p>`
    )
  );
}

export async function notifyRequestShipped(
  clientUserId: string,
  projectName: string,
  requestTitle: string,
  note?: string
) {
  const user = await db.query.users.findFirst({ where: eq(users.id, clientUserId) });
  if (!user?.email) return;
  await safeSend(
    user.email,
    `Shipped: ${requestTitle}`,
    layout(
      "Your request just shipped 🚀",
      `<p><strong>${requestTitle}</strong> is live in production on <strong>${projectName}</strong>.</p>
${note ? `<p>Note from your developer: ${note}</p>` : ""}
<p><a href="${env.NEXT_PUBLIC_APP_URL}/app/requests" style="color:#0FA968">See your queue</a></p>`
    )
  );
}

export async function notifyPaymentFailed(clientId: string) {
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
    with: { user: true },
  });
  if (!client?.user?.email) return;
  await safeSend(
    client.user.email,
    "Your Shipmate payment failed",
    layout(
      "Payment failed",
      `<p>Your last payment for <strong>${client.companyName}</strong> didn't go through, so your portal is paused.</p>
<p>Your project, code, and chat history are safe. Update your card to pick up right where you left off.</p>
<p><a href="${env.NEXT_PUBLIC_APP_URL}/app" style="color:#0FA968">Update payment method</a></p>`
    )
  );
}

/** Deploy failed → developer + all admins. */
export async function notifyDeployFailed(
  projectId: string,
  deploymentUrl: string | null,
  commitMessage: string | null
) {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: { client: { with: { assignedDeveloper: true } } },
  });
  if (!project) return;

  const admins = await db.query.users.findMany({ where: eq(users.role, "admin") });
  const recipients = [
    ...(project.client.assignedDeveloper?.email
      ? [project.client.assignedDeveloper.email]
      : []),
    ...admins.map((a) => a.email),
  ];

  const html = layout(
    "Production deploy failed",
    `<p>A deployment for <strong>${project.name}</strong> (${project.client.companyName}) just failed.</p>
${commitMessage ? `<p>Commit: ${commitMessage}</p>` : ""}
${deploymentUrl ? `<p><a href="https://${deploymentUrl}" style="color:#0FA968">Deployment</a></p>` : ""}`
  );

  await Promise.all(
    recipients.map((to) => safeSend(to, `Deploy failed: ${project.name}`, html))
  );
}

/** Itemized infra charges emailed to the client BEFORE the invoice is charged. */
export async function notifyInfraCharges(
  clientId: string,
  period: string,
  charges: Pick<PassthroughCharge, "category" | "description" | "amountCents">[]
) {
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, clientId),
    with: { user: true },
  });
  if (!client?.user?.email || charges.length === 0) return;

  const total = charges.reduce((s, c) => s + c.amountCents, 0);
  const rows = charges
    .map(
      (c) =>
        `<tr><td style="padding:6px 12px 6px 0">${c.category.replace("_", " ")}</td><td style="padding:6px 12px 6px 0">${c.description}</td><td style="padding:6px 0;text-align:right">$${(c.amountCents / 100).toFixed(2)}</td></tr>`
    )
    .join("");

  await safeSend(
    client.user.email,
    `Infrastructure costs for ${period}: $${(total / 100).toFixed(2)}`,
    layout(
      `Infrastructure usage — ${period}`,
      `<p>These at-cost infrastructure charges will appear on your next invoice. No markup, ever.</p>
<table style="width:100%;font-size:14px;border-collapse:collapse">${rows}
<tr><td colspan="2" style="padding:8px 12px 0 0;font-weight:600">Total</td><td style="padding:8px 0 0;text-align:right;font-weight:600">$${(total / 100).toFixed(2)}</td></tr></table>
<p><a href="${env.NEXT_PUBLIC_APP_URL}/app/billing" style="color:#0FA968">View in your billing screen</a></p>`
    )
  );

  // Unusual-usage alert for admins.
  if (total > env.INFRA_ALERT_THRESHOLD_CENTS) {
    const admins = await db.query.users.findMany({ where: eq(users.role, "admin") });
    const alert = layout(
      "High infra usage alert",
      `<p><strong>${client.companyName}</strong> has $${(total / 100).toFixed(2)} in pass-through charges for ${period}, above the $${(env.INFRA_ALERT_THRESHOLD_CENTS / 100).toFixed(0)} alert threshold.</p>`
    );
    await Promise.all(
      admins.map((a) => safeSend(a.email, `Infra alert: ${client.companyName}`, alert))
    );
  }
}
