"use client";

import * as React from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

type Props = {
  user: { name?: string | null; email?: string | null; image?: string | null };
};

export function UserMenu({ user }: Props) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = (user.name || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="size-9 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] flex items-center justify-center text-sm font-semibold hover:opacity-80 transition"
        aria-label="Menú de usuario"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? user.email ?? ""}
            className="size-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg p-1.5 z-50">
          <div className="px-3 py-2 border-b border-[var(--border)] mb-1.5">
            <div className="font-medium text-sm truncate flex items-center gap-2">
              <UserIcon className="size-3.5 text-[var(--muted-foreground)]" />
              {user.name ?? "Sin nombre"}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</div>
          </div>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
