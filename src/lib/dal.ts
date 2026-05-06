import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Priority } from "@prisma/client";

export const requireUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
});

export type GetTasksOptions = {
  status?: "all" | "active" | "completed";
  priority?: Priority | "all";
  categoryId?: string | "all" | "none";
  search?: string;
};

export const getTasks = cache(async (opts: GetTasksOptions = {}) => {
  const user = await requireUser();
  const { status = "all", priority = "all", categoryId = "all", search } = opts;

  return prisma.task.findMany({
    where: {
      userId: user.id,
      ...(status === "active" && { completed: false }),
      ...(status === "completed" && { completed: true }),
      ...(priority !== "all" && { priority }),
      ...(categoryId === "none" && { categoryId: null }),
      ...(categoryId !== "all" && categoryId !== "none" && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { category: true },
    orderBy: [{ completed: "asc" }, { order: "asc" }, { createdAt: "desc" }],
  });
});

export const getCategories = cache(async () => {
  const user = await requireUser();
  return prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { tasks: true } } },
  });
});

export const getTaskCounts = cache(async () => {
  const user = await requireUser();
  const [total, completed, active, overdue] = await Promise.all([
    prisma.task.count({ where: { userId: user.id } }),
    prisma.task.count({ where: { userId: user.id, completed: true } }),
    prisma.task.count({ where: { userId: user.id, completed: false } }),
    prisma.task.count({
      where: {
        userId: user.id,
        completed: false,
        dueDate: { lt: new Date() },
      },
    }),
  ]);
  return { total, completed, active, overdue };
});
