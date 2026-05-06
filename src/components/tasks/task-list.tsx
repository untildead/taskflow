"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { EmptyState } from "@/components/tasks/empty-state";
import { reorderTasks } from "@/app/actions/tasks";
import type { Category, TaskWithCategory } from "@/types";

type Props = {
  initialTasks: TaskWithCategory[];
  categories: Pick<Category, "id" | "name" | "color">[];
  filtersApplied: boolean;
};

export function TaskList({ initialTasks, categories, filtersApplied }: Props) {
  // Sync local state with server data when initialTasks changes (after revalidatePath)
  // Pattern: derive state from props during render (React 19 recommended).
  const [tasks, setTasks] = React.useState(initialTasks);
  const [lastInitial, setLastInitial] = React.useState(initialTasks);
  if (initialTasks !== lastInitial) {
    setLastInitial(initialTasks);
    setTasks(initialTasks);
  }

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TaskWithCategory | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(tasks, oldIndex, newIndex);
    setTasks(next);
    reorderTasks(next.map((t) => t.id)).catch(() => {
      toast.error("No se pudo guardar el nuevo orden");
      setTasks(tasks);
    });
  };

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (task: TaskWithCategory) => {
    setEditing(task);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Tareas <span className="text-[var(--muted-foreground)] font-normal">· {tasks.length}</span>
        </h2>
        <Button onClick={openCreate} size="sm">
          <Plus className="size-4" />
          Nueva tarea
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title={filtersApplied ? "Sin resultados" : "Aún no hay tareas"}
          description={
            filtersApplied
              ? "Prueba ajustar los filtros o la búsqueda."
              : "Crea tu primera tarea para empezar a organizarte."
          }
          action={
            !filtersApplied && (
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Crear primera tarea
              </Button>
            )
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <TaskCard task={task} onEdit={openEdit} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => !o && closeDialog()}
        title={editing ? "Editar tarea" : "Nueva tarea"}
      >
        <TaskForm task={editing ?? undefined} categories={categories} onDone={closeDialog} />
      </Dialog>
    </>
  );
}
