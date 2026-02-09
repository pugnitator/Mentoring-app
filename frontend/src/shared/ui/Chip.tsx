import { type ReactNode } from 'react';

type ChipVariant = 'default' | 'success' | 'error' | 'warning';

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  /** Для фильтров: выделение при выборе */
  selected?: boolean;
  className?: string;
}

const variantStyles: Record<ChipVariant, { bg: string; selected: string }> = {
  default: {
    bg: 'bg-[var(--color-border)]/50',
    selected: 'bg-gradient-to-r from-[var(--color-accent-start)] to-[var(--color-accent-end)] text-white',
  },
  success: {
    bg: 'bg-[var(--color-success)]/20',
    selected: 'bg-[var(--color-success)] text-white',
  },
  error: {
    bg: 'bg-[var(--color-error)]/20',
    selected: 'bg-[var(--color-error)] text-white',
  },
  warning: {
    bg: 'bg-[var(--color-warning)]/20',
    selected: 'bg-[var(--color-warning)] text-white',
  },
};

export function Chip({ children, variant = 'default', selected, className = '' }: ChipProps) {
  const styles = variantStyles[variant];
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
        ${selected ? styles.selected : styles.bg}
        ${!selected && 'text-[var(--color-text-primary)]'}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
