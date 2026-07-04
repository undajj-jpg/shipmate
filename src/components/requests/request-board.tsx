"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createRequest, reorderQueue, archiveRequest } from "@/lib/request-actions";
import { cn } from "@/lib/utils";

export type BoardRequest = {
  id: string;
  title: string;
  description: string | null;
  kind: "feature" | "bug";
  status: "queued" | "active" | "in_review" | "shipped" | "archived";
  position: number;
  createdAt: string;
  shippedAt: string | null;
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

function QueueCard({
  request,
  onArchive,
  disabled,
}: {
  request: BoardRequest;
  onArchive: (id: string) => void;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: request.id, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-hairline bg-white p-3.5",
        isDragging && "z-10 shadow-[0_12px_32px_-12px_rgba(16,24,43,0.3)]"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className={cn(
          "mt-0.5 cursor-grab touch-none font-mono text-muted-ink/60 hover:text-ink",
          disabled && "cursor-default opacity-30"
        )}
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-ink">{request.title}</span>
          <KindTag kind={request.kind} />
        </div>
        {request.description && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-ink">
            {request.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onArchive(request.id)}
        className="text-[12px] text-muted-ink/70 transition-colors hover:text-red-600"
      >
        Archive
      </button>
    </div>
  );
}

export function RequestBoard({
  projectId,
  requests,
  plan,
}: {
  projectId: string;
  requests: BoardRequest[];
  plan: "build" | "maintain" | "none";
}) {
  const active = requests.filter((r) => r.status === "active" || r.status === "in_review");
  const shipped = requests
    .filter((r) => r.status === "shipped")
    .sort((a, b) => (b.shippedAt ?? "").localeCompare(a.shippedAt ?? ""));
  const [queued, setQueued] = useState(
    requests.filter((r) => r.status === "queued").sort((a, b) => a.position - b.position)
  );

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const maintainOnly = plan === "maintain";
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active: dragged, over } = event;
    if (!over || dragged.id === over.id) return;
    setQueued((items) => {
      const oldIdx = items.findIndex((i) => i.id === dragged.id);
      const newIdx = items.findIndex((i) => i.id === over.id);
      const next = arrayMove(items, oldIdx, newIdx);
      startTransition(async () => {
        try {
          await reorderQueue({ projectId, orderedIds: next.map((i) => i.id) });
        } catch {
          setError("Couldn't save the new order — refresh and try again.");
        }
      });
      return next;
    });
  };

  const submitNew = () => {
    if (!title.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await createRequest({
          projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          kind: maintainOnly ? "bug" : "feature",
        });
        setTitle("");
        setDescription("");
        setShowForm(false);
        window.location.reload();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't create the request");
      }
    });
  };

  const archive = (id: string) => {
    setQueued((q) => q.filter((r) => r.id !== id));
    startTransition(async () => {
      try {
        await archiveRequest({ requestId: id });
      } catch {
        setError("Couldn't archive that request.");
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
          Requests
        </h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(16,24,43,0.18)]"
        >
          {showForm ? "Close" : maintainOnly ? "Report a bug" : "New request"}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <div className="rounded-2xl border border-hairline bg-white p-5">
          {maintainOnly && (
            <p className="mb-4 rounded-lg bg-background px-3.5 py-2.5 text-[13px] text-muted-ink">
              On <strong className="text-ink">Maintain</strong>, requests cover bug fixes
              — something broken that used to work. New features need the Build plan.{" "}
              <Link
                href="/app/billing"
                className="font-medium text-ink underline underline-offset-2"
              >
                Upgrade to Build
              </Link>
            </p>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              maintainOnly ? "What's broken? (one line)" : "What should we build? (one line)"
            }
            className="mb-3 w-full rounded-[10px] border border-hairline bg-background px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted-ink/70 focus:border-ink"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Details, links, examples — anything that helps your developer nail it first try."
            className="mb-3 w-full resize-y rounded-[10px] border border-hairline bg-background px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted-ink/70 focus:border-ink"
          />
          <button
            onClick={submitNew}
            disabled={isPending || !title.trim()}
            className="rounded-[10px] bg-ink px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
          >
            {maintainOnly ? "Submit bug report" : "Add to queue"}
          </button>
        </div>
      )}

      {/* Active */}
      <section>
        <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
          Active
        </h2>
        {active.length === 0 ? (
          <p className="rounded-xl border border-dashed border-hairline px-4 py-5 text-center text-sm text-muted-ink">
            Nothing in flight. Your next queued request starts as soon as your developer
            picks it up.
          </p>
        ) : (
          active.map((r) => (
            <div
              key={r.id}
              className="mb-2 rounded-xl border-[1.5px] border-ink bg-white p-4 shadow-[0_12px_32px_-16px_rgba(16,24,43,0.18)]"
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
            </div>
          ))
        )}
      </section>

      {/* Queue */}
      <section>
        <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
          Queued · drag to reorder
        </h2>
        {queued.length === 0 ? (
          <p className="rounded-xl border border-dashed border-hairline px-4 py-5 text-center text-sm text-muted-ink">
            Add your first request — most ship within 48 hours.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={queued.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {queued.map((r) => (
                  <QueueCard
                    key={r.id}
                    request={r}
                    onArchive={archive}
                    disabled={isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>

      {/* Shipped */}
      <section>
        <h2 className="mb-2.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-ink">
          Shipped
        </h2>
        {shipped.length === 0 ? (
          <p className="rounded-xl border border-dashed border-hairline px-4 py-5 text-center text-sm text-muted-ink">
            Shipped work lands here — with a deploy card in your chat when it goes live.
          </p>
        ) : (
          <div className="space-y-2">
            {shipped.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-hairline bg-white px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-semibold text-green">✓</span>
                  <span className="truncate text-sm text-ink">{r.title}</span>
                  <KindTag kind={r.kind} />
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted-ink">
                  {r.shippedAt ? new Date(r.shippedAt).toLocaleDateString() : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
