import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "client" | "developer" | "admin";
    } & DefaultSession["user"];
  }
}
