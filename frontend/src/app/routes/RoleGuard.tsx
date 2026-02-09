import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMyProfile } from '../../features/profile/hooks/useProfile';

type Role = 'mentee' | 'mentor';

interface RoleGuardProps {
  children: ReactNode;
  role: Role;
}

/**
 * Редирект на /profile, если у пользователя нет требуемой роли (менти или ментор).
 */
export function RoleGuard({ children, role }: RoleGuardProps) {
  const { data: profile, isLoading } = useMyProfile();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
      </div>
    );
  }

  const hasMentee = !!profile?.mentee;
  const hasMentor = !!profile?.mentor;

  if (role === 'mentee' && !hasMentee) {
    return <Navigate to="/profile" replace />;
  }
  if (role === 'mentor' && !hasMentor) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
