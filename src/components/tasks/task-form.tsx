"use client";

import * as React from "react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createTask, updateTask, type TaskActionState } from "@/app/actions/tasks";
import type { Category, TaskWithCategory } from "@/types";

type Props = {
  task?: TaskWithCategory;
  categories: Pick<Category, "id" | "name" | "color">[];
  onDone: () => void;
};

export function TaskForm({ task, categories, onDone }: Props) {
  const action = task
    ? updateTask.bind(null, task.id)
    : (createTask as (
        prev: TaskActionState,
        formData: FormData,
      ) => Promise<TaskActionState>);

  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    if (state?.ok) {
      toast.success(task ? "Tarea actualizada" : "Tarea creada");
      onDone();
    }
  }, [state, onDone, task]);

  const initialDate = task?.dueDate
    ? new Date(task.dueDate).toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          defaultValue={task?.title ?? ""}
          placeholder="Llamar al dentista"
          required
          autoFocus
        />
        {state?.errors?.title && (
          <p className="text-xs text-[var(--destructive)]">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={task?.description ?? ""}
          placeholder="Notas opcionales"
          rows={3}
        />
        {state?.errors?.description && (
          <p className="text-xs text-[var(--destructive)]">{state.errors.description[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridad</Label>
          <Select id="priority" name="priority" defaultValue={task?.priority ?? "MEDIUM"}>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Fecha límite</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={initialDate}
          />
          {state?.errors?.dueDate && (
            <p className="text-xs text-[var(--destructive)]">{state.errors.dueDate[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Categoría</Label>
        <Select
          id="categoryId"
          name="categoryId"
          defaultValue={task?.categoryId ?? "none"}
        >
          <option value="none">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {state?.errors?.categoryId && (
          <p className="text-xs text-[var(--destructive)]">{state.errors.categoryId[0]}</p>
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
          {task ? "Guardar cambios" : "Crear tarea"}
        </Button>
      </div>
    </form>
  );
}
