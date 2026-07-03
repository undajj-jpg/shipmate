const CATEGORIES = [
  { title: "Marketing sites", body: "Fast, on-brand sites that turn into leads." },
  { title: "Landing pages", body: "Launch pages built to test and convert." },
  { title: "SaaS products", body: "Full product builds — auth, billing, dashboards." },
  { title: "Automations", body: "Internal tools and workflows that save your team hours." },
];

export function WhatWeBuild() {
  return (
    <section id="what-we-build" className="border-y border-hairline bg-white/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          What we build
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <div key={c.title} className="rounded-2xl border border-hairline bg-background p-6">
              <h3 className="font-display text-lg font-semibold text-ink">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-ink">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
