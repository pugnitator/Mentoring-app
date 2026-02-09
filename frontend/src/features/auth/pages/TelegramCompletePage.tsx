import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setTokens } from '../../../shared/api/auth';

/**
 * Страница, на которую бэкенд редиректит после успешного входа через Telegram.
 * Читает accessToken и refreshToken из hash (#accessToken=...&refreshToken=...),
 * сохраняет в localStorage и перенаправляет на главную.
 */
export function TelegramCompletePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true, state: { message: 'Не удалось завершить вход через Telegram' } });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <p className="text-gray-600 dark:text-gray-400">Вход выполнен. Перенаправление…</p>
    </div>
  );
}
