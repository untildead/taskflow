import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  GripVertical,
  ListChecks,
  Moon,
  Tag,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold">
          <ListChecks className="size-5 text-[var(--primary)]" />
          TaskFlow
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Login
          </Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>
            Empezar
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="px-6 pt-16 pb-24 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--muted-foreground)] mb-6">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Organiza tu día sin esfuerzo
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Tu lista de tareas,
            <br />
            <span className="text-[var(--primary)]">finalmente bonita</span>.
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] mb-10 max-w-xl mx-auto">
            Categorías con colores, prioridades visuales, drag & drop, fechas
            límite y modo oscuro. Todo lo que necesitas para mantenerte en flow.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Empieza gratis <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        <section className="px-6 pb-24 max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Feature
              icon={<Tag className="size-5" />}
              title="Categorías con colores"
              text="Trabajo, personal, estudio. Cada categoría con su propio color."
            />
            <Feature
              icon={<CheckCircle2 className="size-5" />}
              title="Prioridades claras"
              text="Alta, media, baja. Visualmente obvias para no olvidar lo importante."
            />
            <Feature
              icon={<CalendarClock className="size-5" />}
              title="Fechas límite"
              text="Alertas cuando una tarea está vencida o por vencer."
            />
            <Feature
              icon={<GripVertical className="size-5" />}
              title="Drag & drop"
              text="Reordena tus tareas con un gesto. Tu prioridad, tu orden."
            />
            <Feature
              icon={<Moon className="size-5" />}
              title="Modo oscuro"
              text="Tema claro u oscuro, sigue las preferencias del sistema."
            />
            <Feature
              icon={<ListChecks className="size-5" />}
              title="Filtros y búsqueda"
              text="Encuentra cualquier tarea por estado, prioridad o categoría."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-6 px-6 text-center text-sm text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} TaskFlow · Hecho con Next.js
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--primary)] mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[var(--muted-foreground)]">{text}</p>
    </div>
  );
}
