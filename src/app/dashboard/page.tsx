import { auth } from "@/lib/auth";

export const metadata = { title: "Dashboard — TaskFlow" };

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">
        Hola, {session?.user?.name ?? session?.user?.email ?? "tú"} 👋
      </h1>
      <p className="text-[var(--muted-foreground)]">
        Las tareas llegan en el siguiente commit.
      </p>
    </div>
  );
}
