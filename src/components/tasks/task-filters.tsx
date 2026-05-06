"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Category } from "@/types";

type Props = {
  categories: Pick<Category, "id" | "name" | "color">[];
};

export function TaskFilters({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");

  const setParam = React.useCallback(
    (key: string, value: string | null) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") sp.set(key, value);
      else sp.delete(key);
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setParam("q", search.trim() || null), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const status = searchParams.get("status") ?? "all";
  const priority = searchParams.get("priority") ?? "all";
  const category = searchParams.get("category") ?? "all";

  const hasFilters = status !== "all" || priority !== "all" || category !== "all" || search;

  const clear = () => {
    setSearch("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tareas..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Select
          value={status}
          onChange={(e) => setParam("status", e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="all">Todas</option>
          <option value="active">Pendientes</option>
          <option value="completed">Completadas</option>
        </Select>
        <Select
          value={priority}
          onChange={(e) => setParam("priority", e.target.value)}
          aria-label="Filtrar por prioridad"
        >
          <option value="all">Cualquier prioridad</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </Select>
        <Select
          value={category}
          onChange={(e) => setParam("category", e.target.value)}
          aria-label="Filtrar por categoría"
        >
          <option value="all">Todas las categorías</option>
          <option value="none">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="text-[var(--muted-foreground)]">
          <X className="size-3.5" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
