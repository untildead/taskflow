import Link from "next/link";
import { ListChecks } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { auth } from "@/lib/auth";

export async function Header() {
  const session = await auth();
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-semibold">
          <ListChecks className="size-5 text-[var(--primary)]" />
          TaskFlow
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {session?.user && <UserMenu user={session.user} />}
        </div>
      </div>
    </header>
  );
}
