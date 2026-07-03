const CATEGORIES = [
  {
    tag: "web",
    title: "Websites",
    body: "Fast, modern sites with CMS, SEO, and analytics baked in.",
  },
  {
    tag: "launch",
    title: "Landing pages",
    body: "Conversion-focused pages, shipped in days, iterated weekly.",
  },
  {
    tag: "product",
    title: "SaaS apps",
    body: "Auth, billing, dashboards — a real product, not a prototype.",
  },
  {
    tag: "ops",
    title: "Automations",
    body: "Connect your tools and remove the manual work from your week.",
  },
];

export function WhatWeBuild() {
  return (
    <section id="what-we-build" className="mx-auto max-w-6xl scroll-mt-16 px-6 pb-19">
      <div className="mb-11 max-w-[60ch]">
        <h2 className="mb-3 font-display text-[clamp(28px,3.4vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
          What we build
        </h2>
        <p className="text-lg text-muted-ink">
          Full-stack products, end to end — from the first landing page to the automation
          that runs your back office.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {CATEGORIES.map((c) => (
          <div key={c.tag} className="rounded-[14px] border border-hairline bg-white p-5.5">
            <span className="mb-3 inline-block rounded-md bg-green-tint px-2 py-[3px] font-mono text-[11px] text-green">
              {c.tag}
            </span>
            <h3 className="mb-1.5 font-display text-lg font-semibold text-ink">{c.title}</h3>
            <p className="text-[14.5px] leading-relaxed text-muted-ink">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
