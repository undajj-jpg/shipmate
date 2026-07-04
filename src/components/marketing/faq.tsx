const FAQS = [
  {
    q: "What does “unlimited requests” actually mean?",
    a: "Add as many requests to your queue as you like. Your developer works on one at a time, ships it, then picks up the next. Most requests ship within 48 hours; larger features are broken into shippable pieces so you see progress constantly.",
  },
  {
    q: "Who owns the code?",
    a: "You do — completely. The repository is yours from day one. If you ever leave, you take everything with you.",
  },
  {
    q: "How is AI involved?",
    a: "Your developer works with AI coding tools to move several times faster than a traditional agency. Every line is reviewed and tested by your developer before it ships. You get AI speed with human accountability.",
  },
  {
    q: "Are hosting and AI costs included?",
    a: "Your subscription covers the development service. Infrastructure — Vercel hosting, database, domain, AI usage — is billed separately at cost, with no markup, because it varies with each product's traffic and usage. Typical small projects run $5–50/month. You see an itemized breakdown on every invoice and can check current usage anytime in your billing screen.",
  },
  {
    q: "What happens when I switch to Maintain?",
    a: "Your product stays live, monitored, and patched for a monthly rate based on what we're maintaining — $50 for a landing page, $75 for a website, $100 for an automation, $150 for a SaaS app. Bug fixes are included; new features aren't. Whenever you want to build again, switch back to Build and your same developer picks up where you left off.",
  },
  {
    q: "Can I really cancel anytime?",
    a: "Yes. Plans are month to month with no minimum commitment. You keep the code and we'll help you migrate hosting if you want to leave entirely.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-6xl scroll-mt-16 px-6 pb-19">
      <div className="mb-8 max-w-[60ch]">
        <h2 className="font-display text-[clamp(28px,3.4vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
          Questions, answered
        </h2>
      </div>
      <div className="max-w-[760px]">
        {FAQS.map((item) => (
          <details key={item.q} className="group border-b border-hairline py-4.5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="font-mono text-xl text-muted-ink group-open:hidden">+</span>
              <span className="hidden font-mono text-xl text-muted-ink group-open:inline">
                –
              </span>
            </summary>
            <p className="max-w-[64ch] pt-2.5 text-[15.5px] leading-relaxed text-muted-ink">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
