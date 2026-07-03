import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { emailSignIn, googleSignIn } from "@/lib/auth-actions";

export function AuthCard({
  mode,
  redirectTo,
}: {
  mode: "login" | "signup";
  redirectTo: string;
}) {
  const isSignup = mode === "signup";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-white p-8">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          Shipmate
        </Link>
        <h1 className="mt-6 font-display text-2xl font-semibold text-ink">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted-ink">
          {isSignup
            ? "Get a dedicated developer in five minutes."
            : "Sign in to your Shipmate portal."}
        </p>

        <form action={googleSignIn} className="mt-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button type="submit" variant="outline" className="w-full border-hairline">
            Continue with Google
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-ink">
          <div className="h-px flex-1 bg-hairline" />
          or
          <div className="h-px flex-1 bg-hairline" />
        </div>

        <form action={emailSignIn} className="flex flex-col gap-3">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required />
          <Button type="submit" className="mt-1 bg-green text-white hover:bg-green/90">
            Send magic link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-ink">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-ink hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New to Shipmate?{" "}
              <Link href="/signup" className="font-medium text-ink hover:underline">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
