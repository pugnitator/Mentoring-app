import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Подсказка под полем (например, формат email) */
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', required, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {label}
            {required && <span style={{ color: 'var(--color-error)' }} aria-hidden="true"> *</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`
            w-full min-h-[44px] rounded-[var(--radius-btn)] border px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-end)] focus:ring-offset-0
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>
        )}
        {error && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-error)' }} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
