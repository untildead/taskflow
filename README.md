<div align="center">

# ✅ TaskFlow

**Una app de tareas full-stack con auth, drag & drop, dark mode y filtros en tiempo real.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-000?logo=auth0&logoColor=white)](https://authjs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)](https://neon.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Demo en vivo](#) · [Reportar bug](https://github.com/untildead/taskflow/issues) · [Pedir feature](https://github.com/untildead/taskflow/issues)

</div>

---

## 🎯 Sobre el proyecto

TaskFlow es una aplicación de gestión de tareas pensada como portafolio: cada decisión técnica intenta mostrar criterio sobre Server Components, autenticación, validación, accesibilidad y UX. No es una to-do list cualquiera.

## ✨ Features

- 🔐 **Autenticación** — Google OAuth + email/contraseña (NextAuth v5 con Prisma adapter, sesiones JWT, contraseñas hasheadas con bcrypt).
- 📋 **CRUD completo** de tareas y categorías, todo vía Server Actions con validación Zod en el servidor.
- 🏷️ **Categorías con colores** — palette picker, conteo de tareas, escope por usuario.
- 🚦 **Prioridades visuales** — alta / media / baja con indicadores cromáticos.
- 📅 **Fechas límite inteligentes** — badges distintos para vencidas, hoy, mañana y próximos días.
- 🔎 **Filtros + búsqueda** persistentes en la URL (status, prioridad, categoría, búsqueda con debounce).
- 🎯 **Drag & drop** para reordenar (dnd-kit) con actualización optimista y rollback en error.
- 🌓 **Dark / Light mode** que respeta `prefers-color-scheme` (next-themes).
- ✨ **Animaciones** sutiles con Framer Motion y CSS keyframes.
- 📱 **Responsive** mobile-first.
- 🔔 **Feedback inmediato** con toasts (sonner) y skeleton loaders.

## 🛠️ Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Lenguaje | TypeScript 5 (strict mode) |
| Estilos | Tailwind CSS v4 (CSS-first config) |
| ORM | Prisma 6 |
| Base de datos | PostgreSQL (Neon en producción) |
| Auth | Auth.js v5 (NextAuth) + adaptador Prisma |
| Validación | Zod 4 |
| UI | Componentes propios (cva + Tailwind), lucide-react, Framer Motion, sonner |
| Drag & drop | @dnd-kit/core + sortable |
| Despliegue | Vercel |

## 🚀 Instalación local

### Prerequisitos

- Node.js **20** o superior
- Una base de datos PostgreSQL — recomiendo [Neon](https://neon.tech) (free tier sin tarjeta).
- Credenciales OAuth de Google ([cómo obtenerlas](https://support.google.com/cloud/answer/6158849)).

### Pasos

```bash
# 1. Clonar el repo
git clone https://github.com/untildead/taskflow.git
cd taskflow

# 2. Instalar dependencias
npm install

# 3. Copiar el archivo de entorno
cp .env.example .env.local
# Edita .env.local con tus valores reales

# 4. Sincronizar el schema con la DB
npm run db:push

# 5. (Opcional) Sembrar datos demo
npm run db:seed
# → Crea el usuario demo@taskflow.app con la contraseña demo1234

# 6. Levantar en dev
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y listo.

### Variables de entorno

Todas viven en `.env.local` (que está gitignored). Mira `.env.example` para la lista completa.

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `AUTH_SECRET` | Secreto para firmar JWT (`npx auth secret` para generarlo) |
| `AUTH_GOOGLE_ID` | Client ID de Google OAuth |
| `AUTH_GOOGLE_SECRET` | Client secret de Google OAuth |
| `AUTH_URL` | URL pública de la app (ej. `http://localhost:3000`) |

## 📜 Scripts disponibles

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción (corre `prisma generate` antes)
npm run start        # servidor de producción
npm run lint         # ESLint
npm run db:push      # sincronizar schema sin migraciones
npm run db:migrate   # crear y aplicar migración
npm run db:seed      # poblar la base con datos demo
npm run db:studio    # abrir Prisma Studio
```

## 🏗️ Arquitectura

### Server-first

Casi toda la app son **Server Components**. El cliente solo entra cuando hay interactividad real (formularios, drag & drop, dialogs, theme toggle). Cada Server Action arranca verificando la sesión vía `requireUser()` y la propiedad del recurso, porque las acciones son endpoints públicos.

### Data Access Layer

`src/lib/dal.ts` centraliza acceso a Prisma con autorización + memoización (`React.cache`). Filtros, búsqueda y contadores viven aquí, no en el componente de página. Esto evita que olvides un check de propietario en una nueva ruta.

### Validación

Zod 4 con esquemas reutilizables en `src/lib/validations.ts`. Los Server Actions validan el `FormData` con `safeParse` y devuelven errores estructurados que `useActionState` muestra debajo de cada campo.

### URL como estado

Filtros y búsqueda viven en `searchParams`. Esto te permite compartir un link "tareas vencidas de Trabajo" y respeta la navegación del navegador.

### Decisiones cuestionables (intencionales)

- **Sesiones JWT en vez de DB** — más simple, suficiente para esta escala.
- **Prisma 6 (no 7)** — Prisma 7 es muy nuevo, dropeó `url` en `schema.prisma` y rompe el adaptador de Auth.js. Volveré cuando todo esté listo.
- **Sin React Query / SWR** — Server Actions + `revalidatePath` cubren las mutaciones, y el dashboard es un Server Component que recarga al revalidar. No hay datos del cliente que justifiquen una capa extra.

## 📁 Estructura

```
taskflow/
├── prisma/
│   ├── schema.prisma     # User, Account, Session, Task, Category
│   └── seed.ts           # datos demo
├── src/
│   ├── app/
│   │   ├── (auth)/       # login, register
│   │   ├── api/auth/     # NextAuth handler
│   │   ├── dashboard/    # app principal
│   │   ├── actions/      # Server Actions (auth, tasks, categories)
│   │   ├── layout.tsx
│   │   └── page.tsx      # landing pública
│   ├── components/
│   │   ├── ui/           # primitivos (Button, Input, Dialog…)
│   │   ├── auth/         # forms de login/registro
│   │   ├── tasks/        # TaskCard, TaskList, TaskForm, TaskFilters…
│   │   ├── categories/   # CategorySidebar, CategoryForm
│   │   └── layout/       # Header, ThemeToggle, UserMenu
│   ├── lib/
│   │   ├── auth.ts       # NextAuth config
│   │   ├── prisma.ts     # singleton client
│   │   ├── dal.ts        # data access layer
│   │   ├── validations.ts
│   │   └── utils.ts
│   ├── types/
│   └── middleware.ts     # protección de rutas
└── README.md
```

## 🚢 Deploy

1. Sube el repo a GitHub.
2. Crea un proyecto Postgres en [Neon](https://neon.tech) y copia la `DATABASE_URL`.
3. Importa el repo en [Vercel](https://vercel.com/new).
4. Añade las variables de entorno en _Settings → Environment Variables_.
5. Actualiza el redirect URI en Google OAuth con tu dominio de Vercel.
6. ¡Deploy!

El script `build` corre `prisma generate` automáticamente, así que no necesitas configurar nada extra en Vercel.

## 📄 Licencia

[MIT](LICENSE)

---

<div align="center">
Hecho con ❤️ y bastante <code>npx prisma generate</code>
</div>
