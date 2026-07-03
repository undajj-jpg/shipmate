import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { WhatWeBuild } from "@/components/marketing/what-we-build";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { CTABand } from "@/components/marketing/cta-band";
import { MarketingFooter } from "@/components/marketing/footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <WhatWeBuild />
        <Pricing />
        <FAQ />
        <CTABand />
      </main>
      <MarketingFooter />
    </div>
  );
}
