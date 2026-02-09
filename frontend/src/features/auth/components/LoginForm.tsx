import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLogin, useAuthError } from '../hooks/useAuth';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { TelegramLoginButton } from './TelegramLoginButton';
import { EMAIL_HINT } from '../constants';

const TELEGRAM_ERROR_MESSAGES: Record<string, string> = {
  telegram_auth_failed: 'Недействительная авторизация Telegram. Попробуйте ещё раз.',
  telegram_not_configured: 'Вход через Telegram временно недоступен.',
  telegram_login_failed: 'Не удалось войти. Попробуйте позже.',
};

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const login = useLogin();
  const errorMessage = useAuthError(login);
  const telegramError = searchParams.get('error');
  const displayError = errorMessage || (telegramError && TELEGRAM_ERROR_MESSAGES[telegramError]);

  const telegramBotUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && <ErrorMessage message={displayError} />}
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="user@example.com"
        hint={EMAIL_HINT}
      />
      <Input
        label="Пароль"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" loading={login.isPending}>
        Войти
      </Button>
      {telegramBotUsername && (
        <div className="space-y-2">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">или</p>
          <TelegramLoginButton botUsername={telegramBotUsername} />
        </div>
      )}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
