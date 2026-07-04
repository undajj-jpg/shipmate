"use client";

import { useState, useTransition } from "react";
import { startRequest, markInReview, shipRequest } from "@/lib/dev-actions";
import { cn } from "@/lib/utils";

export type DevRequest = {
  id: string;
  title: string;
  description: string | null;
  kind: "feature" | "bug";
  status: "queued" | "active" | "in_review" | "shipped" | "archived";
  position: number;
};

function KindTag({ kind }: { kind: "feature" | "bug" }) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 font-mono text-[10.5px]",
        kind === "bug" ? "bg-red-50 text-red-600" : "bg-green-tint text-green"
      )}
    >
      {kind}
    </span>
  );
}

function ShipDialog({
  request,
  onClose,
}: {
  request: DevRequest;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [isPending, start] = useTransition();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-ink">
          Ship “{request.title}”
        </h3>
        <p className="mt-1 text-sm text-muted-ink">
          Posts a system message to the client&apos;s chat and emails them. A deploy from
          the last hour is linked automatically.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Optional note to the client…"
          className="mt-4 w-full resize-y rounded-[10px] border border-hairline bg-background px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink"
        />
        <div className="mt-4 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-[10px] border-[1.5px] border-hairline px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Cancel
          </button>
          <button
            disabled={isPending}
            onClick={() =>
              start(async () => {
                await shipRequest({ requestId: request.id, note: note.trim() || undefined });
                onClose();
              })
            }
            className="rounded-[10px] bg-green px-4 py-2 text-sm font-semibold text-[#06271A] transition hover:-translate-y-px disabled:opacity-40"
          >
            Mark shipped
          </button>
        </div>
      </div>
    </div>
  );
}

export function RequestControls({ requests }: { requests: DevRequest[] }) {
  const [isPending, start] = useTransition();
  const [shipping, setShipping] = useState<DevRequest | null>(null);

  const active = requests.filter(
    (r) => r.status === "active" || r.status === "in_review"
  );
  const queued = requests
    .filter((r) => r.status === "queued")
    .sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
          Active
        </h3>
        {active.length === 0 ? (
          <p className="rounded-xl border border-dashed border-hairline px-4 py-4 text-center text-sm text-muted-ink">
            Nothing active. Start the next queued request below.
          </p>
        ) : (
          active.map((r) => (
            <div
              key={r.id}
              className="mb-2 rounded-xl border-[1.5px] border-ink bg-white p-4"
            >
              <div className="flex items-center gap-2">
                <span className="animate-ship-pulse inline-block h-2 w-2 rounded-full bg-green" />
                <span className="text-sm font-semibold text-ink">{r.title}</span>
                <KindTag kind={r.kind} />
                {r.status === "in_review" && (
                  <span className="rounded-md bg-background px-1.5 py-0.5 font-mono text-[10.5px] text-muted-ink">
                    in review
                  </span>
                )}
              </div>
              {r.description && (
                <p className="mt-1.5 text-[13px] text-muted-ink">{r.description}</p>
              )}
              <div className="mt-3 flex gap-2">
                {r.status === "active" && (
                  <button
                    disabled={isPending}
                    onClick={() => start(() => markInReview({ requestId: r.id }))}
                    className="rounded-lg border-[1.5px] border-hairline px-3 py-1.5 text-[13px] font-semibold text-ink transition hover:border-ink disabled:opacity-40"
                  >
                    Mark in review
                  </button>
                )}
                <button
                  onClick={() => setShipping(r)}
                  className="rounded-lg bg-green px-3 py-1.5 text-[13px] font-semibold text-[#06271A] transition hover:-translate-y-px"
                >
                  Mark shipped
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <section>
        <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
          Queued
        </h3>
        {queued.length === 0 ? (
          <p className="rounded-xl border border-dashed border-hairline px-4 py-4 text-center text-sm text-muted-ink">
            Queue is empty.
          </p>
        ) : (
          <div className="space-y-2">
            {queued.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-white p-3.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">
                      {r.title}
                    </span>
                    <KindTag kind={r.kind} />
                  </div>
                  {r.description && (
                    <p className="mt-0.5 line-clamp-1 text-[13px] text-muted-ink">
                      {r.description}
                    </p>
                  )}
                </div>
                <button
                  disabled={isPending}
                  onClick={() => start(() => startRequest({ requestId: r.id }))}
                  className="shrink-0 rounded-lg bg-ink px-3 py-1.5 text-[13px] font-semibold text-white transition hover:-translate-y-px disabled:opacity-40"
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {shipping && (
        <ShipDialog request={shipping} onClose={() => setShipping(null)} />
      )}
    </div>
  );
}
