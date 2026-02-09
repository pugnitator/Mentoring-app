import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMyProfile } from '../../features/profile/hooks/useProfile';

interface ProfileGuardProps {
  children: ReactNode;
}

/**
 * Для защищённых маршрутов: если профиля нет — редирект на /onboarding;
 * если профиль есть, но роль не выбрана, и мы на /profile — редирект на /onboarding.
 * Экран /onboarding при уже выбранной роли отображается самой страницей онбординга.
 */
export function ProfileGuard({ children }: ProfileGuardProps) {
  const location = useLocation();
  const { data: profile, isLoading } = useMyProfile();
  const path = location.pathname;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
      </div>
    );
  }

  const isAdmin = profile?.user?.role === 'ADMIN';
  const hasRole = isAdmin || (profile?.mentor ?? profile?.mentee);

  if (!profile && path !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (profile && !hasRole && path === '/profile') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
