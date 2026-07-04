import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { TERMS_LAST_UPDATED } from "@/lib/legal";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-xl font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      <div className="space-y-3 text-[15.5px] leading-relaxed text-muted-ink [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <main className="mx-auto max-w-[720px] px-6 pb-20 pt-14">
        <p className="mb-4 font-mono text-[13px] text-muted-ink">
          Last updated: {TERMS_LAST_UPDATED} · Draft
        </p>
        <h1 className="mb-4 font-display text-[clamp(30px,4vw,42px)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
          {title}
        </h1>
        {intro && <p className="mb-10 text-[17px] leading-relaxed text-muted-ink">{intro}</p>}
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
