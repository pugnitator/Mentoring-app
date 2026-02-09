import { useState, type ReactNode } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useMyProfile } from '../../features/profile/hooks/useProfile';
import { isAuthenticated, clearTokens } from '../api/auth';
import { ThemeToggle } from '../components/ThemeToggle';

const navLinkBase =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-end)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-page)]';
const navLinkDefault =
  'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]';
const navLinkActive =
  'bg-gradient-to-r from-[var(--color-accent-start)] to-[var(--color-accent-end)] text-white hover:opacity-90';

function AppHeader() {
  const navigate = useNavigate();
  const auth = isAuthenticated();
  const { data: profile } = useMyProfile(auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = profile?.user?.role === 'ADMIN';
  const isMentee = !!profile?.mentee;
  const isMentor = !!profile?.mentor;

  const handleLogout = () => {
    clearTokens();
    setMobileOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileOpen(false);

  const guestLinks = (
    <>
      <NavLink to="/mentors" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>
        Менторы
      </NavLink>
      <Link to="/login" className={`${navLinkBase} ${navLinkDefault}`} onClick={closeMobile}>Войти</Link>
      <Link to="/register" className={`${navLinkBase} ${navLinkDefault}`} onClick={closeMobile}>Регистрация</Link>
    </>
  );

  const menteeLinks = (
    <>
      <NavLink to="/mentors" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Менторы</NavLink>
      <NavLink to="/favorites" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Избранное</NavLink>
      <NavLink to="/requests/outgoing" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Мои заявки</NavLink>
      <NavLink to="/connections" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Мои менторы</NavLink>
      <NavLink to="/profile" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Профиль</NavLink>
    </>
  );

  const mentorLinks = (
    <>
      <NavLink to="/mentors" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Менторы</NavLink>
      <NavLink to="/requests/incoming" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Заявки</NavLink>
      <NavLink to="/connections" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Мои менти</NavLink>
      <NavLink to="/profile" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Профиль</NavLink>
    </>
  );

  const adminLinks = (
    <>
      <NavLink to="/admin" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Админ-панель</NavLink>
    </>
  );

  const navContent = !auth
    ? guestLinks
    : isAdmin
      ? adminLinks
      : isMentee
        ? menteeLinks
        : isMentor
          ? mentorLinks
          : (
              <>
                <NavLink to="/mentors" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Менторы</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${navLinkBase} ${isActive ? navLinkActive : navLinkDefault}`} onClick={closeMobile}>Профиль</NavLink>
              </>
            );

  const logoTo = auth ? '/' : '/mentors';

  return (
    <header
      className="sticky top-0 z-40 border-b border-[var(--color-border)] shadow-[var(--shadow-card)]"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to={logoTo} className="shrink-0 font-semibold text-[var(--color-text-primary)] hover:opacity-90" onClick={closeMobile}>
          Платформа менторинга
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navContent}
          <span className="ml-1">
            <ThemeToggle />
          </span>
          {auth && (
            <button type="button" onClick={handleLogout} className={`${navLinkBase} ${navLinkDefault}`}>
              Выйти
            </button>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-lg p-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-end)]"
            aria-label="Открыть меню"
            aria-expanded={mobileOpen}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 top-14 z-30 bg-black/20 sm:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed right-0 top-14 z-40 w-64 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg transition-transform duration-200 sm:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-1">
          {navContent}
          {auth && (
            <button type="button" onClick={handleLogout} className={`${navLinkBase} ${navLinkDefault} text-left`}>
              Выйти
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export function MainLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
