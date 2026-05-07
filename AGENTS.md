<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TaskFlow — agent notes

Full-stack to-do app. Production target: Render + Neon.

## Stack gotchas

- **Next.js 16** — `params` and `searchParams` are `Promise`s on pages. Use the global `PageProps<'/route'>` helper. `cookies()` is async.
- **React 19** — `useActionState` (not `useFormState`).
- **Tailwind v4** — config lives in `globals.css` via `@theme`, not `tailwind.config.js`. Dark mode via `.dark` class declared with `@custom-variant dark (&:where(.dark, .dark *))`.
- **Prisma 6** — pinned. Prisma 7 dropped `url` in schema in favor of `prisma.config.ts` and broke `@auth/prisma-adapter`.
- **NextAuth v5 beta** — env vars use `AUTH_` prefix (`AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`). Config exports `{ handlers, auth, signIn, signOut }` from `src/lib/auth.ts`. Mount handlers at `app/api/auth/[...nextauth]/route.ts`. Middleware uses traditional `middleware.ts` (`export { auth as middleware }`).
- **Zod 4** — `{ error: '...' }` not `{ message: '...' }`.
- **Server Actions** — file-level `'use server'`. Always check `auth()` inside every action; POST endpoints are publicly reachable. Call `revalidatePath()` after mutations.

## Environment

Node lives at `C:\Program Files\nodejs\` but isn't on this shell session's PATH. Prefix PowerShell calls with `$env:PATH = "C:\Program Files\nodejs;$env:PATH";` and use `npm --prefix <project>` (no `cd`).

## Commands

```
npm run dev          # local dev server
npm run db:push      # sync schema to DB without migration history (dev)
npm run db:migrate   # create + apply a migration
npm run db:seed      # populate dev data
npm run db:studio    # browse data in Prisma Studio
```

## Architecture

- Server Components by default. `'use client'` only where interactivity demands.
- Auth checks live inside Server Actions — never trust the client.
- Categories are user-scoped (`@@unique([userId, name])`). Tasks ordered by integer `order` for drag-and-drop reorder.
