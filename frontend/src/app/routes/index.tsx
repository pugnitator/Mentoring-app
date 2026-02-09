import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ProfileGuard } from './ProfileGuard';
import { AdminGuard } from './AdminGuard';
import { MainLayout } from '../../shared/layouts/MainLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { TelegramCompletePage } from '../../features/auth/pages/TelegramCompletePage';
import { OnboardingPage } from '../../features/profile/pages/OnboardingPage';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { MentorsCatalogPage } from '../../features/mentors/pages/MentorsCatalogPage';
import { MentorDetailPage } from '../../features/mentors/pages/MentorDetailPage';
import { FavoritesPage } from '../../features/favorites/pages/FavoritesPage';
import { RequestFormPage } from '../../features/requests/pages/RequestFormPage';
import { IncomingRequestsPage } from '../../features/requests/pages/IncomingRequestsPage';
import { OutgoingRequestsPage } from '../../features/requests/pages/OutgoingRequestsPage';
import { ConnectionsPage } from '../../features/connections/pages/ConnectionsPage';
import { RoleGuard } from './RoleGuard';
import { NotFoundPage } from '../pages/NotFoundPage';
import { AdminLayout } from '../../features/admin/layouts/AdminLayout';
import { AdminTagsPage } from '../../features/admin/pages/AdminTagsPage';
import { AdminSpecialtiesPage } from '../../features/admin/pages/AdminSpecialtiesPage';
import { AdminUsersPage } from '../../features/admin/pages/AdminUsersPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ProfileGuard>
              <HomePage />
            </ProfileGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute>
            <ProfileGuard>
              <OnboardingPage />
            </ProfileGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfileGuard>
              <ProfilePage />
            </ProfileGuard>
          </ProtectedRoute>
        ),
      },
      { path: 'mentors', element: <MentorsCatalogPage /> },
      { path: 'mentors/:id', element: <MentorDetailPage /> },
      {
        path: 'mentors/:id/request',
        element: (
          <ProtectedRoute>
            <ProfileGuard>
              <RoleGuard role="mentee">
                <RequestFormPage />
              </RoleGuard>
            </ProfileGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: 'requests/incoming',
        element: (
          <ProtectedRoute>
            <ProfileGuard>
              <RoleGuard role="mentor">
                <IncomingRequestsPage />
              </RoleGuard>
            </ProfileGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: 'requests/outgoing',
        element: (
          <ProtectedRoute>
            <ProfileGuard>
              <RoleGuard role="mentee">
                <OutgoingRequestsPage />
              </RoleGuard>
            </ProfileGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: 'connections',
        element: (
          <ProtectedRoute>
            <ProfileGuard>
              <ConnectionsPage />
            </ProfileGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: 'favorites',
        element: (
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        ),
      },
      { path: '404', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <ProfileGuard>
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        </ProfileGuard>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/tags" replace /> },
      { path: 'tags', element: <AdminTagsPage /> },
      { path: 'specialties', element: <AdminSpecialtiesPage /> },
      { path: 'users', element: <AdminUsersPage /> },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/telegram/complete',
    element: <TelegramCompletePage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
