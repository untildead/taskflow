"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import { SignupSchema, LoginSchema } from "@/lib/validations";

export type AuthState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        form?: string[];
      };
    }
  | undefined;

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (exists) {
    return { errors: { email: ["Este correo ya está registrado."] } };
  }

  const hashed = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { errors: { form: ["No pudimos iniciar sesión. Intenta desde la página de login."] } };
    }
    throw error;
  }
}

export async function loginWithCredentials(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { errors: { form: ["Correo o contraseña incorrectos."] } };
      }
      return { errors: { form: ["No pudimos iniciar sesión. Intenta de nuevo."] } };
    }
    throw error;
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
