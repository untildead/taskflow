import { PrismaClient, Priority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@taskflow.app";

  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo",
      password: await bcrypt.hash("demo1234", 10),
    },
  });

  const [work, personal, study] = await Promise.all([
    prisma.category.create({ data: { name: "Trabajo", color: "#6366f1", userId: user.id } }),
    prisma.category.create({ data: { name: "Personal", color: "#22c55e", userId: user.id } }),
    prisma.category.create({ data: { name: "Estudio", color: "#f59e0b", userId: user.id } }),
  ]);

  const day = 24 * 60 * 60 * 1000;
  const today = new Date();

  await prisma.task.createMany({
    data: [
      {
        title: "Preparar presentación trimestral",
        description: "Slides para reunión del jueves",
        priority: Priority.HIGH,
        categoryId: work.id,
        userId: user.id,
        dueDate: new Date(today.getTime() + 2 * day),
        order: 0,
      },
      {
        title: "Code review del PR #142",
        priority: Priority.MEDIUM,
        categoryId: work.id,
        userId: user.id,
        order: 1,
      },
      {
        title: "Comprar regalo de cumpleaños",
        priority: Priority.MEDIUM,
        categoryId: personal.id,
        userId: user.id,
        dueDate: new Date(today.getTime() + 5 * day),
        order: 2,
      },
      {
        title: "Reservar cita médica",
        priority: Priority.HIGH,
        categoryId: personal.id,
        userId: user.id,
        dueDate: new Date(today.getTime() - 1 * day),
        order: 3,
      },
      {
        title: "Repasar capítulo 7 de algoritmos",
        priority: Priority.LOW,
        categoryId: study.id,
        userId: user.id,
        order: 4,
      },
      {
        title: "Salir a correr 5km",
        completed: true,
        priority: Priority.LOW,
        categoryId: personal.id,
        userId: user.id,
        order: 5,
      },
    ],
  });

  console.log(`✓ Seeded ${email} (password: demo1234) with 6 tasks across 3 categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
