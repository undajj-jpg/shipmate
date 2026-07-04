"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The hero's signature animation: one full Shipmate loop —
 * client brief → paired with a developer → commits → build → deploy →
 * the live product → happy client. Auto-scrolls like a real chat.
 */
const STEP_COUNT = 9;
const FIRST_DELAY_MS = 700;
const STAGGER_MS = 1250;
const HOLD_MS = 4500; // linger on the finished story before looping
const LOOP_MS = FIRST_DELAY_MS + STEP_COUNT * STAGGER_MS + HOLD_MS;

function Who({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1 text-[11px] uppercase tracking-[0.05em] text-[#7787A3]">
      {children}
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block max-w-[92%] rounded-[10px] border border-panel-line bg-[#1A2440] px-3.5 py-2.5">
      {children}
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-panel-line bg-white">
      <div className="flex items-center gap-1.5 border-b border-hairline bg-[#F4F6FA] px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
        <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
        <span className="ml-1 font-mono text-[10px] text-muted-ink">
          zenflow-studio.com
        </span>
        <span className="ml-auto flex items-center gap-1 font-mono text-[9.5px] text-green">
          <span className="inline-block h-1.5 w-1.5 animate-ship-pulse rounded-full bg-green" />
          live
        </span>
      </div>
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="h-1.5 w-7 rounded-full bg-ink/70" />
          <span className="flex gap-1">
            <span className="h-1 w-4 rounded-full bg-[#D9E0EB]" />
            <span className="h-1 w-4 rounded-full bg-[#D9E0EB]" />
            <span className="h-1 w-4 rounded-full bg-[#D9E0EB]" />
          </span>
        </div>
        <div className="mb-1 h-2 w-3/5 rounded-full bg-ink/75" />
        <div className="mb-2 h-1.5 w-2/5 rounded-full bg-[#D9E0EB]" />
        <div className="flex items-end justify-between">
          <div className="grid grid-cols-7 gap-[3px]">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-[2px]",
                  i === 9 ? "bg-green" : "bg-[#E8EDF4]"
                )}
              />
            ))}
          </div>
          <span className="h-3.5 w-12 rounded-[5px] bg-green" />
        </div>
      </div>
    </div>
  );
}

export function HeroFeed() {
  const [shown, setShown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reducedRef.current = true;
      setShown(STEP_COUNT);
      return;
    }
    const timeouts: number[] = [];
    const run = () => {
      setShown(0);
      for (let i = 0; i < STEP_COUNT; i++) {
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

  const scrollToEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reducedRef.current ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    // after the newest step renders, follow it like a live chat
    const t = window.setTimeout(scrollToEnd, 60);
    return () => window.clearTimeout(t);
  }, [shown, scrollToEnd]);

  const step = (i: number) =>
    cn(
      "transition-all duration-500",
      shown > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1.5"
    );

  return (
    <div
      aria-label="One Shipmate loop: brief, pairing, build, deploy, live product"
      className="rounded-2xl border border-panel-line bg-panel p-5 font-mono text-[13.5px] leading-relaxed text-panel-text shadow-[0_24px_60px_-24px_rgba(14,21,36,0.45)] sm:p-6"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-panel-line pb-3.5 text-xs text-[#7787A3]">
        <span className="flex gap-[5px]">
          <span className="h-[9px] w-[9px] rounded-full bg-[#2C3A57]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#2C3A57]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#2C3A57]" />
        </span>
        <span>shipmate — project: zenflow-studio</span>
      </div>

      <div
        ref={scrollRef}
        className="flex h-[360px] flex-col gap-3.5 overflow-y-hidden sm:h-[380px]"
      >
        {/* 1 · the brief */}
        <div className={step(0)}>
          <Who>You · 10:02</Who>
          <Bubble>
            I want a booking site for my yoga studio — calendar, payments, reminders.
          </Bubble>
        </div>

        {/* 2 · paired with a developer */}
        <div className={step(1)}>
          <div className="rounded-[10px] border border-blue/40 bg-blue/10 px-3.5 py-2.5 text-[#AFC6FF]">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue" />
            Paired with <span className="text-white">Dana</span> · senior developer + AI
          </div>
        </div>

        {/* 3 · dev says hello */}
        <div className={step(2)}>
          <Who>Dana · 10:09</Who>
          <Bubble>
            Hi, I&apos;m Dana 👋 On it — you&apos;ll see the first version today.
          </Bubble>
        </div>

        {/* 4-6 · the build */}
        <div className={cn("text-[#8FA0C0]", step(3))}>
          → commit <span className="text-white">4a91f2</span> · scaffold + booking calendar
        </div>
        <div className={cn("text-[#8FA0C0]", step(4))}>
          → commit <span className="text-white">b7e03d</span> · stripe payments + email
          reminders
        </div>
        <div className={cn("text-[#8FA0C0]", step(5))}>
          → build <span className="text-green">passed</span> · 3 checks · 42s
        </div>

        {/* 7 · deploy */}
        <div className={step(6)}>
          <div className="rounded-[10px] border border-green/45 bg-green/10 px-3.5 py-2.5 text-[#B9E8D2]">
            <span className="animate-ship-pulse mr-2 inline-block h-2 w-2 rounded-full bg-green" />
            Deployed to production · zenflow-studio.com · 18:34
          </div>
        </div>

        {/* 8 · the live product */}
        <div className={step(7)}>
          <Who>Dana · 18:35</Who>
          <ProductPreview />
        </div>

        {/* 9 · happy client */}
        <div className={cn("pb-1", step(8))}>
          <Who>You · 18:41</Who>
          <Bubble>It&apos;s live and it&apos;s beautiful. Taking bookings tonight 🎉</Bubble>
        </div>
      </div>
    </div>
  );
}
