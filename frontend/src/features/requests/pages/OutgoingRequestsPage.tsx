import { Link } from 'react-router-dom';
import { useOutgoingRequests } from '../hooks/useRequests';
import { useMyProfile } from '../../profile/hooks/useProfile';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import type { RequestListItem } from '../../../shared/types/requests';
import type { RequestStatus } from '../../../shared/types/requests';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const STATUS_LABELS: Record<RequestStatus, string> = {
  SENT: 'На рассмотрении',
  ACCEPTED: 'Подтверждена',
  REJECTED: 'Отклонена',
  COMPLETED: 'Завершено',
};

const MESSAGE_PREVIEW_LEN = 200;

function truncateMessage(msg: string, max = MESSAGE_PREVIEW_LEN) {
  const t = msg.trim();
  return t.length <= max ? t : t.slice(0, max) + '…';
}

export function OutgoingRequestsPage() {
  const { data: profile } = useMyProfile();
  const isMentee = !!profile?.mentee;
  const { data: list, isLoading, isError } = useOutgoingRequests(isMentee);

  if (!isMentee) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>Доступно только для менти.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Мои заявки
        </h1>
        <LoadingSpinner className="py-16" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--color-error)' }}>Не удалось загрузить заявки</p>
        <Link to="/"><Button variant="secondary">На главную</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Мои заявки
      </h1>

      {!list || list.length === 0 ? (
        <EmptyState
          icon="📤"
          title="Пока нет заявок"
          description="Отправьте заявку ментору из каталога — она появится здесь."
          action={
            <Link to="/mentors"><Button>Перейти в каталог</Button></Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {list.map((item: RequestListItem) => (
            <li key={item.id}>
              <Card>
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/mentors/${item.mentorId}`}
                    className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {item.mentor?.profile?.firstName} {item.mentor?.profile?.lastName}
                  </Link>
                  {item.mentor?.profile?.specialty && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.mentor.profile.specialty}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <p className="mb-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {truncateMessage(item.message)}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Статус: {STATUS_LABELS[item.status]}
                {item.completedAt && ` · Завершено ${formatDate(item.completedAt)}`}
              </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
