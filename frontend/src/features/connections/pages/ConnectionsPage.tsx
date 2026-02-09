import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProfile } from '../../profile/hooks/useProfile';
import { useConnections, useCompleteConnection, useDetachConnection } from '../hooks/useConnections';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { useToast } from '../../../shared/context/ToastContext';
import { Button } from '../../../shared/ui/Button';
import { Textarea } from '../../../shared/ui/Textarea';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { Card } from '../../../shared/ui/Card';
import type { ConnectionItem } from '../../../shared/types/connections';

const REASON_MAX = 500;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ConnectionsPage() {
  const { data: profile } = useMyProfile();
  const isMentor = !!profile?.mentor;
  const isMentee = !!profile?.mentee;
  const hasRole = isMentor || isMentee;
  const toast = useToast();

  const { data: connections, isLoading, isError } = useConnections(hasRole);
  const completeConnection = useCompleteConnection();
  const detachConnection = useDetachConnection();

  const [detachModal, setDetachModal] = useState<{ connection: ConnectionItem } | null>(null);
  const [completeModal, setCompleteModal] = useState<{ connection: ConnectionItem } | null>(null);
  const [reason, setReason] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const allConnections = connections ?? [];
  const activeNotCompleted = allConnections.filter((c) => c.status === 'ACTIVE' && !c.completedAt);

  const handleOpenDetach = (connection: ConnectionItem) => {
    setDetachModal({ connection });
    setReason('');
    setModalError(null);
  };

  const handleCloseDetach = () => {
    setDetachModal(null);
    setReason('');
    setModalError(null);
  };

  const handleConfirmDetach = () => {
    if (!detachModal) return;
    if (reason.length > REASON_MAX) {
      setModalError(`Причина не должна превышать ${REASON_MAX} символов`);
      return;
    }
    setModalError(null);
    detachConnection.mutate(
      { connectionId: detachModal.connection.id, data: { reason: reason.trim() || undefined } },
      {
        onSuccess: handleCloseDetach,
        onError: (err) => setModalError(getErrorMessage(err)),
      },
    );
  };

  const handleComplete = (conn: ConnectionItem) => {
    setCompleteModal({ connection: conn });
  };

  const handleConfirmComplete = () => {
    if (!completeModal) return;
    completeConnection.mutate(completeModal.connection.id, {
      onSuccess: () => {
        toast.showToast('Менторство отмечено как завершённое', 'success');
        setCompleteModal(null);
      },
      onError: (err) => toast.showToast(getErrorMessage(err), 'error'),
    });
  };

  if (!hasRole) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Доступно только для пользователей с ролью «Ментор» или «Менти».
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {isMentor ? 'Мои менти' : 'Мои менторы'}
        </h1>
        <LoadingSpinner className="py-16" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--color-error)' }}>Не удалось загрузить связи</p>
        <Link to="/"><Button variant="secondary">На главную</Button></Link>
      </div>
    );
  }

  const pageTitle = isMentor ? 'Мои менти' : 'Мои менторы';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {pageTitle}
      </h1>

      {allConnections.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Пока никого нет"
          description={
            isMentee
              ? 'Активные связи появятся после принятия ваших заявок менторами.'
              : 'Активные связи появятся после того, как вы примете заявки от менти.'
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/mentors"><Button>Каталог менторов</Button></Link>
              {isMentee && (
                <Link to="/requests/outgoing"><Button variant="secondary">Мои заявки</Button></Link>
              )}
              {isMentor && (
                <Link to="/requests/incoming"><Button variant="secondary">Входящие заявки</Button></Link>
              )}
            </div>
          }
        />
      ) : (
        <ul className="space-y-4">
          {allConnections.map((conn) => (
            <li key={conn.id}>
              <Card>
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    {conn.contact ? (
                      <>
                        <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {conn.contact.firstName} {conn.contact.lastName}
                        </p>
                        <a
                          href={`mailto:${conn.contact.email}`}
                          className="text-sm"
                          style={{ color: 'var(--color-accent-blue)' }}
                        >
                          {conn.contact.email}
                        </a>
                      </>
                    ) : (
                      <p style={{ color: 'var(--color-text-muted)' }}>Контакт</p>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    С {formatDate(conn.createdAt)}
                  </span>
                </div>
                {conn.status === 'ACTIVE' && conn.completedAt && (
                  <p className="mb-2 text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                    Курс завершён · {formatDate(conn.completedAt)}
                  </p>
                )}
                {conn.status === 'DETACHED' && (
                  <p className="mb-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {conn.completedAt
                      ? `Завершено ранее · ${formatDate(conn.completedAt)}. Связь прекращена${conn.detachedAt ? ` · ${formatDate(conn.detachedAt)}` : ''}`
                      : `Связь прекращена${conn.detachedAt ? ` · ${formatDate(conn.detachedAt)}` : ''}`}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {conn.status === 'ACTIVE' && !conn.completedAt && (
                    <Button
                      size="sm"
                      onClick={() => handleComplete(conn)}
                      disabled={completeConnection.isPending}
                      loading={completeConnection.isPending && completeConnection.variables === conn.id}
                    >
                      Завершить менторство
                    </Button>
                  )}
                  {conn.status === 'ACTIVE' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenDetach(conn)}
                      disabled={detachConnection.isPending}
                    >
                      Открепиться
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {completeModal && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="complete-modal-title"
        >
          <div
            className="w-full max-w-md rounded-xl p-6 shadow-lg"
            style={{ background: 'var(--color-surface)' }}
          >
            <h2 id="complete-modal-title" className="mb-4 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Завершить менторство?
            </h2>
            <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Вы уверены, что хотите отметить менторство как завершённое? После этого связь можно будет отвязать, но факт завершения сохранится в истории.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleConfirmComplete}
                disabled={completeConnection.isPending}
                loading={completeConnection.isPending}
              >
                Да, завершить
              </Button>
              <Button variant="secondary" onClick={() => setCompleteModal(null)} disabled={completeConnection.isPending}>
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}

      {detachModal && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detach-modal-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 id="detach-modal-title" className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Прекратить связь?
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Связь будет отменена. Второй стороне придёт уведомление. Контактные данные станут недоступны.
            </p>
            <div className="mb-4">
              <label htmlFor="detach-reason" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Причина <span className="text-gray-400">(необязательно)</span>
              </label>
              <Textarea
                id="detach-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Укажите причину при необходимости"
                maxLength={REASON_MAX}
                rows={3}
                className="w-full"
                aria-describedby={modalError ? 'detach-error' : 'detach-reason-hint'}
              />
              <p id="detach-reason-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                До {REASON_MAX} символов
              </p>
            </div>
            {modalError && (
              <p id="detach-error" className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
                {modalError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="danger"
                onClick={handleConfirmDetach}
                disabled={detachConnection.isPending}
              >
                {detachConnection.isPending ? 'Отправка…' : 'Подтвердить'}
              </Button>
              <Button variant="secondary" onClick={handleCloseDetach} disabled={detachConnection.isPending}>
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
