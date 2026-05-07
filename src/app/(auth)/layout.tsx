// src/app/(auth)/layout.tsx
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  // Redirect to dashboard if already logged in
  if (session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
