import { cn } from "@/lib/utils";

export type DeploymentRow = {
  id: string;
  state: "building" | "ready" | "error" | "canceled";
  commitMessage: string | null;
  url: string | null;
  startedAt: string;
  readyAt: string | null;
};

const STATE_STYLES: Record<DeploymentRow["state"], string> = {
  ready: "bg-green-tint text-green",
  building: "bg-background text-muted-ink",
  error: "bg-red-50 text-red-600",
  canceled: "bg-background text-muted-ink",
};

function durationOf(startedAt: string, readyAt: string | null): string | null {
  if (!readyAt) return null;
  const secs = Math.round(
    (new Date(readyAt).getTime() - new Date(startedAt).getTime()) / 1000
  );
  if (secs < 0) return null;
  return secs < 60 ? `${secs}s` : `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export function DeploymentList({ deployments }: { deployments: DeploymentRow[] }) {
  if (deployments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-hairline px-4 py-5 text-center text-sm text-muted-ink">
        No deployments yet — the first one appears here, and as a card in your chat, the
        moment your developer ships.
      </p>
    );
  }

  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-white">
      {deployments.map((d) => {
        const duration = durationOf(d.startedAt, d.readyAt);
        return (
          <div key={d.id} className="flex items-center gap-3 px-4 py-3">
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10.5px]",
                STATE_STYLES[d.state]
              )}
            >
              {d.state}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">
                {d.commitMessage ?? "Deployment"}
              </p>
              <p className="font-mono text-[11px] text-muted-ink">
                {new Date(d.startedAt).toLocaleString()}
                {duration && ` · ${duration}`}
              </p>
            </div>
            {d.url && (
              <a
                href={`https://${d.url.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-mono text-[11px] text-ink underline underline-offset-2"
              >
                view ↗
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
