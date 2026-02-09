import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMentorById } from '../hooks/useMentorsCatalog';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../../favorites/hooks/useFavorites';
import { useMyProfile } from '../../profile/hooks/useProfile';
import { isAuthenticated } from '../../../shared/api/auth';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { Avatar } from '../../profile/components/Avatar';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const LEVEL_LABELS: Record<string, string> = {
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead',
};

export function MentorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const isAuth = isAuthenticated();
  const { data: profile } = useMyProfile(isAuth);
  const isMentee = !!profile?.mentee;
  const { data: favorites } = useFavorites(isAuth && isMentee);
  const isInFavorites = !!id && (favorites ?? []).some((f) => f.id === id);

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const { data: mentor, isLoading, error, isError } = useMentorById(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
      </div>
    );
  }

  if (isError || !mentor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          {error && (error as { response?: { status?: number } })?.response?.status === 404
            ? 'Ментор не найден'
            : 'Ошибка загрузки'}
        </p>
        <Link to="/mentors" className="text-indigo-600 dark:text-indigo-400">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const fullName = [
    mentor.profile.lastName,
    mentor.profile.firstName,
    mentor.profile.middleName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/mentors" className="text-indigo-600 dark:text-indigo-400">
            ← Каталог менторов
          </Link>
          <div className="flex gap-4">
            <Link to="/favorites" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              Избранное
            </Link>
            <Link to="/" className="text-sm text-gray-600 dark:text-gray-400">
              На главную
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start gap-4">
            <Avatar
              avatarUrl={mentor.profile.avatarUrl}
              firstName={mentor.profile.firstName}
              lastName={mentor.profile.lastName}
              size="lg"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {fullName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                В каталоге с {formatDate(mentor.profile.createdAt)}
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {mentor.profile.specialty}
                {mentor.profile.level && ` • ${LEVEL_LABELS[mentor.profile.level] ?? mentor.profile.level}`}
              </p>
              {mentor.profile.city && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mentor.profile.city}
                </p>
              )}
            </div>
          </div>

          {mentor.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {mentor.tags.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full bg-indigo-100 px-2 py-1 text-sm text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}

          {(mentor.favoritesCount ?? 0) > 0 && !isInFavorites && (
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              В избранном: {mentor.favoritesCount}
            </p>
          )}
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {mentor.acceptsRequests ? 'Принимает заявки' : 'Не принимает заявки'}
            {!mentor.acceptsRequests && mentor.statusComment && (
              <span className="block mt-1 font-normal text-gray-600 dark:text-gray-400">
                {mentor.statusComment}
              </span>
            )}
          </p>

          {mentor.profile.bio && (
            <section className="mb-4">
              <h2 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                О себе
              </h2>
              <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                {mentor.profile.bio}
              </p>
            </section>
          )}

          <section className="mb-4">
            <h2 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Описание услуг
            </h2>
            <p className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">
              {mentor.description}
            </p>
          </section>

          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Формат работы:</span> {mentor.workFormat}
          </p>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Макс. активных менти:</span> {mentor.maxMentees}
          </p>

          {favoriteError && (
            <p className="mb-2 text-sm text-red-600 dark:text-red-400">{favoriteError}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {isMentee ? (
              isInFavorites ? (
                <button
                  type="button"
                  onClick={() => {
                    setFavoriteError(null);
                    removeFavorite.mutate(mentor.id, {
                      onError: (err) => setFavoriteError(getErrorMessage(err)),
                    });
                  }}
                  disabled={removeFavorite.isPending}
                  className="inline-flex min-w-[8.5rem] items-center justify-center gap-1.5 rounded-lg border border-amber-500 bg-amber-50 px-4 py-2 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-200 dark:hover:bg-amber-900/30"
                >
                  {removeFavorite.isPending && (
                    <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                  )}
                  В избранном
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setFavoriteError(null);
                    addFavorite.mutate(mentor.id, {
                      onError: (err) => setFavoriteError(getErrorMessage(err)),
                    });
                  }}
                  disabled={addFavorite.isPending}
                  className="inline-flex min-w-[8.5rem] items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {addFavorite.isPending && (
                    <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                  )}
                  В избранное
                </button>
              )
            ) : (
              <span
                className="cursor-not-allowed rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-400 dark:border-gray-600 dark:text-gray-500"
                title={isAuth ? 'Доступно только для менти' : 'Войдите, чтобы добавлять в избранное'}
              >
                В избранное
              </span>
            )}
            {mentor.acceptsRequests && (
              <Link
                to={`/mentors/${mentor.id}/request`}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                Оставить заявку
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
