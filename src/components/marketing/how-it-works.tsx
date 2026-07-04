import { Reveal } from "@/components/marketing/reveal";

const STEPS = [
  {
    step: "01",
    title: "Subscribe",
    body: "Pick a plan and tell us what you're building. Within a day, you're paired with a dedicated developer who knows your project inside out.",
    ring: "from-green to-blue",
    text: "text-green",
  },
  {
    step: "02",
    title: "Chat your requests",
    body: "Message your developer directly in your Shipmate dashboard. Request features, fixes, and changes as often as you like — one active request at a time.",
    ring: "from-blue to-violet",
    text: "text-blue",
  },
  {
    step: "03",
    title: "Watch it ship",
    body: "Every change is built, tested, and deployed straight to production on Vercel. You see the live deploy status in the same chat.",
    ring: "from-violet to-pink",
    text: "text-violet",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-16 px-6 py-19">
      <Reveal className="mb-11 max-w-[60ch]">
        <h2 className="mb-3 font-display text-[clamp(28px,3.4vw,38px)] font-semibold leading-[1.15] tracking-[-0.02em] text-ink">
          How it works
        </h2>
        <p className="text-lg text-muted-ink">
          No scoping calls, no quotes, no change orders. A subscription that ships.
        </p>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal
            key={s.step}
            delay={i * 110}
            className="group relative overflow-hidden rounded-[16px] border border-hairline bg-white p-6.5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(16,24,43,0.25)]"
          >
            <div
              className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.ring} font-display text-lg font-bold text-white shadow-sm`}
            >
              {s.step}
            </div>
            <h3 className="mb-2 font-display text-xl font-semibold text-ink">{s.title}</h3>
            <p className="text-[15.5px] leading-relaxed text-muted-ink">{s.body}</p>
            <div
              className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.ring} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
