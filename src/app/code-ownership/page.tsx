// DRAFT — must be reviewed by a lawyer before launch.
import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Code Ownership — Shipmate",
  description: "You own 100% of the code Shipmate builds for you, from day one.",
};

export default function CodeOwnershipPage() {
  return (
    <LegalPage
      title="Code Ownership"
      intro="The short version: it's your code. All of it, from the first commit."
    >
      <LegalSection title="1. You own the code — from day one">
        <p>
          Everything Shipmate builds for you under your subscription — application code,
          configuration, infrastructure definitions, database schemas, and design assets
          created specifically for your product — is{" "}
          <strong>your property from the moment it is committed</strong> to your
          repository. To the extent any of it is protected by copyright and not already
          yours as a work made for hire, Shipmate assigns it to you upon creation.
        </p>
        <p>
          The repository lives under your ownership (or is transferred to you on request at
          any time, at no cost). You never need to &quot;buy out&quot; your own product.
        </p>
      </LegalSection>

      <LegalSection title="2. When you cancel">
        <p>
          On cancellation you keep the repository, the deployed product, all data, and all
          third-party accounts (hosting, database, domain) that were set up for your
          product. If those accounts were provisioned under Shipmate&apos;s umbrella for
          convenience, <strong>Shipmate will assist with migrating them to your own
          accounts</strong> — hosting, DNS, database, and environment configuration — as
          part of your final subscription period, at no extra service fee (third-party
          transfer costs, if any, are passed through at cost as usual).
        </p>
      </LegalSection>

      <LegalSection title="3. What Shipmate retains">
        <p>
          Shipmate retains ownership of <strong>generic, non-client-specific tooling</strong>:
          internal scaffolding, build scripts, deployment templates, code generators, and
          reusable libraries that predate your project or were developed independently of
          it and contain none of your confidential information or product-specific logic.
          Where any such generic tooling is embedded in your repository, you receive a
          perpetual, irrevocable, royalty-free license to keep using and modifying it as
          part of your product.
        </p>
      </LegalSection>

      <LegalSection title="4. Open-source components">
        <p>
          Your product will typically include open-source dependencies (frameworks,
          libraries). Those remain governed by their own licenses; Shipmate selects
          permissively-licensed components (MIT, Apache-2.0, BSD) unless you approve
          otherwise in writing.
        </p>
      </LegalSection>

      <LegalSection title="5. Questions">
        <p>
          If your lawyer, investor, or acquirer needs a signed confirmation of the above
          for due diligence, email hello@shipmate.dev — we provide one as standard.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
