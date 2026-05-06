import { Suspense } from "react";
import { getTasks, getCategories, getTaskCounts } from "@/lib/dal";
import { TaskFilters } from "@/components/tasks/task-filters";
import { TaskList } from "@/components/tasks/task-list";
import { TaskStats } from "@/components/tasks/task-stats";
import { CategorySidebar } from "@/components/categories/category-sidebar";
import type { Priority } from "@/types";

export const metadata = { title: "Dashboard — TaskFlow" };

type SearchParams = {
  status?: string;
  priority?: string;
  category?: string;
  q?: string;
};

const PRIORITIES: ReadonlyArray<Priority> = ["LOW", "MEDIUM", "HIGH"];

function normalizePriority(value: string | undefined): Priority | "all" {
  if (!value || value === "all") return "all";
  return PRIORITIES.includes(value as Priority) ? (value as Priority) : "all";
}

function normalizeStatus(value: string | undefined): "all" | "active" | "completed" {
  return value === "active" || value === "completed" ? value : "all";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filterArgs = {
    status: normalizeStatus(sp.status),
    priority: normalizePriority(sp.priority),
    categoryId: sp.category ?? "all",
    search: sp.q,
  };

  const [tasks, categories, counts] = await Promise.all([
    getTasks(filterArgs),
    getCategories(),
    getTaskCounts(),
  ]);

  const filtersApplied =
    filterArgs.status !== "all" ||
    filterArgs.priority !== "all" ||
    filterArgs.categoryId !== "all" ||
    !!filterArgs.search;

  return (
    <div className="space-y-6">
      <TaskStats {...counts} />

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <div className="space-y-6">
          <CategorySidebar categories={categories} />
        </div>

        <div className="space-y-4 min-w-0">
          <Suspense>
            <TaskFilters categories={categories} />
          </Suspense>
          <TaskList
            initialTasks={tasks}
            categories={categories}
            filtersApplied={filtersApplied}
          />
        </div>
      </div>
    </div>
  );
}
