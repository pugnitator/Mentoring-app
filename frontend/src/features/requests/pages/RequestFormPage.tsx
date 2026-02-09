import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMentorById } from '../../mentors/hooks/useMentorsCatalog';
import { useCreateRequest } from '../hooks/useRequests';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { useToast } from '../../../shared/context/ToastContext';
import { Button } from '../../../shared/ui/Button';
import { Textarea } from '../../../shared/ui/Textarea';

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

export function RequestFormPage() {
  const { id: mentorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { data: mentor, isLoading, isError } = useMentorById(mentorId);
  const createRequest = useCreateRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!mentorId || !message.trim()) return;
    if (message.trim().length < MESSAGE_MIN) {
      setSubmitError(`Сопроводительное письмо должно быть не менее ${MESSAGE_MIN} символов`);
      return;
    }
    if (message.length > MESSAGE_MAX) {
      setSubmitError(`Сопроводительное письмо не должно превышать ${MESSAGE_MAX} символов`);
      return;
    }
    createRequest.mutate(
      { mentorId, message: message.trim() },
      {
        onSuccess: () => {
          toast.showToast('Заявка отправлена', 'success');
          navigate('/requests/outgoing');
        },
        onError: (err) => setSubmitError(getErrorMessage(err)),
      },
    );
  };

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
        <p className="text-gray-600 dark:text-gray-400">Ментор не найден</p>
        <Link to="/mentors" className="text-indigo-600 dark:text-indigo-400 hover:underline">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const cannotSubmit = !mentor.acceptsRequests;

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <h1 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Заявка на менторство
      </h1>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Ментор: {mentor.profile.firstName} {mentor.profile.lastName}
        {mentor.profile.specialty && ` · ${mentor.profile.specialty}`}
      </p>

      {cannotSubmit && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          Ментор сейчас не принимает заявки.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="request-message" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Сопроводительное письмо <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="request-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Расскажите о себе и своей цели..."
            minLength={MESSAGE_MIN}
            maxLength={MESSAGE_MAX}
            rows={6}
            required
            disabled={cannotSubmit}
            className="w-full"
            aria-describedby={submitError ? 'request-error' : 'request-hint'}
          />
          <p id="request-hint" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            От {MESSAGE_MIN} до {MESSAGE_MAX} символов
          </p>
        </div>

        {submitError && (
          <p id="request-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={cannotSubmit || createRequest.isPending}>
            {createRequest.isPending ? 'Отправка…' : 'Отправить заявку'}
          </Button>
          <Link to={`/mentors/${mentorId}`}>
            <Button type="button" variant="secondary">
              Отмена
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
