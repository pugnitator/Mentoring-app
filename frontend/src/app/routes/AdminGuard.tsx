import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMyProfile } from '../../features/profile/hooks/useProfile';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
      </div>
    );
  }

  if (profile?.user?.role !== 'ADMIN') {
    return <Navigate to="/" replace state={{ message: 'Доступ запрещён' }} />;
  }

  return <>{children}</>;
}
