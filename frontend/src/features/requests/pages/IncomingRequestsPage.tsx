import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIncomingRequests, useAcceptRequest, useRejectRequest } from '../hooks/useRequests';
import { useMyProfile } from '../../profile/hooks/useProfile';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { useToast } from '../../../shared/context/ToastContext';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import type { RequestListItem, RequestWithContact } from '../../../shared/types/requests';
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

export function IncomingRequestsPage() {
  const { data: profile } = useMyProfile();
  const isMentor = !!profile?.mentor;
  const { data: list, isLoading, isError } = useIncomingRequests(isMentor);
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();
  const toast = useToast();
  const [errorByRequest, setErrorByRequest] = useState<Record<string, string>>({});
  const [contactByRequest, setContactByRequest] = useState<
    Record<string, { email: string; firstName: string; lastName: string }>
  >({});

  const handleAccept = (requestId: string) => {
    setErrorByRequest((p) => ({ ...p, [requestId]: '' }));
    acceptRequest.mutate(requestId, {
      onSuccess: (data: RequestWithContact) => {
        toast.showToast('Заявка принята', 'success');
        if (data.menteeContact) {
          setContactByRequest((p) => ({ ...p, [data.id]: data.menteeContact! }));
        }
      },
      onError: (err) => {
        setErrorByRequest((p) => ({ ...p, [requestId]: getErrorMessage(err) }));
      },
    });
  };

  const handleReject = (requestId: string) => {
    setErrorByRequest((p) => ({ ...p, [requestId]: '' }));
    rejectRequest.mutate(requestId, {
      onSuccess: () => toast.showToast('Заявка отклонена', 'info'),
      onError: (err) => {
        setErrorByRequest((p) => ({ ...p, [requestId]: getErrorMessage(err) }));
      },
    });
  };

  if (!isMentor) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>Доступно только для менторов.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Входящие заявки
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
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Входящие заявки
        </h1>
        <Link to="/connections">
          <Button variant="secondary">Мои менти</Button>
        </Link>
      </div>

      {!list || list.length === 0 ? (
        <EmptyState
          icon="📩"
          title="Пока нет заявок"
          description="Входящие заявки от менти появятся здесь."
          action={
            <Link to="/mentors"><Button>Каталог менторов</Button></Link>
          }
        />
      ) : (
        <ul className="space-y-4">
          {list.map((item: RequestListItem) => (
            <li key={item.id}>
              <Card>
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {item.mentee?.profile?.firstName} {item.mentee?.profile?.lastName}
                  </p>
                  {item.mentee?.goal != null && item.mentee.goal !== '' && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Цель: {item.mentee.goal}
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
              <p className="mb-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Статус: {STATUS_LABELS[item.status]}
                {item.completedAt && ` · Завершено ${formatDate(item.completedAt)}`}
              </p>

              {contactByRequest[item.id] && (
                <div className="mb-2 rounded-lg border border-green-200 bg-green-50 p-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                  <p className="font-medium">Контакт менти:</p>
                  <p>
                    {contactByRequest[item.id].firstName} {contactByRequest[item.id].lastName} —{' '}
                    <a
                      href={`mailto:${contactByRequest[item.id].email}`}
                      className="underline"
                    >
                      {contactByRequest[item.id].email}
                    </a>
                  </p>
                </div>
              )}

              {errorByRequest[item.id] && (
                <p className="mb-2 text-sm text-red-600 dark:text-red-400">
                  {errorByRequest[item.id]}
                </p>
              )}

              {item.status === 'SENT' && !item.completedAt && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(item.id)}
                    disabled={acceptRequest.isPending || rejectRequest.isPending}
                    loading={acceptRequest.isPending && acceptRequest.variables === item.id}
                  >
                    Принять
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleReject(item.id)}
                    disabled={acceptRequest.isPending || rejectRequest.isPending}
                    loading={rejectRequest.isPending && rejectRequest.variables === item.id}
                  >
                    Отклонить
                  </Button>
                </div>
              )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
