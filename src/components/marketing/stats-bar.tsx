import { Reveal } from "@/components/marketing/reveal";

const STATS = [
  { value: "48h", label: "average turnaround", color: "text-green" },
  { value: "100%", label: "code ownership", color: "text-blue" },
  { value: "1-to-1", label: "dedicated developer", color: "text-violet" },
  { value: "0", label: "scoping calls or quotes", color: "text-pink" },
];

export function StatsBar() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-4">
      <Reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white px-5 py-6 text-center">
            <div
              className={`font-display text-3xl font-bold tracking-[-0.02em] ${s.color}`}
            >
              {s.value}
            </div>
            <div className="mt-1 text-[13px] text-muted-ink">{s.label}</div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
