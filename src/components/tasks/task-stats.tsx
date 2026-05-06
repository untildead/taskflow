import { CheckCircle2, Circle, ClipboardList, AlertTriangle } from "lucide-react";

type Props = {
  total: number;
  completed: number;
  active: number;
  overdue: number;
};

export function TaskStats({ total, completed, active, overdue }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat label="Total" value={total} icon={<ClipboardList className="size-4" />} />
      <Stat
        label="Pendientes"
        value={active}
        icon={<Circle className="size-4" />}
        accent="text-[var(--primary)]"
      />
      <Stat
        label="Completadas"
        value={completed}
        icon={<CheckCircle2 className="size-4" />}
        accent="text-emerald-500"
      />
      <Stat
        label="Vencidas"
        value={overdue}
        icon={<AlertTriangle className="size-4" />}
        accent={overdue > 0 ? "text-rose-500" : "text-[var(--muted-foreground)]"}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
        <span className={accent ?? ""}>{icon}</span>
        {label}
      </div>
      <div className="text-2xl font-bold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
