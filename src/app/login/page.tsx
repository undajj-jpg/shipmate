import { AuthCard } from "@/components/marketing/auth-card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  return <AuthCard mode="login" redirectTo={redirectTo || "/app"} />;
}
