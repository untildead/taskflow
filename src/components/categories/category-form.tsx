"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategory,
  updateCategory,
  type CategoryActionState,
} from "@/app/actions/categories";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

type Props = {
  category?: Pick<Category, "id" | "name" | "color">;
  onDone: () => void;
};

export function CategoryForm({ category, onDone }: Props) {
  const action = category
    ? updateCategory.bind(null, category.id)
    : (createCategory as (
        prev: CategoryActionState,
        formData: FormData,
      ) => Promise<CategoryActionState>);

  const [state, formAction, pending] = useActionState(action, undefined);
  const [color, setColor] = React.useState(category?.color ?? COLORS[0]);

  useEffect(() => {
    if (state?.ok) {
      toast.success(category ? "Categoría actualizada" : "Categoría creada");
      onDone();
    }
  }, [state, onDone, category]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={category?.name ?? ""}
          placeholder="Trabajo"
          required
          autoFocus
        />
        {state?.errors?.name && (
          <p className="text-xs text-[var(--destructive)]">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <input type="hidden" name="color" value={color} />
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "size-7 rounded-full transition-transform",
                color === c && "ring-2 ring-offset-2 ring-offset-[var(--card)] ring-[var(--foreground)] scale-110",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
        {state?.errors?.color && (
          <p className="text-xs text-[var(--destructive)]">{state.errors.color[0]}</p>
        )}
      </div>

      {state?.errors?.form && (
        <p className="text-sm text-[var(--destructive)]">{state.errors.form[0]}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          {category ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>
    </form>
  );
}
