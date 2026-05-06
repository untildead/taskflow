import type { Priority, Task, Category, User } from "@prisma/client";

export type { Priority, Task, Category, User };

export type TaskWithCategory = Task & {
  category: Category | null;
};

export type TaskFilter = {
  status?: "all" | "active" | "completed";
  priority?: Priority | "all";
  categoryId?: string | "all" | "none";
  search?: string;
  dueBefore?: Date;
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  HIGH: "text-rose-600 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40",
  MEDIUM: "text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40",
  LOW: "text-emerald-600 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40",
};

export const PRIORITY_DOT: Record<Priority, string> = {
  HIGH: "bg-rose-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-emerald-500",
};
