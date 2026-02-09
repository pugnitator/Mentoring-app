import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const item: ToastItem = { id, message, type };
    setToasts((prev) => [...prev, item]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, dismissToast } = ctx;
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2"
      role="region"
      aria-label="Уведомления"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`
            flex items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg
            ${t.type === 'success' ? 'border-[var(--color-success)]/50 bg-[var(--color-success)]/15 text-[var(--color-text-primary)]' : ''}
            ${t.type === 'error' ? 'border-[var(--color-error)]/50 bg-[var(--color-error)]/15 text-[var(--color-text-primary)]' : ''}
            ${t.type === 'info' ? 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)]' : ''}
          `}
        >
          <span className="text-sm font-medium">{t.message}</span>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            className="shrink-0 rounded p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-start)]"
            aria-label="Закрыть"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
