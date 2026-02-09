import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Optional icon: SVG or emoji */
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl px-6 py-12 text-center"
      style={{
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)',
        borderRadius: 'var(--radius-card)',
      }}
    >
      {icon && (
        <div className="mb-4 text-4xl opacity-70" style={{ color: 'var(--color-text-muted)' }}>
          {icon}
        </div>
      )}
      <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      {description && (
        <p className="mb-6 max-w-sm text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
