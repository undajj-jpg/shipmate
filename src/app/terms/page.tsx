// DRAFT — must be reviewed by a lawyer before launch.
import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — Shipmate",
  description: "The terms that govern your Shipmate subscription.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro="These terms govern your use of Shipmate's development-subscription service. By subscribing, you agree to them. Written to be read — if anything is unclear, email hello@shipmate.dev before you subscribe."
    >
      <LegalSection title="1. The service">
        <p>
          Shipmate provides a productized software-development service: a dedicated
          developer, working with AI tooling, who builds and maintains your website,
          landing page, SaaS application, or automation, and communicates with you through
          the Shipmate platform.
        </p>
        <p>
          Work is organized as a queue of requests. <strong>One request is active at a
          time</strong>; the rest wait in your queue in the order you set. Most requests
          ship within 48 hours. That figure is a good-faith average,{" "}
          <strong>not a guaranteed deadline</strong> — complex requests are split into
          smaller shippable pieces, and turnaround times are best-effort.
        </p>
      </LegalSection>

      <LegalSection title="2. Plans and switching">
        <p>
          <strong>Build ($500/month)</strong> covers active development: unlimited queued
          requests (one active at a time), direct chat with your developer, and production
          deployments.
        </p>
        <p>
          <strong>Maintain</strong> covers a finished product: hosting management,
          monitoring, security patches, and bug fixes. Its monthly rate depends on the
          type of product being maintained — currently $50 for a landing page, $75 for a
          website, $100 for an automation, and $399 for a SaaS application, reflecting
          their different upkeep costs. <strong>New features are not included</strong> on
          Maintain — switching back to Build re-activates feature development.
        </p>
        <p>
          You can switch between plans at any time from your billing screen. Switches take
          effect immediately and are prorated by Stripe.
        </p>
      </LegalSection>

      <LegalSection title="3. Third-party infrastructure costs">
        <p>
          <strong>Setup is included; usage is passed through.</strong> Shipmate sets up
          and configures all infrastructure your product needs — hosting, deployments,
          database, domain, email — as part of your subscription, so your product runs
          from day one at no extra service fee. Where providers offer free tiers (for
          example Vercel&apos;s), your infrastructure cost is simply $0 until your usage
          outgrows them.
        </p>
        <p>
          However,{" "}
          <strong>
            the providers&apos; own usage costs are not included in your plan price.
          </strong>{" "}
          These include, without limitation: hosting beyond free-tier limits (e.g.
          Vercel), databases (e.g. Supabase), domain registrations and renewals,
          transactional email services, and AI API usage attributable to your product.
        </p>
        <p>
          These costs are variable — they depend on your product&apos;s traffic, data, and
          usage — and are <strong>passed through to you at cost, with no markup</strong>.
          They appear as itemized line items on your monthly invoice, and you can view the
          current month&apos;s accruing charges at any time in your billing screen. Typical
          small projects run $5–50/month.
        </p>
        <p>
          <strong>
            By subscribing, you authorize Shipmate to charge these pass-through
            infrastructure costs to your payment method on file
          </strong>{" "}
          as part of your regular monthly invoice. If any single month&apos;s
          infrastructure total is expected to materially exceed the typical range, we will
          notify you before the invoice is charged.
        </p>
      </LegalSection>

      <LegalSection title="4. Payment">
        <p>
          Subscriptions are billed monthly in advance through Stripe. Pass-through
          infrastructure costs are billed monthly in arrears on the same invoice. If a
          payment fails, your portal access is paused until payment is updated; your code,
          project, and chat history are unaffected during the pause.
        </p>
      </LegalSection>

      <LegalSection title="5. Cancellation">
        <p>
          You can cancel at any time from the billing screen. Cancellation takes effect at
          the end of the current billing period; no further subscription charges are made
          after that. Any unbilled pass-through infrastructure costs accrued before
          cancellation are charged on the final invoice.
        </p>
        <p>
          If a request is active when you cancel, your developer will make a reasonable
          effort to bring it to a shippable state before the period ends, but work stops at
          the period boundary. You keep the repository and everything in it (see the{" "}
          <a href="/code-ownership" className="underline underline-offset-2">
            Code Ownership policy
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="6. Refunds">
        <p>
          The first 14 days of your first Build subscription are covered by a
          no-questions-asked refund. Beyond that, months already billed are not refunded,
          but you can cancel future renewals at any time. Pass-through infrastructure
          costs are actual costs already incurred with third parties and are not
          refundable.
        </p>
      </LegalSection>

      <LegalSection title="7. Acceptable use">
        <p>
          You may not use Shipmate to build products that are illegal, infringe
          third-party rights, distribute malware, send spam, or process data you have no
          right to process. We may refuse requests that would require us to violate law,
          third-party terms, or reasonable professional ethics, and may terminate the
          service for repeated violations.
        </p>
      </LegalSection>

      <LegalSection title="8. Limitation of liability">
        <p>
          The service is provided &quot;as is&quot;. To the maximum extent permitted by
          law, Shipmate&apos;s total aggregate liability arising out of or related to the
          service is limited to the subscription fees you paid in the three (3) months
          preceding the claim. Shipmate is not liable for indirect, incidental, or
          consequential damages, including lost profits, lost data, or business
          interruption, nor for outages of third-party infrastructure providers.
        </p>
        <p>
          Nothing in these terms limits liability that cannot be limited under applicable
          law, including liability arising from willful misconduct or gross negligence.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to these terms">
        <p>
          We may update these terms; material changes are announced by email at least 14
          days before they take effect. Continued use after the effective date constitutes
          acceptance. The version you accepted, and when, is recorded with your account.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact & governing law">
        <p>
          Shipmate operates from Spain and these terms are governed by Spanish law, without
          prejudice to mandatory consumer protections of your country of residence.
          Questions: hello@shipmate.dev.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
