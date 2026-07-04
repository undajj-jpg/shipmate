// DRAFT — must be reviewed by a lawyer before launch.
import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Shipmate",
  description: "What data Shipmate stores, why, and your rights over it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Shipmate stores the minimum needed to run your subscription and build your product. This page lists exactly what that is, who processes it, and how to exercise your rights."
    >
      <LegalSection title="1. Who we are">
        <p>
          Shipmate (&quot;we&quot;) operates from Spain and acts as the data controller for
          the personal data described here. Contact for all privacy matters:{" "}
          <strong>hello@shipmate.dev</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. What we store">
        <p>
          <strong>Account data</strong> — name, email address, avatar, and authentication
          identifiers (Google account ID if you sign in with Google; magic-link tokens if
          you sign in by email).
        </p>
        <p>
          <strong>Workspace content</strong> — your company name, project descriptions,
          change requests, and the messages you exchange with your developer in the
          platform chat.
        </p>
        <p>
          <strong>Billing data</strong> — your subscription plan, its status, invoice
          history, and itemized infrastructure pass-through charges.{" "}
          <strong>Card details never touch our servers</strong>; they are collected and
          stored by Stripe.
        </p>
        <p>
          <strong>Deployment metadata</strong> — commit identifiers, build status, deploy
          URLs, and timestamps for your product&apos;s deployments.
        </p>
      </LegalSection>

      <LegalSection title="3. Processors we use">
        <p>
          Data is processed by these providers under their respective data-processing
          agreements: <strong>Stripe</strong> (payments and invoicing),{" "}
          <strong>Supabase</strong> (database and realtime infrastructure),{" "}
          <strong>Vercel</strong> (application hosting and deployments),{" "}
          <strong>Resend</strong> (transactional email), and <strong>AI providers</strong>{" "}
          (e.g. Anthropic) used by your developer as coding tools. Chat content may be
          processed by AI tooling to draft and review code;{" "}
          <strong>it is not used to train third-party models</strong> under the agreements
          we operate on. Some processors operate outside the EU; transfers rely on the EU
          Standard Contractual Clauses or an adequacy decision.
        </p>
      </LegalSection>

      <LegalSection title="4. Legal basis (GDPR)">
        <p>
          We process account, workspace, and billing data because it is{" "}
          <strong>necessary to perform the contract</strong> with you (Art. 6(1)(b) GDPR).
          Invoicing records are additionally kept to comply with{" "}
          <strong>legal obligations</strong> (Art. 6(1)(c)). Product analytics, if any, and
          service emails beyond transactional ones rely on{" "}
          <strong>legitimate interest</strong> (Art. 6(1)(f)) or consent, and can be
          objected to at any time.
        </p>
      </LegalSection>

      <LegalSection title="5. Retention">
        <p>
          Account and workspace data are kept while your account exists and deleted within
          90 days of account deletion, except invoicing records, which Spanish tax law
          requires us to retain (currently up to 6 years). Chat history belongs to your
          workspace and is exported to you on request before deletion.
        </p>
      </LegalSection>

      <LegalSection title="6. Your rights">
        <p>
          You can request <strong>access</strong> to, <strong>correction</strong> of,{" "}
          <strong>deletion</strong> of, or <strong>a portable export</strong> of your
          personal data, and you can <strong>object</strong> to processing based on
          legitimate interest. Email hello@shipmate.dev; we respond within 30 days. You
          also have the right to lodge a complaint with the Spanish supervisory authority
          (AEPD, aepd.es) or your local one.
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          The app uses strictly necessary cookies only: your session cookie and CSRF
          protection. No advertising or cross-site tracking cookies are set.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes">
        <p>
          Material changes to this policy are announced by email at least 14 days before
          taking effect. The &quot;Last updated&quot; date at the top always reflects the
          current version.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
