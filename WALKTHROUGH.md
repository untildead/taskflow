# 📖 TaskFlow — Guía de aprendizaje

Esta guía explica el proyecto archivo por archivo y, sobre todo, **por qué** cada decisión está donde está. Léela una vez de principio a fin para tener el mapa mental, después salta a cualquier sección cuando quieras profundizar.

---

## Tabla de contenido

1. [Visión general](#1-visión-general)
2. [Cómo viaja una request](#2-cómo-viaja-una-request)
3. [Mapa del proyecto](#3-mapa-del-proyecto)
4. [Conceptos clave](#4-conceptos-clave)
5. [Recorrido por features](#5-recorrido-por-features)
6. [Preguntas para autoevaluarte](#6-preguntas-para-autoevaluarte)

---

## 1. Visión general

TaskFlow es una app full-stack server-first. La regla de oro:

> **Todo es Server Component salvo lo que requiere interactividad real.**

Los componentes cliente (`"use client"`) aparecen solo cuando hay drag, formularios con feedback inmediato, dialogs, theme toggle o estado en URL. El resto se renderiza en servidor → menos JavaScript en el cliente, datos siempre frescos.

### Las cinco capas

| Capa | Archivo(s) | Rol |
|---|---|---|
| **Schema** | `prisma/schema.prisma` | Define las tablas |
| **Cliente Prisma** | `src/lib/prisma.ts` | Singleton de conexión |
| **Data Access Layer (DAL)** | `src/lib/dal.ts` | Lecturas autorizadas con cache |
| **Server Actions** | `src/app/actions/*.ts` | Mutaciones autorizadas con validación |
| **UI** | `src/app/**/page.tsx`, `src/components/**` | Render |

Cada capa solo habla con la siguiente. La UI **nunca** llama a Prisma directamente — siempre a través del DAL (lecturas) o Server Actions (mutaciones).

---

## 2. Cómo viaja una request

### Lectura (ej. abrir `/dashboard`)

```
1. Browser → GET /dashboard
2. middleware.ts verifica sesión   ──→  redirige a /login si no hay
3. dashboard/layout.tsx (Server)   ──→  doble check con auth(); render Header
4. dashboard/page.tsx (Server)     ──→  await getTasks(), getCategories(), getTaskCounts()
5. lib/dal.ts                      ──→  requireUser() + prisma.task.findMany()
6. Prisma envía SQL a Neon (Postgres)
7. HTML server-rendered → browser
```

Cero JavaScript de fetching en el cliente. La página llega con los datos ya pintados.

### Mutación (ej. crear tarea)

```
1. Usuario rellena form y submit
2. <form action={createTask}> (Server Action)
3. tasks.ts → requireUser() → TaskSchema.safeParse(formData)
4. Si válido: prisma.task.create()
5. revalidatePath("/dashboard") invalida el cache del servidor
6. React refresca el árbol → la TaskList llega con la tarea nueva
7. useActionState devuelve { ok: true } → toast + cierra dialog
```

Sin endpoints REST, sin `fetch`, sin React Query. La función del servidor se invoca como si fuera local.

---

## 3. Mapa del proyecto

### `prisma/`

#### `schema.prisma`
Define el modelo de datos.

- **`User`** — incluye `password` (hash de bcrypt) para credenciales y relaciones a `Account`/`Session` que pide el adapter de Auth.js.
- **`Account` / `Session` / `VerificationToken`** — tablas que Auth.js requiere aunque uses sesiones JWT (el adapter las necesita para vincular cuentas OAuth).
- **`Task`** — `userId` para escope, `order: Int` para drag & drop, `categoryId?` con `onDelete: SetNull` (al borrar una categoría las tareas no se borran, quedan sin categoría).
- **`Category`** — `@@unique([userId, name])` evita duplicados por usuario.
- **`Priority` enum** — `LOW | MEDIUM | HIGH`.

**Índices clave:**
```
@@index([userId, completed])  // filtrar pendientes/completadas
@@index([userId, order])      // ordenar para drag & drop
```

#### `seed.ts`
Crea `demo@taskflow.app` con 3 categorías y 6 tareas variadas. Idempotente: borra al usuario demo antes de crearlo.

---

### `src/lib/`

#### `prisma.ts`
Singleton del cliente de Prisma. Patrón estándar de Next.js: en desarrollo, hot-reload crearía decenas de instancias y agotaría conexiones, así que cacheamos en `globalThis`.

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient(...);
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

#### `auth.ts`
Configuración de NextAuth v5. Exporta `{ handlers, auth, signIn, signOut }`.

- **`adapter: PrismaAdapter(prisma)`** — guarda cuentas OAuth en la DB.
- **`session: { strategy: "jwt" }`** — sesiones en cookie firmada, no en DB. Necesario para usar Credentials provider.
- **Providers**: Google + Credentials (con bcrypt.compare).
- **Callbacks**: el de `jwt` mete `user.id` en `token.sub`; el de `session` lo expone como `session.user.id`. Sin esto, no sabrías de quién es cada tarea.

#### `dal.ts` (Data Access Layer)
**El cerebro de las lecturas.** Centraliza tres reglas:

1. **Autorización** — `requireUser()` redirige a `/login` si no hay sesión.
2. **Escope** — toda query incluye `userId: user.id`. Imposible olvidarlo.
3. **Memoización con `cache()` de React** — si `getTasks()` se llama dos veces dentro de la misma request, solo va una vez a la DB.

```ts
export const getTasks = cache(async (opts) => {
  const user = await requireUser();
  return prisma.task.findMany({
    where: { userId: user.id, ...filtros },
    ...
  });
});
```

Por qué importa: si un día agregas `/api/export-csv` y olvidas el filtro, fugas datos de otro usuario. Centralizándolo aquí ese bug es imposible.

#### `validations.ts`
Esquemas Zod compartidos por los Server Actions. Detalles a notar:

- **Mensajes en español** — clave `error` (Zod 4), no `message`.
- **`TaskSchema` transforma el input**: `dueDate` string vacío → `null`, válido `string` → `Date`. `categoryId` `"none"` o vacío → `null`.
- **`SignupSchema`** valida correo (lower-case + trim) y password 8-72 chars (72 es el límite de bcrypt).

Una sola fuente de verdad: el form HTML, el Server Action y los tipos TS comparten estos esquemas.

#### `utils.ts`
Solo `cn()`: combina `clsx` + `tailwind-merge` para que las clases de Tailwind se mezclen sin colisiones (`px-2` + `px-4` → `px-4`).

---

### `src/types/`

#### `index.ts`
Re-exporta tipos de Prisma + helpers de UI:

- **`TaskWithCategory`** — `Task & { category: Category | null }` (el include estándar).
- **`PRIORITY_LABEL`, `PRIORITY_COLOR`, `PRIORITY_DOT`** — mapas para no repetir colores/strings.

#### `next-auth.d.ts`
Augmenta los tipos de NextAuth para que `session.user.id` sea conocido por TypeScript. Sin esto, accederlo daría error.

---

### `middleware.ts`
**La primera línea de defensa.** Se ejecuta antes de cualquier handler.

```ts
export default auth((req) => {
  const isAuthed = !!req.auth;
  const publicRoutes = ["/", "/login", "/register"];
  if (!isAuthed && !isPublic) return NextResponse.redirect("/login");
  if (isAuthed && (path === "/login" || path === "/register"))
    return NextResponse.redirect("/dashboard");
});
```

El `matcher` excluye assets estáticos (`_next/static`, imágenes, etc.) para no procesarlos.

> Nota: el middleware en NextAuth v5 ya no funciona en Edge cuando importas Prisma (Edge no soporta el cliente nativo). Por eso lo desplegamos en Render (Node.js) en lugar de Vercel Edge.

---

### `src/app/` — Rutas

#### `layout.tsx` (root)
- Carga la fuente Geist y configura `<html lang="es" suppressHydrationWarning>` (necesario porque next-themes inyecta una clase tras montar).
- Envuelve todo en `<Providers>`.

#### `page.tsx` (landing)
Página marketing pura. Server Component, cero JS adicional. Usa `buttonVariants()` para que `<Link>` herede el estilo del botón sin necesitar un `asChild`.

#### `(auth)/`
Route group. El nombre con paréntesis no aparece en la URL — sirve para compartir layout sin afectar el path.

- **`layout.tsx`** — header minimalista + container centrado.
- **`login/page.tsx`** y **`register/page.tsx`** — renderizan los forms cliente.

#### `dashboard/`
- **`layout.tsx`** — `await auth()` + redirect, monta `<Header />` y el `<main>` centrado con padding.
- **`page.tsx`** — el corazón. Lee searchParams (Promise en Next 16, hay que `await`), normaliza, llama al DAL en paralelo con `Promise.all`, y renderiza `TaskStats + CategorySidebar + TaskFilters + TaskList`.
- **`loading.tsx`** — esqueleto. Next lo muestra automáticamente mientras se resuelven las promises del Server Component padre.

#### `actions/`
**Mutaciones con `"use server"`.** Todas siguen el mismo patrón:

```ts
"use server";
export async function createTask(prev, formData) {
  const user = await requireUser();              // 1. Auth
  const parsed = Schema.safeParse(formData);     // 2. Validación
  if (!parsed.success) return { errors: ... };   //    Errores estructurados
  await prisma.task.create({ data: { ..., userId: user.id } });  // 3. Mutación
  revalidatePath("/dashboard");                  // 4. Invalidar cache
  return { ok: true };
}
```

- **`auth.ts`** — `signup`, `loginWithCredentials`, `loginWithGoogle`, `logout`.
- **`tasks.ts`** — `createTask`, `updateTask`, `toggleTaskComplete`, `deleteTask`, `reorderTasks`.
- **`categories.ts`** — `createCategory`, `updateCategory`, `deleteCategory`.

**Detalle no obvio**: en `updateTask` y `deleteTask` siempre se hace un `findFirst({ where: { id, userId } })` antes de tocar nada. ¿Por qué? Las Server Actions son endpoints públicos: alguien podría llamar `deleteTask("id-de-otro-usuario")`. El check de propiedad lo evita.

**`reorderTasks`**: usa `prisma.$transaction` para que todas las actualizaciones sean atómicas. Si una falla, ninguna se aplica.

#### `api/auth/[...nextauth]/route.ts`
Solo dos líneas: re-exporta `GET` y `POST` desde `lib/auth.ts`. Es donde NextAuth recibe los callbacks de OAuth y manejos de sesión.

---

### `src/components/`

#### `providers.tsx`
Cliente. Envuelve la app con `<ThemeProvider>` (next-themes con `attribute="class"`) y `<Toaster>` (sonner para notificaciones).

#### `layout/`
- **`header.tsx`** — Server. Llama a `auth()` y monta logo, theme toggle y user-menu.
- **`theme-toggle.tsx`** — Cliente. Detalle interesante: usa `useSyncExternalStore` para detectar si está montado, evitando el warning `react-hooks/set-state-in-effect`.
- **`user-menu.tsx`** — Cliente. Avatar + dropdown con logout.

#### `auth/`
- **`login-form.tsx`** y **`register-form.tsx`** — Cliente. Usan `useActionState(action, undefined)` para obtener `[state, formAction, pending]` y mostrar errores debajo de cada campo.
- **`google-button.tsx`** — Botón que dispara `loginWithGoogle()`.

#### `tasks/`
- **`task-stats.tsx`** — 4 cards con totales (Total, Pendientes, Completadas, Vencidas). Server.
- **`task-filters.tsx`** — **Patrón de URL como estado.** Cliente. Lee `searchParams`, escribe con `router.replace()`. Search con debounce de 300ms.
- **`task-list.tsx`** — Cliente. Wrapper de `<DndContext>` + `<SortableContext>` con animación `<AnimatePresence>` de Framer Motion. Implementa optimistic UI: actualiza la lista local inmediatamente, llama `reorderTasks()`, hace rollback en error.
- **`task-card.tsx`** — Cliente. `useSortable()` da `attributes`, `listeners`, `transform`. El sub-componente `DueDateBadge` calcula si la tarea está vencida/hoy/mañana y aplica colores distintos.
- **`task-form.tsx`** — Cliente. Form de crear/editar. Usa `action.bind(null, task.id)` para que `updateTask` reciba el id sin que el form lo conozca.
- **`empty-state.tsx`** — Server. Mensaje cuando no hay tareas o filtros sin resultados.

#### `categories/`
- **`category-sidebar.tsx`** — Cliente. Lista, abre dialog para crear/editar, confirma antes de borrar.
- **`category-form.tsx`** — Cliente. Form con palette picker.

#### `ui/` — primitivos
Botón, Input, Label, Textarea, Select, Checkbox, Badge, Dialog. Usan `class-variance-authority` (cva) para variantes:

```ts
const buttonVariants = cva("base-classes", {
  variants: {
    variant: { default: "...", outline: "...", ghost: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});
```

Ventaja: tipo-safe (`size: "huge"` es error de TS), reutilizable, y si necesitas extender el botón con `<Link>`, pasas `buttonVariants({ ... })` como className.

---

### Archivos de configuración

| Archivo | Para qué |
|---|---|
| `next.config.ts` | Vacío por ahora. Aquí van rewrites, headers, etc. |
| `tsconfig.json` | `paths: { "@/*": ["./src/*"] }` — el alias para imports limpios. |
| `postcss.config.mjs` | Solo `@tailwindcss/postcss`. Tailwind v4 ya no usa `tailwind.config.js`. |
| `eslint.config.mjs` | ESLint flat config con la preset de Next. |
| `render.yaml` | Blueprint de Render: build command, env vars, plan. |
| `.env.example` | Template de variables. El real `.env` está gitignored. |

---

## 4. Conceptos clave

### Server Components vs Client Components

```
Server Component (por defecto)              Client Component ("use client")
┌─────────────────────────────┐             ┌─────────────────────────────┐
│ • Render solo en servidor   │             │ • Render en servidor +      │
│ • Acceso directo a la DB    │             │   hidratación en browser    │
│ • Cero JS al cliente        │             │ • Maneja eventos (onClick)  │
│ • async/await en componente │             │ • Usa hooks (useState, etc) │
└─────────────────────────────┘             └─────────────────────────────┘
```

**Regla**: empieza siempre como Server. Solo añade `"use client"` cuando necesites:
- Eventos del DOM (`onClick`, `onChange`)
- Estado local (`useState`, `useReducer`)
- Efectos (`useEffect`)
- Hooks de React (incluido `useActionState`)
- APIs del browser (`window`, `localStorage`)

### Server Actions

Funciones marcadas con `"use server"` que se ejecutan en el servidor pero se llaman como funciones normales desde el cliente.

```tsx
// En el servidor:
"use server";
export async function createTask(prev, formData) { ... }

// En el cliente:
<form action={createTask}>...</form>
```

Bajo el capó, Next.js genera un endpoint POST oculto. **Por eso son endpoints públicos** y siempre necesitan auth check.

### useActionState

Hook de React 19 (no `useFormState`, ese era el nombre antiguo).

```ts
const [state, formAction, pending] = useActionState(createTask, undefined);
```

- **`state`** — lo último que devolvió el action (errores de validación, `{ ok: true }`...).
- **`formAction`** — pásalo como `action` del `<form>`.
- **`pending`** — `true` mientras la acción está en vuelo.

### URL como estado

Filtros y búsqueda viven en `searchParams`, no en `useState`. Beneficios:
- Compartible: el link `/dashboard?status=active&priority=HIGH` envía exactamente la vista.
- Atrás/adelante del navegador funcionan.
- El servidor renderiza la lista filtrada directamente; no hay parpadeo de "todas las tareas → filtro".

### Cache + revalidatePath

- **`cache()` de React** memoiza dentro de UNA request (DAL).
- **`revalidatePath("/dashboard")`** invalida el cache de Next.js (segmentos enteros) cuando una mutación los afecta.

---

## 5. Recorrido por features

### Login con credenciales

1. Usuario rellena `LoginForm` (cliente).
2. Submit dispara `loginWithCredentials` (Server Action).
3. Action valida con `LoginSchema`, llama a `signIn("credentials", {...})`.
4. NextAuth invoca el `authorize` de `lib/auth.ts`: busca el user por email, compara hash con bcrypt.
5. Si OK, NextAuth firma un JWT y lo mete en cookie. Redirige a `/dashboard`.
6. La próxima request: middleware ve la cookie, deja pasar.

### Crear una tarea

1. Click "Nueva tarea" → `TaskList` abre el `<Dialog>` con `<TaskForm>`.
2. Submit del form invoca `createTask` (Server Action).
3. Action: `requireUser()` → `TaskSchema.safeParse()` → verifica que `categoryId` (si vino) pertenece al user → calcula `order` con `aggregate({ _max: { order } })` → `prisma.task.create()` → `revalidatePath("/dashboard")`.
4. `useActionState` recibe `{ ok: true }`, dispara `toast.success` y `onDone()` cierra el dialog.
5. React refresca el árbol; `dashboard/page.tsx` re-ejecuta `getTasks()` y la lista llega con la nueva tarea ya incluida.

### Drag & drop con rollback

1. `TaskList` registra sensores de `dnd-kit` (Pointer + Keyboard para accesibilidad).
2. Usuario arrastra → `onDragEnd` se dispara.
3. Cliente: `arrayMove(tasks, oldIndex, newIndex)` + `setTasks(next)` → la UI se actualiza al instante.
4. Llama `reorderTasks(orderedIds)` (Server Action).
5. Si falla la promesa: `toast.error()` + `setTasks(tasks)` (revierte al estado anterior).
6. La Server Action verifica que TODOS los ids pertenecen al user, luego corre un `prisma.$transaction` actualizando `order` de cada uno.

### Toggle dark mode

1. `<ThemeProvider attribute="class">` de next-themes inyecta `class="dark"` o `class="light"` en `<html>`.
2. Tailwind v4 con `@custom-variant dark (&:where(.dark, .dark *))` hace que las clases `dark:bg-...` se apliquen.
3. `<ThemeToggle />` es cliente: usa `useSyncExternalStore` para saber si ya hidrató (sin esto, el SSR + el browser pelean por el icono y vemos un flash).

---

## 6. Preguntas para autoevaluarte

Si las puedes contestar sin mirar el código, dominas el proyecto:

1. ¿Por qué `TaskList` usa `useSyncExternalStore` o el patrón "derive state during render" en lugar de `useEffect(() => setTasks(initialTasks), [initialTasks])`?

2. Si añado un nuevo Server Action `archiveTask`, ¿qué tres cosas no debo olvidar?

3. ¿Por qué usamos `output JWT` en NextAuth y no sesiones en DB?

4. ¿Qué pasa si el callback `session` de `lib/auth.ts` NO copia `token.sub` a `session.user.id`?

5. ¿Por qué los filtros viven en `searchParams` y no en `useState` del cliente?

6. ¿Por qué `dal.ts` usa `cache()` de React? ¿Qué problema soluciona?

7. ¿Qué hace `prisma.$transaction` en `reorderTasks` y por qué no basta con un loop de `update`?

8. ¿Por qué las imágenes y assets de `_next/static` están excluidos del `matcher` del middleware?

9. ¿Cuándo se ejecuta `loading.tsx` y por qué no lo importé en ningún sitio?

10. Si pongo el botón de "Nueva tarea" como Server Component, ¿qué error me da y por qué?

> Consejo: graba un loom de 5 minutos explicando el proyecto como si fuera una entrevista. Es la mejor forma de detectar qué partes aún no dominas.

---

**Siguiente paso**: lee la sección 5 con el código abierto en VS Code, sigue el flujo línea por línea. Después intenta romper algo y arreglarlo (por ejemplo, quitar el check de propietario en `deleteTask` y ver qué dejarías de proteger).
