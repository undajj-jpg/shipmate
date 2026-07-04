import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getClientContext } from "@/lib/guards";
import { fetchMessages } from "@/lib/message-actions";
import { ChatScreen } from "@/components/chat/chat-screen";

export default async function ChatPage() {
  const { userId, client } = await getClientContext();

  const project = await db.query.projects.findFirst({
    where: eq(projects.clientId, client.id),
  });

  if (!project) {
    return (
      <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
        <p className="text-sm text-muted-ink">
          Your project is being set up — check back in a moment.
        </p>
      </div>
    );
  }

  const messages = await fetchMessages({ projectId: project.id });

  return (
    <ChatScreen
      projectId={project.id}
      initialMessages={messages}
      currentUserId={userId}
    />
  );
}
