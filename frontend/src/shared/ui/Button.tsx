import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'btn-primary-gradient border-0 shadow-[var(--shadow-card)] hover:scale-[1.02] transition-transform duration-150 ease-out',
  secondary:
    'bg-transparent border-2 border-[var(--color-accent-blue)] text-[var(--color-accent-blue)] hover:bg-[var(--color-accent-blue)]/10 focus:ring-[var(--color-accent-blue)] dark:border-[var(--color-accent-blue)] dark:text-[var(--color-accent-blue)]',
  danger:
    'bg-[var(--color-error)] text-white border-0 hover:opacity-90 focus:ring-[var(--color-error)] dark:bg-[var(--color-error)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 min-h-[36px] text-sm rounded-[var(--radius-btn)]',
  md: 'px-6 py-3 min-h-[44px] text-base rounded-[var(--radius-btn)]',
  lg: 'px-6 py-3 min-h-[48px] text-lg rounded-[var(--radius-btn)]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-page)]
        disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Загрузка...
        </>
      ) : (
        children
      )}
    </button>
  );
}
