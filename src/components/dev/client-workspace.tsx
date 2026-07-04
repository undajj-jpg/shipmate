"use client";

import { useState } from "react";
import { ChatScreen } from "@/components/chat/chat-screen";
import { RequestControls, type DevRequest } from "@/components/dev/request-controls";
import { DeploymentList, type DeploymentRow } from "@/components/deployments/deployment-list";
import type { ChatMessage } from "@/lib/message-actions";
import { cn } from "@/lib/utils";

type Tab = "chat" | "requests" | "deploys";

export function ClientWorkspace({
  projectId,
  messages,
  requests,
  deployments,
  currentUserId,
}: {
  projectId: string;
  messages: ChatMessage[];
  requests: DevRequest[];
  deployments: DeploymentRow[];
  currentUserId: string;
}) {
  const [tab, setTab] = useState<Tab>("chat");
  const queueCount = requests.filter(
    (r) => r.status === "queued" || r.status === "active" || r.status === "in_review"
  ).length;

  const tabs: { id: Tab; label: string }[] = [
    { id: "chat", label: "Chat" },
    { id: "requests", label: `Requests${queueCount ? ` · ${queueCount}` : ""}` },
    { id: "deploys", label: "Deploys" },
  ];

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-xl border border-hairline bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === t.id ? "bg-ink text-white" : "text-muted-ink hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "chat" && (
        <ChatScreen
          projectId={projectId}
          initialMessages={messages}
          currentUserId={currentUserId}
          emptyState="No messages yet. Say hello to your client and kick off their first request."
        />
      )}
      {tab === "requests" && <RequestControls requests={requests} />}
      {tab === "deploys" && <DeploymentList deployments={deployments} />}
    </div>
  );
}
