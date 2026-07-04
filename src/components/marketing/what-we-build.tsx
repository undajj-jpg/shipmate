function WebsiteWire() {
  return (
    <div className="h-28 overflow-hidden rounded-lg border border-hairline bg-[#F4F6FA]">
      <div className="flex items-center gap-1 border-b border-hairline bg-white px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
        <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
        <span className="ml-1.5 h-2 w-16 rounded-full bg-[#EDF1F7]" />
      </div>
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="h-2 w-8 rounded-full bg-ink/70" />
          <span className="flex gap-1.5">
            <span className="h-1.5 w-5 rounded-full bg-[#D9E0EB]" />
            <span className="h-1.5 w-5 rounded-full bg-[#D9E0EB]" />
            <span className="h-1.5 w-5 rounded-full bg-[#D9E0EB]" />
          </span>
        </div>
        <div className="mb-1.5 h-2.5 w-3/4 rounded-full bg-ink/75" />
        <div className="mb-2.5 h-2 w-1/2 rounded-full bg-[#D9E0EB]" />
        <div className="h-4 w-14 rounded-md bg-ink/80 transition-colors duration-300 group-hover:bg-green" />
      </div>
    </div>
  );
}

function LandingWire() {
  return (
    <div className="flex h-28 flex-col items-center justify-center overflow-hidden rounded-lg border border-hairline bg-[#F4F6FA] p-3">
      <span className="mb-2 h-1.5 w-10 rounded-full bg-green/45" />
      <span className="mb-1.5 h-2.5 w-3/5 rounded-full bg-ink/75" />
      <span className="mb-3 h-2.5 w-2/5 rounded-full bg-ink/55" />
      <span className="h-4 w-16 rounded-md bg-ink/80 transition-colors duration-300 group-hover:bg-green" />
    </div>
  );
}

function SaasWire() {
  return (
    <div className="flex h-28 overflow-hidden rounded-lg border border-hairline bg-white">
      <div className="w-1/4 space-y-1.5 border-r border-hairline bg-[#F4F6FA] p-2">
        <span className="block h-1.5 w-full rounded-full bg-ink/60" />
        <span className="block h-1.5 w-4/5 rounded-full bg-[#D9E0EB]" />
        <span className="block h-1.5 w-full rounded-full bg-[#D9E0EB]" />
        <span className="block h-1.5 w-3/5 rounded-full bg-[#D9E0EB]" />
      </div>
      <div className="flex-1 p-2.5">
        <div className="mb-2.5 flex gap-1.5">
          <span className="h-5 flex-1 rounded-md border border-hairline bg-[#F4F6FA]" />
          <span className="h-5 flex-1 rounded-md border border-hairline bg-[#F4F6FA]" />
        </div>
        <div className="flex h-10 items-end gap-1.5">
          <span className="w-1/4 rounded-t-sm bg-[#D9E0EB] transition-all duration-300 [height:40%] group-hover:[height:70%]" />
          <span className="w-1/4 rounded-t-sm bg-[#D9E0EB] transition-all duration-300 [height:60%] group-hover:[height:45%]" />
          <span className="w-1/4 rounded-t-sm bg-[#D9E0EB] transition-all duration-300 [height:30%] group-hover:[height:80%]" />
          <span className="w-1/4 rounded-t-sm bg-green/70 transition-all duration-300 [height:75%] group-hover:[height:100%]" />
        </div>
      </div>
    </div>
  );
}

function AutomationWire() {
  return (
    <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-hairline bg-[#F4F6FA]">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-white">
        <span className="h-2 w-2 rounded-sm bg-ink/60" />
      </span>
      <span className="h-px w-7 border-t border-dashed border-[#AFBBCD]" />
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-white">
        <span className="h-2 w-2 rounded-sm bg-ink/60" />
      </span>
      <span className="h-px w-7 border-t border-dashed border-[#AFBBCD]" />
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hairline bg-white transition-colors duration-300 group-hover:border-green/50 group-hover:bg-green-tint">
        <span className="h-2 w-2 rounded-sm bg-ink/60 transition-colors duration-300 group-hover:bg-green" />
      </span>
    </div>
  );
}

const CATEGORIES = [
  {
    tag: "web",
    title: "Websites",
    body: "Fast, modern sites with CMS, SEO, and analytics baked in.",
    wire: WebsiteWire,
  },
  {
    tag: "launch",
    title: "Landing pages",
    body: "Conversion-focused pages, shipped in days, iterated weekly.",
    wire: LandingWire,
  },
  {
    tag: "product",
    title: "SaaS apps",
    body: "Auth, billing, dashboards — a real product, not a prototype.",
    wire: SaasWire,
  },
  {
    tag: "ops",
    title: "Automations",
    body: "Connect your tools and remove the manual work from your week.",
    wire: AutomationWire,
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <div
            key={c.tag}
            className="group rounded-[14px] border border-hairline bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_12px_32px_-16px_rgba(16,24,43,0.18)]"
          >
            <c.wire />
            <div className="p-1.5 pt-4">
              <span className="mb-2.5 inline-block rounded-md bg-green-tint px-2 py-[3px] font-mono text-[11px] text-green">
                {c.tag}
              </span>
              <h3 className="mb-1.5 font-display text-lg font-semibold text-ink">
                {c.title}
              </h3>
              <p className="text-[14.5px] leading-relaxed text-muted-ink">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
