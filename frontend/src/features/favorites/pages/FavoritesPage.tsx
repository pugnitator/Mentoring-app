import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { Button } from '../../../shared/ui/Button';
import type { FavoriteMentorItem } from '../../../shared/types/mentors';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function FavoriteCard({
  item,
  onRemove,
  removeLoading,
  error,
}: {
  item: FavoriteMentorItem;
  onRemove: (mentorId: string) => void;
  removeLoading: boolean;
  error: string | null;
}) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          {item.firstName} {item.lastName}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(item.createdAt)}
        </span>
      </div>
      <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">{item.specialty}</p>
      <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        {item.acceptsRequests ? 'Принимает заявки' : 'Не принимает заявки'}
      </p>
      {item.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {item.tags.map((t) => (
            <span
              key={t.id}
              className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
            >
              {t.name}
            </span>
          ))}
        </div>
      )}
      {error && (
        <p className="mb-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={removeLoading}
          className="inline-flex min-w-[11rem] items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
        >
          {removeLoading && (
            <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          )}
          Удалить из избранного
        </button>
        <Link
          to={`/mentors/${item.id}`}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Подробнее
        </Link>
      </div>
    </article>
  );
}

export function FavoritesPage() {
  const { data: favorites, isLoading, error, isError } = useFavorites(true);
  const removeFavorite = useRemoveFavorite();
  const [errorByMentor, setErrorByMentor] = useState<Record<string, string>>({});

  const handleRemove = (mentorId: string) => {
    setErrorByMentor((prev) => ({ ...prev, [mentorId]: '' }));
    removeFavorite.mutate(mentorId, {
      onError: (err) => {
        setErrorByMentor((prev) => ({
          ...prev,
          [mentorId]: getErrorMessage(err),
        }));
      },
    });
  };

  const statusCode = (error as { response?: { status?: number } })?.response?.status;
  const is403 = statusCode === 403;

  if (isError && is403) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
          {is403
            ? 'Доступно только для пользователей с ролью «Менти».'
            : getErrorMessage(error)}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/mentors"><Button>Каталог менторов</Button></Link>
          <Link to="/"><Button variant="secondary">На главную</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Избранное
      </h1>

      {isLoading ? (
        <LoadingSpinner className="py-16" />
      ) : !favorites || favorites.length === 0 ? (
        <EmptyState
          icon="★"
          title="Пока никого нет"
          description="Добавляйте менторов в избранное из каталога."
          action={
            <Link to="/mentors">
              <Button>Перейти в каталог</Button>
            </Link>
          }
        />
      ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item) => (
              <FavoriteCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                removeLoading={removeFavorite.isPending && removeFavorite.variables === item.id}
                error={errorByMentor[item.id] ?? null}
              />
            ))}
          </div>
        )}
    </div>
  );
}
