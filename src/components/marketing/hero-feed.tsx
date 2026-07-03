"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MESSAGE_COUNT = 5;
const FIRST_DELAY_MS = 600;
const STAGGER_MS = 1100;
const LOOP_MS = 11000;

export function HeroFeed() {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(MESSAGE_COUNT);
      return;
    }

    const timeouts: number[] = [];
    const run = () => {
      setShown(0);
      for (let i = 0; i < MESSAGE_COUNT; i++) {
        timeouts.push(
          window.setTimeout(() => setShown(i + 1), FIRST_DELAY_MS + i * STAGGER_MS)
        );
      }
    };

    run();
    const interval = window.setInterval(run, LOOP_MS);
    return () => {
      window.clearInterval(interval);
      timeouts.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const msg = (i: number) =>
    cn(
      "transition-all duration-500",
      shown > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1.5"
    );

  return (
    <div
      aria-label="Example of a request being shipped"
      className="min-h-[380px] rounded-2xl border border-panel-line bg-panel p-5 font-mono text-[13.5px] leading-relaxed text-panel-text shadow-[0_24px_60px_-24px_rgba(14,21,36,0.45)] sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-panel-line pb-3.5 text-xs text-[#7787A3]">
        <span className="flex gap-[5px]">
          <span className="h-[9px] w-[9px] rounded-full bg-[#2C3A57]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#2C3A57]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#2C3A57]" />
        </span>
        <span>shipmate — project: acme-store</span>
      </div>

      <div className={cn("mb-3.5", msg(0))}>
        <div className="mb-1 text-[11px] uppercase tracking-[0.05em] text-[#7787A3]">
          You · 10:42
        </div>
        <div className="inline-block max-w-[92%] rounded-[10px] border border-panel-line bg-[#1A2440] px-3.5 py-2.5">
          Can you add Stripe checkout to the pricing page?
        </div>
      </div>

      <div className={cn("mb-3.5", msg(1))}>
        <div className="mb-1 text-[11px] uppercase tracking-[0.05em] text-[#7787A3]">
          Dev · 10:44
        </div>
        <div className="inline-block max-w-[92%] rounded-[10px] border border-panel-line bg-[#1A2440] px-3.5 py-2.5">
          On it. Shipping within the hour.{" "}
          <span className="animate-blink inline-block h-[15px] w-2 translate-y-[2px] bg-green" />
        </div>
      </div>

      <div className={cn("mb-3.5 text-[#8FA0C0]", msg(2))}>
        → commit <span className="text-white">f3a91c</span> · add stripe checkout + webhooks
      </div>

      <div className={cn("mb-3.5 text-[#8FA0C0]", msg(3))}>
        → build <span className="text-green">passed</span> · 42s
      </div>

      <div className={msg(4)}>
        <div className="rounded-[10px] border border-green/45 bg-green/10 px-3.5 py-2.5 text-[#B9E8D2]">
          <span className="animate-ship-pulse mr-2 inline-block h-2 w-2 rounded-full bg-green" />
          Deployed to production · acme-store.com · 11:31
        </div>
      </div>
    </div>
  );
}
