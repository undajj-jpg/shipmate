import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Full client portal is built in Phase 3.
export default async function AppPlaceholderPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?redirectTo=/app");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm rounded-2xl border border-hairline bg-white p-8 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">You&apos;re in, {session.user.name?.split(" ")[0] ?? "there"}.</h1>
        <p className="mt-2 text-sm text-muted-ink">
          The full client portal (chat, requests, project) is coming next.
        </p>
      </div>
    </div>
  );
}
