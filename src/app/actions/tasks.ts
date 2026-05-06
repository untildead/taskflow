"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { TaskSchema } from "@/lib/validations";

export type TaskActionState =
  | {
      ok?: boolean;
      errors?: {
        title?: string[];
        description?: string[];
        priority?: string[];
        dueDate?: string[];
        categoryId?: string[];
        form?: string[];
      };
    }
  | undefined;

export async function createTask(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const user = await requireUser();
  const parsed = TaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    categoryId: formData.get("categoryId"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  // Verify category belongs to user, if provided
  if (data.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: data.categoryId, userId: user.id },
      select: { id: true },
    });
    if (!cat) return { errors: { categoryId: ["Categoría inválida."] } };
  }

  const max = await prisma.task.aggregate({
    where: { userId: user.id },
    _max: { order: true },
  });

  await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      dueDate: data.dueDate,
      categoryId: data.categoryId,
      userId: user.id,
      order: (max._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTask(
  taskId: string,
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const user = await requireUser();

  const existing = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
    select: { id: true },
  });
  if (!existing) return { errors: { form: ["Tarea no encontrada."] } };

  const parsed = TaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    categoryId: formData.get("categoryId"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  if (data.categoryId) {
    const cat = await prisma.category.findFirst({
      where: { id: data.categoryId, userId: user.id },
      select: { id: true },
    });
    if (!cat) return { errors: { categoryId: ["Categoría inválida."] } };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      dueDate: data.dueDate,
      categoryId: data.categoryId,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleTaskComplete(taskId: string) {
  const user = await requireUser();
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: user.id },
    select: { id: true, completed: true },
  });
  if (!task) return;

  await prisma.task.update({
    where: { id: task.id },
    data: { completed: !task.completed },
  });
  revalidatePath("/dashboard");
}

export async function deleteTask(taskId: string) {
  const user = await requireUser();
  const result = await prisma.task.deleteMany({
    where: { id: taskId, userId: user.id },
  });
  if (result.count === 0) return;
  revalidatePath("/dashboard");
}

export async function reorderTasks(orderedIds: string[]) {
  const user = await requireUser();
  if (!orderedIds.length) return;

  // Limit operations & verify all belong to user
  const own = await prisma.task.findMany({
    where: { id: { in: orderedIds }, userId: user.id },
    select: { id: true },
  });
  const ownIds = new Set(own.map((t) => t.id));

  await prisma.$transaction(
    orderedIds
      .filter((id) => ownIds.has(id))
      .map((id, idx) =>
        prisma.task.update({
          where: { id },
          data: { order: idx },
        }),
      ),
  );
  revalidatePath("/dashboard");
}
