"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleButton } from "@/components/auth/google-button";
import { signup } from "@/app/actions/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Empieza a organizar tus tareas en segundos
        </p>
      </div>

      <GoogleButton />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--background)] px-2 text-[var(--muted-foreground)]">
            o regístrate con correo
          </span>
        </div>
      </div>

      <form action={action} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" type="text" autoComplete="name" required />
          {state?.errors?.name && (
            <p className="text-xs text-[var(--destructive)]">{state.errors.name[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          {state?.errors?.email && (
            <p className="text-xs text-[var(--destructive)]">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          {state?.errors?.password && (
            <p className="text-xs text-[var(--destructive)]">{state.errors.password[0]}</p>
          )}
        </div>
        {state?.errors?.form && (
          <p className="text-sm text-[var(--destructive)]">{state.errors.form[0]}</p>
        )}
        <Button type="submit" className="w-full" loading={pending}>
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-[var(--primary)] hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
