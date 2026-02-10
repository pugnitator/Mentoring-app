import { useState, useRef, useEffect } from 'react';

export interface SearchableSelectOption {
  value: string;
  search?: string;
}

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SearchableSelectOption[] | readonly string[];
  required?: boolean;
  error?: string;
  placeholder?: string; // показывается на кнопке, когда значение пустое
}

function normalizeOptions(
  options: readonly SearchableSelectOption[] | readonly string[]
): SearchableSelectOption[] {
  return options.map((opt) =>
    typeof opt === 'string' ? { value: opt, search: opt } : opt
  );
}

export function SearchableSelect({
  label,
  value,
  onChange,
  options,
  required,
  error,
  placeholder = 'Выберите...',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const opts = normalizeOptions(options);
  const searchLower = search.trim().toLowerCase();
  const filtered =
    searchLower === ''
      ? opts
      : opts.filter((o) => {
          const text = (o.search ?? o.value).toLowerCase();
          return text.includes(searchLower);
        });

  const displayValue = value;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const borderColor = error ? 'var(--color-error)' : 'var(--color-border)';

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          className="mb-1 block text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--color-error)' }} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full rounded-[var(--radius-btn)] border px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-end)] focus:ring-offset-0"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor,
            color: 'var(--color-text-primary)',
          }}
        >
          <span
            style={{
              color: displayValue ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            }}
          >
            {displayValue || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414l-3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {open && (
          <div
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-[var(--radius-card)] border py-1 shadow-lg"
            role="listbox"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="sticky top-0 px-2 py-1 border-b"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Поиск..."
                className="w-full rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-end)]"
                autoFocus
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            {filtered.length === 0 ? (
              <div
                className="px-3 py-2 text-sm"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Ничего не найдено
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={value === opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="w-full px-3 py-2 text-left text-sm"
                  style={{
                    color: 'var(--color-text-primary)',
                    backgroundColor:
                      value === opt.value ? 'rgba(59,130,246,0.12)' : 'transparent',
                  }}
                >
                  {opt.value}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--color-error)' }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
