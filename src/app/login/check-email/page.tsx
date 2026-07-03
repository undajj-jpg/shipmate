export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm rounded-2xl border border-hairline bg-white p-8 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">Check your email</h1>
        <p className="mt-2 text-sm text-muted-ink">
          We sent you a magic link. Click it to sign in to Shipmate.
        </p>
      </div>
    </div>
  );
}
