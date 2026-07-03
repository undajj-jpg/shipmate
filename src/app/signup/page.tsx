import { AuthCard } from "@/components/marketing/auth-card";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const redirectTo = plan ? `/onboarding?plan=${plan}` : "/onboarding";
  return <AuthCard mode="signup" redirectTo={redirectTo} />;
}
