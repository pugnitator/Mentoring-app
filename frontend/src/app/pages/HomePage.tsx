import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProfile } from '../../features/profile/hooks/useProfile';
import { useDashboard } from '../../features/dashboard/hooks/useDashboard';
import { useAcceptRequest, useRejectRequest } from '../../features/requests/hooks/useRequests';
import { useCompleteConnection, useDetachConnection } from '../../features/connections/hooks/useConnections';
import { useToast } from '../../shared/context/ToastContext';
import { getErrorMessage } from '../../shared/lib/errorHandler';
import { Button } from '../../shared/ui/Button';
import { Card } from '../../shared/ui/Card';
import { Textarea } from '../../shared/ui/Textarea';
import { EmptyState } from '../../shared/ui/EmptyState';
import { InitialsAvatar } from '../../shared/ui/InitialsAvatar';
import { DashboardSkeleton } from '../../features/dashboard/components/DashboardSkeleton';
import type {
  DashboardResponse,
  DashboardPendingRequest,
  DashboardConnectionItem,
  DashboardCompletedItem,
} from '../../shared/types/dashboard';

const REASON_MAX = 500;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function SectionTitle({
  title,
  count,
  linkTo,
  linkLabel,
}: {
  title: string;
  count: number;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
        {title} {count > 0 && `(${count})`}
      </h2>
      {linkTo && linkLabel && (
        <Link to={linkTo} className="text-sm" style={{ color: 'var(--color-accent-blue)' }}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function KPITiles({
  pendingCount,
  activeCount,
  completedCount,
  isMentor,
}: {
  pendingCount: number;
  activeCount: number;
  completedCount: number;
  isMentor: boolean;
}) {
  const labels = isMentor
    ? ['Заявки на рассмотрении', 'Активные менти', 'Завершённые менторства']
    : ['Заявки на рассмотрении', 'Активные связи', 'Завершённые курсы'];
  const values = [pendingCount, activeCount, completedCount];
  const icons = ['✉️', '👥', '✓'];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {values.map((value, i) => (
        <div
          key={i}
          className="relative rounded-[var(--radius-card)] p-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: 'var(--shadow-card)',
            borderLeft: i === 0 ? '4px solid var(--color-warning)' : i === 1 ? '4px solid var(--color-accent-secondary)' : '4px solid var(--color-success)',
          }}
        >
          <span className="absolute right-4 top-4 text-xl opacity-70" aria-hidden>
            {icons[i]}
          </span>
          <p className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {value}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {labels[i]}
          </p>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const { data: profile } = useMyProfile();
  const isAdmin = profile?.user?.role === 'ADMIN';
  const isMentor = !!profile?.mentor;
  const isMentee = !!profile?.mentee;
  const hasRole = isMentor || isMentee;

  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardError } = useDashboard(hasRole && !isAdmin);
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();
  const completeConnection = useCompleteConnection();
  const detachConnection = useDetachConnection();
  const toast = useToast();

  const [detachModal, setDetachModal] = useState<{ connectionId: string; otherName?: string } | null>(null);
  const [completeModal, setCompleteModal] = useState<{ connectionId: string } | null>(null);
  const [reason, setReason] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [errorByRequestId, setErrorByRequestId] = useState<Record<string, string>>({});

  const handleAccept = (requestId: string) => {
    setErrorByRequestId((p) => ({ ...p, [requestId]: '' }));
    acceptRequest.mutate(requestId, {
      onSuccess: () => toast.showToast('Заявка принята', 'success'),
      onError: (err) => setErrorByRequestId((p) => ({ ...p, [requestId]: getErrorMessage(err) })),
    });
  };

  const handleReject = (requestId: string) => {
    setErrorByRequestId((p) => ({ ...p, [requestId]: '' }));
    rejectRequest.mutate(requestId, {
      onSuccess: () => toast.showToast('Заявка отклонена', 'info'),
      onError: (err) => setErrorByRequestId((p) => ({ ...p, [requestId]: getErrorMessage(err) })),
    });
  };

  const handleComplete = (connectionId: string) => setCompleteModal({ connectionId });
  const handleConfirmComplete = () => {
    if (!completeModal) return;
    completeConnection.mutate(completeModal.connectionId, {
      onSuccess: () => {
        toast.showToast('Менторство отмечено как завершённое', 'success');
        setCompleteModal(null);
      },
      onError: (err) => toast.showToast(getErrorMessage(err), 'error'),
    });
  };

  const handleOpenDetach = (connectionId: string, otherName?: string) => {
    setDetachModal({ connectionId, otherName });
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
      { connectionId: detachModal.connectionId, data: { reason: reason.trim() || undefined } },
      {
        onSuccess: handleCloseDetach,
        onError: (err) => setModalError(getErrorMessage(err)),
      },
    );
  };

  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Добро пожаловать
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Используйте админ-панель для управления.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/admin">
            <Button>Админ-панель</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (hasRole && dashboardLoading) {
    return <DashboardSkeleton />;
  }

  if (hasRole && !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Добро пожаловать
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {isMentee && 'Найдите ментора и отправьте заявку.'}
          {isMentor && 'Просматривайте входящие заявки и управляйте связями.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/mentors"><Button>Каталог менторов</Button></Link>
          {isMentee && <Link to="/favorites"><Button variant="secondary">Избранное</Button></Link>}
          {isMentor && <Link to="/requests/incoming"><Button variant="secondary">Входящие заявки</Button></Link>}
          {isMentee && <Link to="/requests/outgoing"><Button variant="secondary">Мои заявки</Button></Link>}
          <Link to="/connections"><Button variant="secondary">{isMentee ? 'Мои менторы' : 'Мои менти'}</Button></Link>
          <Link to="/profile"><Button variant="secondary">Профиль</Button></Link>
        </div>
      </div>
    );
  }

  if (hasRole && dashboard) {
    const firstName = profile?.firstName ?? '';
    const greeting = firstName.trim() ? `Добро пожаловать, ${firstName}` : 'Добро пожаловать';
    return (
      <div className="mx-auto max-w-3xl space-y-8 py-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          {greeting}
        </h1>

        <KPITiles
          pendingCount={dashboard.summary.pendingRequestsCount}
          activeCount={dashboard.summary.activeConnectionsCount}
          completedCount={dashboard.summary.completedMentorshipsCount}
          isMentor={dashboard.role === 'MENTOR'}
        />

        <DashboardSections
          dashboard={dashboard}
          onAccept={handleAccept}
          onReject={handleReject}
          onComplete={handleComplete}
          onDetach={handleOpenDetach}
          acceptLoading={acceptRequest.isPending}
          rejectLoading={rejectRequest.isPending}
          acceptVariable={acceptRequest.variables}
          rejectVariable={rejectRequest.variables}
          completeLoading={completeConnection.isPending}
          completeVariable={completeConnection.variables}
          detachLoading={detachConnection.isPending}
          errorByRequestId={errorByRequestId}
        />

        <nav className="flex flex-wrap gap-3 pt-2" aria-label="Быстрые действия">
          <Link to="/mentors" className="text-sm" style={{ color: 'var(--color-accent-blue)' }}>Каталог</Link>
          {isMentee && <Link to="/favorites" className="text-sm" style={{ color: 'var(--color-accent-blue)' }}>Избранное</Link>}
          {isMentor && <Link to="/requests/incoming" className="text-sm" style={{ color: 'var(--color-accent-blue)' }}>Входящие заявки</Link>}
          {isMentee && <Link to="/requests/outgoing" className="text-sm" style={{ color: 'var(--color-accent-blue)' }}>Мои заявки</Link>}
          <Link to="/connections" className="text-sm" style={{ color: 'var(--color-accent-blue)' }}>{isMentee ? 'Мои менторы' : 'Мои менти'}</Link>
          <Link to="/profile" className="text-sm" style={{ color: 'var(--color-accent-blue)' }}>Профиль</Link>
        </nav>

        {completeModal && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-[var(--radius-modal)] p-6 shadow-lg" style={{ background: 'var(--color-surface)' }}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Завершить менторство?
              </h2>
              <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Вы уверены, что хотите отметить менторство как завершённое?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleConfirmComplete} disabled={completeConnection.isPending} loading={completeConnection.isPending}>
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
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-[var(--radius-modal)] p-6 shadow-lg" style={{ background: 'var(--color-surface)' }}>
              <h2 className="mb-4 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Прекратить связь?
              </h2>
              <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Связь будет отменена. Укажите причину при необходимости.
              </p>
              <div className="mb-4">
                <label className="mb-1 block text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Причина <span style={{ color: 'var(--color-text-muted)' }}>(необязательно)</span>
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Укажите причину при необходимости"
                  maxLength={REASON_MAX}
                  rows={3}
                  className="w-full"
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>До {REASON_MAX} символов</p>
              </div>
              {modalError && (
                <p className="mb-2 text-sm" style={{ color: 'var(--color-error)' }}>{modalError}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="danger" onClick={handleConfirmDetach} disabled={detachConnection.isPending}>
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

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Добро пожаловать
      </h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Заполните профиль, чтобы начать.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/mentors"><Button>Каталог менторов</Button></Link>
        <Link to="/profile"><Button variant="secondary">Профиль</Button></Link>
      </div>
    </div>
  );
}

interface DashboardSectionsProps {
  dashboard: DashboardResponse;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onComplete: (connectionId: string) => void;
  onDetach: (connectionId: string, otherName?: string) => void;
  acceptLoading: boolean;
  rejectLoading: boolean;
  acceptVariable: string | undefined;
  rejectVariable: string | undefined;
  completeLoading: boolean;
  completeVariable: string | undefined;
  detachLoading: boolean;
  errorByRequestId: Record<string, string>;
}

function DashboardSections({
  dashboard,
  onAccept,
  onReject,
  onComplete,
  onDetach,
  acceptLoading,
  rejectLoading,
  acceptVariable,
  rejectVariable,
  completeLoading,
  completeVariable,
  detachLoading,
  errorByRequestId,
}: DashboardSectionsProps) {
  const { role, summary, widgets } = dashboard;
  const isMentor = role === 'MENTOR';

  const pendingTitle = isMentor ? 'Требуют вашего решения' : 'Ожидают ответа';
  const activeTitle = isMentor ? 'Активные менти' : 'Активные связи';
  const completedTitle = isMentor ? 'Завершённые менторства' : 'Завершённые курсы';

  return (
    <div className="space-y-8">
      {/* 1. Заявки на рассмотрении / Ожидают ответа */}
      <section>
        <SectionTitle
          title={pendingTitle}
          count={summary.pendingRequestsCount}
          linkTo={isMentor ? '/requests/incoming' : '/requests/outgoing'}
          linkLabel={isMentor ? 'Все входящие заявки' : 'Мои заявки'}
        />
        {widgets.pendingRequests.length === 0 ? (
          <EmptyState
            icon="✉️"
            title={isMentor ? 'Нет новых заявок' : 'Нет заявок на рассмотрении'}
            description={isMentor ? 'Когда менти будут отправлять заявки, они появятся здесь.' : 'Отправьте заявку ментору из каталога.'}
            action={
              isMentor ? (
                <Link to="/requests/incoming"><Button variant="secondary">Входящие заявки</Button></Link>
              ) : (
                <Link to="/mentors"><Button>Каталог менторов</Button></Link>
              )
            }
          />
        ) : (
          <ul className="space-y-3">
            {widgets.pendingRequests.map((req) => (
              <li key={req.id}>
                <DashboardRequestCard
                  request={req}
                  isMentor={isMentor}
                  onAccept={onAccept}
                  onReject={onReject}
                  acceptLoading={acceptLoading && acceptVariable === req.id}
                  rejectLoading={rejectLoading && rejectVariable === req.id}
                  error={errorByRequestId[req.id]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. Активные связи */}
      <section>
        <SectionTitle
          title={activeTitle}
          count={summary.activeConnectionsCount}
          linkTo="/connections"
          linkLabel="К связям"
        />
        {widgets.activeConnections.length === 0 ? (
          <EmptyState
            icon="👥"
            title={isMentor ? 'Нет активных менти' : 'Нет активных связей'}
            description={isMentor ? 'Активные менти появятся после принятия заявок.' : 'Отправьте заявку ментору — после принятия связь появится здесь.'}
            action={!isMentor ? <Link to="/mentors"><Button>Найти ментора</Button></Link> : undefined}
          />
        ) : (
          <ul className="space-y-3">
            {widgets.activeConnections.map((conn) => (
              <li key={conn.id}>
                <DashboardConnectionCard
                  connection={conn}
                  onComplete={onComplete}
                  onDetach={onDetach}
                  completeLoading={completeLoading && completeVariable === conn.id}
                  detachLoading={detachLoading}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Завершённые */}
      <section>
        <SectionTitle
          title={completedTitle}
          count={summary.completedMentorshipsCount}
          linkTo="/connections"
          linkLabel="К связям"
        />
        {widgets.completedMentorships.length === 0 ? (
          <EmptyState
            icon="✓"
            title={isMentor ? 'Пока нет завершённых менторств' : 'Пока нет завершённых курсов'}
            description={isMentor ? 'Завершённые менторства появятся после отметки «Курс завершён» в активных связях.' : 'Завершённые курсы появятся после отметки завершения в активных связях.'}
          />
        ) : (
          <ul className="space-y-3">
            {widgets.completedMentorships.map((conn) => (
              <li key={conn.id}>
                <DashboardCompletedCard connection={conn} onDetach={onDetach} detachLoading={detachLoading} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DashboardRequestCard({
  request,
  isMentor,
  onAccept,
  onReject,
  acceptLoading,
  rejectLoading,
  error,
}: {
  request: DashboardPendingRequest;
  isMentor: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  acceptLoading: boolean;
  rejectLoading: boolean;
  error?: string;
}) {
  const party = request.mentee ?? request.mentor;
  const firstName = party?.firstName ?? '';
  const lastName = party?.lastName ?? '';
  const name = party ? `${firstName} ${lastName}` : '—';
  return (
    <Card leftBorder="var(--color-warning)">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <InitialsAvatar firstName={firstName} lastName={lastName} size="md" />
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}>{name}</p>
            {request.mentee?.goal && (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Цель: {request.mentee.goal}</p>
            )}
            {request.mentor?.specialty && (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{request.mentor.specialty}</p>
            )}
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {request.messagePreview}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatDate(request.createdAt)}</p>
          </div>
        </div>
        <div className="flex min-h-[44px] flex-wrap items-center gap-2 sm:shrink-0">
          {isMentor && (
            <>
              <Button size="sm" onClick={() => onAccept(request.id)} disabled={acceptLoading || rejectLoading} loading={acceptLoading}>
                Принять
              </Button>
              <Button variant="danger" size="sm" onClick={() => onReject(request.id)} disabled={acceptLoading || rejectLoading} loading={rejectLoading}>
                Отклонить
              </Button>
            </>
          )}
          {!isMentor && (
            <Link to="/requests/outgoing">
              <Button variant="secondary" size="sm">Подробнее</Button>
            </Link>
          )}
        </div>
      </div>
      {error && <p className="mt-2 text-sm" style={{ color: 'var(--color-error)' }} role="alert">{error}</p>}
    </Card>
  );
}

function DashboardConnectionCard({
  connection,
  onComplete,
  onDetach,
  completeLoading,
  detachLoading,
}: {
  connection: DashboardConnectionItem;
  onComplete: (id: string) => void;
  onDetach: (id: string, otherName?: string) => void;
  completeLoading: boolean;
  detachLoading: boolean;
}) {
  const { firstName, lastName } = connection.otherParty;
  const name = `${firstName} ${lastName}`;
  return (
    <Card leftBorder="var(--color-accent-secondary)">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <InitialsAvatar firstName={firstName} lastName={lastName} size="md" />
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}>{name}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>С {formatDate(connection.createdAt)}</p>
          </div>
        </div>
        <div className="flex min-h-[44px] flex-wrap gap-2 sm:shrink-0">
          <Button size="sm" onClick={() => onComplete(connection.id)} disabled={completeLoading || detachLoading} loading={completeLoading}>
            Завершить менторство
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onDetach(connection.id, name)} disabled={completeLoading || detachLoading}>
            Отвязаться
          </Button>
        </div>
      </div>
    </Card>
  );
}

function DashboardCompletedCard({
  connection,
  onDetach,
  detachLoading,
}: {
  connection: DashboardCompletedItem;
  onDetach: (id: string, otherName?: string) => void;
  detachLoading: boolean;
}) {
  const { firstName, lastName } = connection.otherParty;
  const name = `${firstName} ${lastName}`;
  const canDetach = connection.status === 'ACTIVE';
  return (
    <Card leftBorder="var(--color-success)">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <InitialsAvatar firstName={firstName} lastName={lastName} size="md" />
          <div>
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}>{name}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Завершено {formatDate(connection.completedAt)}
              {connection.detachedAt && ` · Отвязка ${formatDate(connection.detachedAt)}`}
            </p>
          </div>
        </div>
        {canDetach && (
          <div className="flex min-h-[44px] items-center sm:shrink-0">
            <Button variant="secondary" size="sm" onClick={() => onDetach(connection.id, name)} disabled={detachLoading}>
              Отвязаться
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
