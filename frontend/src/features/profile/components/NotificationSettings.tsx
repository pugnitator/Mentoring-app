import { useNotificationSettings, useUpdateNotificationSettings } from '../hooks/useProfile';
import { getErrorMessage } from '../../../shared/lib/errorHandler';

export function NotificationSettings() {
  const { data, isLoading } = useNotificationSettings();
  const update = useUpdateNotificationSettings();
  const emailEnabled = data?.emailEnabled ?? true;
  const errorMessage = update.error ? getErrorMessage(update.error) : null;

  const handleToggle = () => {
    update.mutate(
      { emailEnabled: !emailEnabled },
      {
        onError: () => {
          // Ошибка показывается через errorMessage
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка настроек…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Уведомления
      </h2>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
        Email-уведомления о новых заявках, решениях по заявкам и отвязке от ментора.
      </p>
      {errorMessage && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
      <label className="flex cursor-pointer items-center gap-3">
        <span className="relative inline-block h-6 w-11 shrink-0">
          <input
            type="checkbox"
            role="switch"
            aria-checked={emailEnabled}
            aria-label={emailEnabled ? 'Отключить уведомления по email' : 'Включить уведомления по email'}
            checked={emailEnabled}
            onChange={handleToggle}
            disabled={update.isPending}
            className="peer sr-only"
          />
          <span
            className={`
              absolute inset-0 rounded-full bg-gray-200 transition-colors
              peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2
              dark:bg-gray-600 peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500
            `}
          />
          <span
            className={`
              absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow
              transition-transform peer-checked:translate-x-5
            `}
          />
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {emailEnabled ? 'Уведомления по email включены' : 'Уведомления по email отключены'}
        </span>
      </label>
    </div>
  );
}
