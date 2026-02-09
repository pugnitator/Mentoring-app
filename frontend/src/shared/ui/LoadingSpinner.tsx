interface LoadingSpinnerProps {
  className?: string;
  /** For accessibility */
  label?: string;
}

export function LoadingSpinner({ className = '', label = 'Загрузка' }: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label={label}
    >
      <span
        className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent-start)]"
        aria-hidden
      />
      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </span>
    </div>
  );
}
