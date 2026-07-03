const STEPS = [
  {
    step: "01",
    title: "Subscribe & onboard",
    body: "Tell us what you're building — a site, a SaaS, an automation. Pick Build or Maintain.",
  },
  {
    step: "02",
    title: "Chat with your developer",
    body: "Every request goes straight to the developer working on your project. No forms, no tickets.",
  },
  {
    step: "03",
    title: "Watch it ship",
    body: "Changes deploy straight to production on Vercel. You see the commit, the build, and the live URL.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">How it works</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.step} className="rounded-2xl border border-hairline bg-white p-6">
            <span className="font-mono text-sm text-green">{s.step}</span>
            <h3 className="mt-3 font-display text-xl font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-ink">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
