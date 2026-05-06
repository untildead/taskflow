"use client";

import * as React from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CategoryForm } from "@/components/categories/category-form";
import { deleteCategory } from "@/app/actions/categories";
import type { Category } from "@/types";

type CategoryWithCount = Pick<Category, "id" | "name" | "color"> & {
  _count: { tasks: number };
};

export function CategorySidebar({ categories }: { categories: CategoryWithCount[] }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryWithCount | null>(null);
  const [pending, start] = React.useTransition();

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (category: CategoryWithCount) => {
    setEditing(category);
    setOpen(true);
  };

  const handleDelete = (category: CategoryWithCount) => {
    if (
      !confirm(
        `¿Eliminar "${category.name}"? Las tareas asociadas quedarán sin categoría.`,
      )
    )
      return;
    start(async () => {
      await deleteCategory(category.id);
      toast.success("Categoría eliminada");
    });
  };

  return (
    <aside className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Categorías</h2>
        <Button variant="ghost" size="icon" className="size-7" onClick={openCreate}>
          <Plus className="size-4" />
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-xs text-[var(--muted-foreground)]">
          Aún no tienes categorías.
        </p>
      ) : (
        <ul className="space-y-1">
          {categories.map((c) => (
            <li
              key={c.id}
              className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[var(--accent)]"
            >
              <span
                className="size-3 rounded-full shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-sm truncate flex-1">{c.name}</span>
              <span className="text-xs text-[var(--muted-foreground)] tabular-nums">
                {c._count.tasks}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  className="p-1 hover:text-[var(--foreground)] text-[var(--muted-foreground)]"
                  onClick={() => openEdit(c)}
                  aria-label="Editar categoría"
                  disabled={pending}
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:text-[var(--destructive)] text-[var(--muted-foreground)]"
                  onClick={() => handleDelete(c)}
                  aria-label="Eliminar categoría"
                  disabled={pending}
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Editar categoría" : "Nueva categoría"}
      >
        <CategoryForm category={editing ?? undefined} onDone={() => setOpen(false)} />
      </Dialog>
    </aside>
  );
}
