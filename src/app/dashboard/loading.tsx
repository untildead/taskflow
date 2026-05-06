export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 h-[78px]"
          />
        ))}
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-[var(--muted)]" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-7 rounded bg-[var(--muted)]" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-10 rounded-lg bg-[var(--muted)]" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 rounded-lg bg-[var(--muted)]" />
            <div className="h-10 rounded-lg bg-[var(--muted)]" />
            <div className="h-10 rounded-lg bg-[var(--muted)]" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 h-20"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
