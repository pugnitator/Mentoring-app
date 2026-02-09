/** Скелетон загрузки дашборда: приветствие + 3 KPI-плитки + карточки */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div className="h-8 w-64 rounded" style={{ background: 'var(--color-border)' }} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-[var(--radius-card)] p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="mb-2 h-9 w-12 rounded" style={{ background: 'var(--color-border)' }} />
            <div className="h-4 w-24 rounded" style={{ background: 'var(--color-border)' }} />
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <div className="h-6 w-56 rounded" style={{ background: 'var(--color-border)' }} />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-[var(--radius-card)] p-6"
              style={{
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="h-12 w-12 shrink-0 rounded-full" style={{ background: 'var(--color-border)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded" style={{ background: 'var(--color-border)' }} />
                <div className="h-3 w-full max-w-xs rounded" style={{ background: 'var(--color-border)' }} />
                <div className="h-3 w-24 rounded" style={{ background: 'var(--color-border)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
