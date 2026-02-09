import { useEffect, useRef } from 'react';

const WIDGET_SCRIPT_URL = 'https://telegram.org/js/telegram-widget.js?22';

function getTelegramAuthUrl(): string {
  const base = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;
  return `${base.replace(/\/$/, '')}/auth/telegram/callback`;
}

interface TelegramLoginButtonProps {
  botUsername: string;
}

/**
 * Кнопка «Войти через Telegram» — подключает виджет Telegram Login Widget.
 * Для работы: создать бота через @BotFather, выполнить /setdomain для домена сайта.
 */
export function TelegramLoginButton({ botUsername }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!botUsername || !containerRef.current) return;
    const authUrl = getTelegramAuthUrl();
    containerRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = WIDGET_SCRIPT_URL;
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-auth-url', authUrl);
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    containerRef.current.appendChild(script);
  }, [botUsername]);

  return <div ref={containerRef} className="flex justify-center [&>iframe]:!h-10" />;
}
