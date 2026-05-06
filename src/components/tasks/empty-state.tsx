import { ListChecks } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  title = "Aún no hay tareas",
  description = "Crea tu primera tarea para empezar a organizarte.",
  action,
}: Props) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-10 text-center">
      <div className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--primary)] mb-4">
        <ListChecks className="size-6" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-4 max-w-sm mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}
