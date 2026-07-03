"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type FeedItem =
  | { type: "client"; body: string }
  | { type: "system"; body: string }
  | { type: "dev"; body: string }
  | { type: "deploy"; body: string; url: string; duration: string };

const SCRIPT: FeedItem[] = [
  { type: "client", body: "Can we make the hero CTA green and add social proof under it?" },
  { type: "dev", body: "On it — swapping the CTA and pulling in your last 3 client logos." },
  { type: "system", body: "commit 4a91f2c · \"hero: green cta + logo strip\"" },
  { type: "system", body: "build passed · 3 checks · 42s" },
  { type: "deploy", body: "Deployed to production", url: "acme.shipmate.app", duration: "58s" },
];

const STEP_MS = 2600;

export function HeroFeed() {
  const [visibleCount, setVisibleCount] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleCount(SCRIPT.length);
      return;
    }

    const interval = setInterval(() => {
      setVisibleCount((count) => {
        if (count >= SCRIPT.length) {
          return 1;
        }
        return count + 1;
      });
    }, STEP_MS);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  const items = SCRIPT.slice(0, visibleCount);

  return (
    <div className="rounded-2xl border border-hairline bg-panel p-4 sm:p-6 shadow-[0_20px_60px_-15px_rgba(14,21,36,0.5)]">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
        <span className="h-2.5 w-2.5 rounded-full bg-green" />
        <span className="font-mono text-xs text-panel-foreground/60">
          acme-co · #247 · dev chat
        </span>
      </div>
      <div className="flex flex-col gap-3 min-h-[280px]">
        {items.map((item, i) => (
          <FeedRow key={i} item={item} isLatest={i === items.length - 1 && !reducedMotion} />
        ))}
      </div>
    </div>
  );
}

function FeedRow({ item, isLatest }: { item: FeedItem; isLatest: boolean }) {
  const base = "animate-in fade-in slide-in-from-bottom-2 duration-500";

  if (item.type === "system") {
    return (
      <div className={cn("font-mono text-xs text-panel-foreground/50 pl-1", isLatest && base)}>
        {item.body}
      </div>
    );
  }

  if (item.type === "deploy") {
    return (
      <div
        className={cn(
          "rounded-xl border border-green/40 bg-green/10 px-4 py-3",
          isLatest && base
        )}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
          {item.body}
        </div>
        <div className="mt-1 font-mono text-xs text-green/70">
          {item.url} · {item.duration}
        </div>
      </div>
    );
  }

  const isClient = item.type === "client";
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl px-4 py-2.5 max-w-[85%] text-sm leading-relaxed",
        isClient
          ? "bg-white/5 text-panel-foreground self-start"
          : "bg-panel-foreground/95 text-ink self-end ml-auto",
        isLatest && base
      )}
    >
      <span className="text-[11px] font-mono uppercase tracking-wide opacity-50">
        {isClient ? "You" : "Developer"}
      </span>
      {item.body}
    </div>
  );
}
