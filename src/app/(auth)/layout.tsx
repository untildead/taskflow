import Link from "next/link";
import { ListChecks } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold text-[var(--foreground)]"
        >
          <ListChecks className="size-5 text-[var(--primary)]" />
          TaskFlow
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
