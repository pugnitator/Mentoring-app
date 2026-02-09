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

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500" aria-hidden="true"> *</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`
            w-full rounded-lg border px-3 py-2 text-left text-gray-900 placeholder-gray-500
            focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
            ${error ? 'border-red-500' : 'border-gray-300'}
          `}
        >
          <span className={displayValue ? '' : 'text-gray-500 dark:text-gray-400'}>
            {displayValue || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
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
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
            role="listbox"
          >
            <div className="sticky top-0 border-b border-gray-200 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-800">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Поиск..."
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                autoFocus
              />
            </div>
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
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
                  className={`
                    w-full px-3 py-2 text-left text-sm
                    ${value === opt.value ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-200' : 'text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700'}
                  `}
                >
                  {opt.value}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
