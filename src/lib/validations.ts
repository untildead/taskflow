import { z } from "zod";

export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const TaskSchema = z.object({
  title: z
    .string({ error: "El título es obligatorio." })
    .trim()
    .min(1, { error: "El título es obligatorio." })
    .max(200, { error: "Máximo 200 caracteres." }),
  description: z
    .string()
    .trim()
    .max(2000, { error: "Máximo 2000 caracteres." })
    .optional()
    .or(z.literal("")),
  priority: PrioritySchema.default("MEDIUM"),
  dueDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? new Date(v) : null))
    .refine((v) => v === null || !Number.isNaN(v.getTime()), {
      error: "Fecha inválida.",
    }),
  categoryId: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v !== "none" ? v : null)),
});

export const CategorySchema = z.object({
  name: z
    .string({ error: "El nombre es obligatorio." })
    .trim()
    .min(1, { error: "El nombre es obligatorio." })
    .max(40, { error: "Máximo 40 caracteres." }),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, { error: "Color inválido (hex #rrggbb)." })
    .default("#6366f1"),
});

export const SignupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Mínimo 2 caracteres." })
    .max(60, { error: "Máximo 60 caracteres." }),
  email: z.email({ error: "Correo inválido." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Mínimo 8 caracteres." })
    .max(72, { error: "Máximo 72 caracteres." }),
});

export const LoginSchema = z.object({
  email: z.email({ error: "Correo inválido." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Contraseña obligatoria." }),
});

export type TaskInput = z.input<typeof TaskSchema>;
export type TaskParsed = z.output<typeof TaskSchema>;
export type CategoryInput = z.input<typeof CategorySchema>;
export type SignupInput = z.input<typeof SignupSchema>;
export type LoginInput = z.input<typeof LoginSchema>;
