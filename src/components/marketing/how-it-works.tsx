const STEPS = [
  {
    step: "Step 1",
    title: "Subscribe",
    body: "Pick a plan and tell us what you're building. Within a day, you're paired with a dedicated developer who knows your project inside out.",
  },
  {
    step: "Step 2",
    title: "Chat your requests",
    body: "Message your developer directly in your Shipmate dashboard. Request features, fixes, and changes as often as you like — one active request at a time.",
  },
  {
    step: "Step 3",
    title: "Watch it ship",
    body: "Every change is built, tested, and deployed straight to production on Vercel. You see the live deploy status in the same chat.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-19">
      <div className="mb-11 max-w-[60ch]">
        <h2 className="mb-3 font-display text-[clamp(28px,3.4vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
          How it works
        </h2>
        <p className="text-lg text-muted-ink">
          No scoping calls, no quotes, no change orders. A subscription that ships.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.step} className="rounded-[14px] border border-hairline bg-white p-6.5">
            <div className="mb-3.5 font-mono text-[13px] font-medium text-green">{s.step}</div>
            <h3 className="mb-2 font-display text-xl font-semibold text-ink">{s.title}</h3>
            <p className="text-[15.5px] leading-relaxed text-muted-ink">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
