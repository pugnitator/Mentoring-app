import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTags, useMentorsCatalog } from '../hooks/useMentorsCatalog';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '../../favorites/hooks/useFavorites';
import { useOutgoingRequests } from '../../requests/hooks/useRequests';
import { useConnections } from '../../connections/hooks/useConnections';
import { useMyProfile } from '../../profile/hooks/useProfile';
import { isAuthenticated } from '../../../shared/api/auth';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { useSpecialties } from '../../profile/hooks/useSpecialties';
import { Chip } from '../../../shared/ui/Chip';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import type { MentorCatalogItem } from '../../../shared/types/mentors';

const LIMIT = 12;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface MentorCardProps {
  item: MentorCatalogItem;
  isInFavorites: boolean;
  canToggleFavorite: boolean;
  onAddFavorite: (mentorId: string) => void;
  onRemoveFavorite: (mentorId: string) => void;
  addFavoriteLoading: boolean;
  removeFavoriteLoading: boolean;
  favoriteError: string | null;
  /** Показывать кнопки «В избранное» и «Оставить заявку» (только для менти; для ментора скрыты) */
  showFavoriteAndRequest: boolean;
  /** Заявка этому ментору в статусе «на рассмотрении» (SENT) */
  hasPendingRequest?: boolean;
  /** С этим ментором уже есть активная связь */
  hasActiveConnection?: boolean;
}

function MentorCard({
  item,
  isInFavorites,
  canToggleFavorite,
  onAddFavorite,
  onRemoveFavorite,
  addFavoriteLoading,
  removeFavoriteLoading,
  favoriteError,
  showFavoriteAndRequest,
  hasPendingRequest = false,
  hasActiveConnection = false,
}: MentorCardProps) {
  const isLoading = addFavoriteLoading || removeFavoriteLoading;

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
      {showFavoriteAndRequest && item.favoritesCount > 0 && !isInFavorites && (
        <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
          В избранном: {item.favoritesCount}
        </p>
      )}
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
      {showFavoriteAndRequest && favoriteError && (
        <p className="mb-2 text-xs text-red-600 dark:text-red-400">{favoriteError}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {showFavoriteAndRequest &&
          (canToggleFavorite ? (
            isInFavorites ? (
              <button
                type="button"
                onClick={() => onRemoveFavorite(item.id)}
                disabled={isLoading}
                className="inline-flex min-w-[8.5rem] items-center justify-center gap-1.5 rounded-lg border border-amber-500 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100 disabled:opacity-50 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-200 dark:hover:bg-amber-900/30"
                title="Удалить из избранного"
              >
                {removeFavoriteLoading && (
                  <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                )}
                В избранном
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAddFavorite(item.id)}
                disabled={isLoading}
                className="inline-flex min-w-[8.5rem] items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Добавить в избранное"
              >
                {addFavoriteLoading && (
                  <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
                )}
                В избранное
              </button>
            )
          ) : (
            <span
              className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400 dark:border-gray-600 dark:text-gray-500"
              title={isAuthenticated() ? 'Доступно только для менти' : 'Войдите, чтобы добавлять в избранное'}
            >
              В избранное
            </span>
          ))}
        <Link
          to={`/mentors/${item.id}`}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Подробнее
        </Link>
        {showFavoriteAndRequest &&
          (hasActiveConnection ? (
            <span className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200">
              Вы уже сотрудничаете
            </span>
          ) : hasPendingRequest ? (
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
              Заявка отправлена и находится на рассмотрении
            </span>
          ) : (
            item.acceptsRequests && (
              <Link
                to={`/mentors/${item.id}/request`}
                className="rounded-lg border border-indigo-600 px-3 py-1.5 text-sm text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                Оставить заявку
              </Link>
            )
          ))}
      </div>
    </article>
  );
}

export function MentorsCatalogPage() {
  const [page, setPage] = useState(1);
  const [specialty, setSpecialty] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [acceptsRequests, setAcceptsRequests] = useState(true);
  const [favoriteErrorByMentor, setFavoriteErrorByMentor] = useState<Record<string, string>>({});

  const isAuth = isAuthenticated();
  const { data: profile } = useMyProfile(isAuth);
  const isMentee = !!profile?.mentee;
  const isMentor = !!profile?.mentor;
  const { data: favorites } = useFavorites(isAuth && isMentee);
  const { data: outgoingRequests } = useOutgoingRequests(isAuth && isMentee);
  const { data: connections } = useConnections(isAuth && isMentee);

  const favoriteMentorIds = useMemo(
    () => new Set((favorites ?? []).map((f) => f.id)),
    [favorites],
  );

  const mentorIdsWithPendingRequest = useMemo(() => {
    if (!outgoingRequests) return new Set<string>();
    return new Set(
      outgoingRequests.filter((r) => r.status === 'SENT').map((r) => r.mentorId),
    );
  }, [outgoingRequests]);

  const mentorIdsWithActiveConnection = useMemo(() => {
    if (!connections) return new Set<string>();
    return new Set(
      connections
        .filter((c) => c.status === 'ACTIVE')
        .map((c) => c.mentorId),
    );
  }, [connections]);

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const { data: tagsData } = useTags();
  const { data: specialtiesData } = useSpecialties();
  const tags = tagsData ?? [];
  const specialties = specialtiesData ?? [];
  const { data: catalog, isLoading } = useMentorsCatalog({
    page,
    limit: LIMIT,
    specialty: specialty || undefined,
    tagIds: tagIds.length ? tagIds : undefined,
    acceptsRequests,
  });

  const toggleTag = (id: string) => {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
    setPage(1);
  };

  const handleAddFavorite = (mentorId: string) => {
    setFavoriteErrorByMentor((prev) => ({ ...prev, [mentorId]: '' }));
    addFavorite.mutate(mentorId, {
      onError: (err) => {
        setFavoriteErrorByMentor((prev) => ({
          ...prev,
          [mentorId]: getErrorMessage(err),
        }));
      },
    });
  };

  const handleRemoveFavorite = (mentorId: string) => {
    setFavoriteErrorByMentor((prev) => ({ ...prev, [mentorId]: '' }));
    removeFavorite.mutate(mentorId, {
      onError: (err) => {
        setFavoriteErrorByMentor((prev) => ({
          ...prev,
          [mentorId]: getErrorMessage(err),
        }));
      },
    });
  };

  const totalPages = catalog ? Math.ceil(catalog.total / catalog.limit) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Каталог менторов
      </h1>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Фильтры
          </h2>
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
                Специальность
              </label>
              <select
                value={specialty}
                onChange={(e) => {
                  setSpecialty(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Все</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="mb-1 block text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Теги
              </span>
              {tags.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Загрузка...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="cursor-pointer rounded-full transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-start)] focus:ring-offset-2"
                    >
                      <Chip selected={tagIds.includes(tag.id)}>{tag.name}</Chip>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={acceptsRequests}
                  onChange={(e) => {
                    setAcceptsRequests(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Только принимающие заявки
                </span>
              </label>
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-16" label="Загрузка каталога..." />
        ) : catalog && catalog.items.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Менторы не найдены</p>
        ) : catalog ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.items.map((item) => (
                <MentorCard
                  key={item.id}
                  item={item}
                  isInFavorites={favoriteMentorIds.has(item.id)}
                  canToggleFavorite={isMentee}
                  onAddFavorite={handleAddFavorite}
                  onRemoveFavorite={handleRemoveFavorite}
                  addFavoriteLoading={addFavorite.isPending && addFavorite.variables === item.id}
                  removeFavoriteLoading={removeFavorite.isPending && removeFavorite.variables === item.id}
                  favoriteError={favoriteErrorByMentor[item.id] ?? null}
                  showFavoriteAndRequest={!isMentor}
                  hasPendingRequest={mentorIdsWithPendingRequest.has(item.id)}
                  hasActiveConnection={mentorIdsWithActiveConnection.has(item.id)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-600"
                >
                  Назад
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Страница {page} из {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50 dark:border-gray-600"
                >
                  Вперёд
                </button>
              </div>
            )}
          </>
        ) : null}
    </div>
  );
}
