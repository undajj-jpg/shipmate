import { redirect } from "next/navigation";

// The portal's home is the chat — the core screen.
export default function AppPage() {
  redirect("/app/chat");
}
