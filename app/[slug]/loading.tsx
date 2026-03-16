export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200" />
      </div>

      {/* KPI cards skeleton */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-7 w-28 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Narrativa skeleton */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      {/* Tabela skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
