"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { sendMessage, fetchMessages, type ChatMessage } from "@/lib/message-actions";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

const POLL_MS = 5000;

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function DeployCard({ msg }: { msg: ChatMessage }) {
  const meta = msg.deployMeta;
  const failed = meta?.state === "error";
  return (
    <div
      className={cn(
        "rounded-[10px] border px-3.5 py-2.5 font-mono text-[13px]",
        failed
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-green/45 bg-green/10 text-[#0B7A4C]"
      )}
    >
      <span
        className={cn(
          "mr-2 inline-block h-2 w-2 rounded-full",
          failed ? "bg-red-500" : "animate-ship-pulse bg-green"
        )}
      />
      {msg.body}
      {meta?.url && (
        <>
          {" · "}
          <a
            href={`https://${meta.url.replace(/^https?:\/\//, "")}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {meta.url.replace(/^https?:\/\//, "")}
          </a>
        </>
      )}
      {" · "}
      {timeOf(msg.createdAt)}
    </div>
  );
}

export function ChatScreen({
  projectId,
  initialMessages,
  currentUserId,
  canSend = true,
  emptyState,
}: {
  projectId: string;
  initialMessages: ChatMessage[];
  currentUserId: string;
  canSend?: boolean;
  emptyState?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, startSending] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const mergeNew = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;
    setMessages((prev) => {
      const known = new Set(prev.map((m) => m.id));
      const fresh = incoming.filter((m) => !known.has(m.id));
      return fresh.length === 0 ? prev : [...prev, ...fresh];
    });
  }, []);

  const pullLatest = useCallback(async () => {
    const last = messagesRef.current[messagesRef.current.length - 1];
    try {
      const fresh = await fetchMessages({
        projectId,
        after: last?.createdAt,
      });
      mergeNew(fresh);
    } catch {
      // transient — next poll retries
    }
  }, [projectId, mergeNew]);

  // Realtime via Supabase when configured; polling as fallback/backup.
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | undefined;
    if (supabase) {
      channel = supabase
        .channel(`messages:${projectId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `project_id=eq.${projectId}`,
          },
          () => void pullLatest()
        )
        .subscribe();
    }
    const interval = window.setInterval(() => void pullLatest(), POLL_MS);
    return () => {
      window.clearInterval(interval);
      if (supabase && channel) void supabase.removeChannel(channel);
    };
  }, [projectId, pullLatest]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const submit = () => {
    const body = draft.trim();
    if (!body || isSending) return;
    setDraft("");
    startSending(async () => {
      try {
        await sendMessage({ projectId, body });
        await pullLatest();
      } catch {
        setDraft(body); // restore so nothing is lost
      }
    });
  };

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-[420px] flex-col rounded-2xl border border-hairline bg-white md:h-[calc(100dvh-10.5rem)]">
      <div className="flex-1 space-y-3.5 overflow-y-auto p-4 sm:p-5">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="max-w-xs text-center text-sm text-muted-ink">
              {emptyState ??
                "Say hello — this chat goes straight to your developer. Most first requests ship within 48 hours."}
            </p>
          </div>
        )}
        {messages.map((msg) => {
          if (msg.type === "deploy") {
            return <DeployCard key={msg.id} msg={msg} />;
          }
          if (msg.type === "system") {
            return (
              <div key={msg.id} className="font-mono text-[12.5px] text-muted-ink">
                → {msg.body}
                <span className="ml-2 opacity-60">{timeOf(msg.createdAt)}</span>
              </div>
            );
          }
          const mine = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={cn("flex flex-col", mine && "items-end")}>
              <span className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.05em] text-muted-ink">
                {mine ? "You" : (msg.senderName?.split(" ")[0] ?? "Team")} ·{" "}
                {timeOf(msg.createdAt)}
              </span>
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-[14.5px] leading-relaxed sm:max-w-[70%]",
                  mine
                    ? "bg-ink text-white"
                    : "border border-hairline bg-background text-ink"
                )}
              >
                {msg.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {canSend && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-end gap-2.5 border-t border-hairline p-3.5"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Message your developer…"
            className="max-h-40 min-h-[42px] flex-1 resize-y rounded-[10px] border border-hairline bg-background px-3.5 py-2.5 text-[14.5px] text-ink outline-none placeholder:text-muted-ink/70 focus:border-ink"
          />
          <button
            type="submit"
            disabled={isSending || draft.trim().length === 0}
            className="rounded-[10px] bg-ink px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:-translate-y-px enabled:hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)] disabled:opacity-40"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
