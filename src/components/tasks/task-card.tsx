"use client";

import * as React from "react";
import { useTransition } from "react";
import { format, isPast, isToday, isTomorrow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock, GripVertical, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PRIORITY_DOT, PRIORITY_LABEL, type TaskWithCategory } from "@/types";
import { toggleTaskComplete, deleteTask } from "@/app/actions/tasks";

type Props = {
  task: TaskWithCategory;
  onEdit: (task: TaskWithCategory) => void;
};

export function TaskCard({ task, onEdit }: Props) {
  const [pending, start] = useTransition();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = () => {
    start(async () => {
      await toggleTaskComplete(task.id);
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${task.title}"?`)) return;
    start(async () => {
      await deleteTask(task.id);
      toast.success("Tarea eliminada");
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4 flex items-start gap-3 transition-all",
        "hover:border-[var(--primary)]/40 hover:shadow-sm",
        task.completed && "opacity-60",
        isDragging && "opacity-50 shadow-lg z-10",
        pending && "opacity-50",
      )}
    >
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity p-1 -ml-1"
        aria-label="Reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="pt-0.5">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggle}
          aria-label={task.completed ? "Marcar como pendiente" : "Completar tarea"}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3
            className={cn(
              "font-medium text-sm leading-snug break-words flex-1",
              task.completed && "line-through text-[var(--muted-foreground)]",
            )}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 whitespace-pre-line">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge className="bg-[var(--accent)] text-[var(--accent-foreground)]">
            <span className={cn("size-1.5 rounded-full", PRIORITY_DOT[task.priority])} />
            {PRIORITY_LABEL[task.priority]}
          </Badge>

          {task.category && (
            <Badge
              style={{
                backgroundColor: `${task.category.color}22`,
                color: task.category.color,
              }}
            >
              {task.category.name}
            </Badge>
          )}

          {task.dueDate && <DueDateBadge date={task.dueDate} done={task.completed} />}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onEdit(task)}
          aria-label="Editar tarea"
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
          onClick={handleDelete}
          aria-label="Eliminar tarea"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function DueDateBadge({ date, done }: { date: Date; done: boolean }) {
  const overdue = !done && isPast(date) && !isToday(date);
  const today = isToday(date);
  const tomorrow = isTomorrow(date);
  const soon = !overdue && !today && !tomorrow && differenceInDays(date, new Date()) <= 3;

  let label: string;
  if (today) label = "Hoy";
  else if (tomorrow) label = "Mañana";
  else label = format(date, "d MMM", { locale: es });

  return (
    <Badge
      className={cn(
        "border",
        overdue && "border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
        today && "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
        soon && "border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
        !overdue && !today && !soon && "border-[var(--border)] bg-[var(--accent)] text-[var(--muted-foreground)]",
      )}
    >
      <CalendarClock className="size-3" />
      {overdue ? `Vencida · ${label}` : label}
    </Badge>
  );
}
