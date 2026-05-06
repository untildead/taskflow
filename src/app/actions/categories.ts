"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { CategorySchema } from "@/lib/validations";

export type CategoryActionState =
  | {
      ok?: boolean;
      errors?: {
        name?: string[];
        color?: string[];
        form?: string[];
      };
    }
  | undefined;

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const user = await requireUser();
  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const dup = await prisma.category.findFirst({
    where: { userId: user.id, name: parsed.data.name },
    select: { id: true },
  });
  if (dup) return { errors: { name: ["Ya existe una categoría con ese nombre."] } };

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      userId: user.id,
    },
  });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateCategory(
  categoryId: string,
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const user = await requireUser();
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id },
    select: { id: true },
  });
  if (!existing) return { errors: { form: ["Categoría no encontrada."] } };

  const parsed = CategorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await prisma.category.update({
    where: { id: categoryId },
    data: { name: parsed.data.name, color: parsed.data.color },
  });
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteCategory(categoryId: string) {
  const user = await requireUser();
  const result = await prisma.category.deleteMany({
    where: { id: categoryId, userId: user.id },
  });
  if (result.count === 0) return;
  revalidatePath("/dashboard");
}
