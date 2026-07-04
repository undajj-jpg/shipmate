"use server";

import { signIn, signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function emailSignIn(formData: FormData) {
  const email = formData.get("email");
  const redirectTo = (formData.get("redirectTo") as string) || "/app";
  await signIn("resend", { email, redirectTo });
}

export async function googleSignIn(formData: FormData) {
  const redirectTo = (formData.get("redirectTo") as string) || "/app";
  await signIn("google", { redirectTo });
}
