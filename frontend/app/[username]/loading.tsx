export default function Loading() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--black)]/90">
        <span className="font-mono text-sm font-bold text-[var(--acid)]">FLOWW</span>
      </nav>

      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="w-16 h-16 border border-[var(--border)] bg-[var(--surface-2)] mb-6 animate-pulse" />
          <div className="h-8 w-48 bg-[var(--surface-2)] rounded mb-3 animate-pulse" />
          <div className="h-4 w-32 bg-[var(--surface-2)] rounded mb-6 animate-pulse" />
          <div className="h-4 w-80 bg-[var(--surface-2)] rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-[var(--surface-2)] rounded mb-8 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-[var(--surface-2)] animate-pulse" />
            <div className="h-10 w-28 bg-[var(--surface-2)] animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[var(--border)] p-6 animate-pulse">
              <div className="h-5 w-48 bg-[var(--surface-2)] rounded mb-3" />
              <div className="h-4 w-full bg-[var(--surface-2)] rounded mb-2" />
              <div className="h-4 w-3/4 bg-[var(--surface-2)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
