import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRole, useMyProfile } from '../hooks/useProfile';
import { ProfileForm, type ProfileFormHandle } from '../components/ProfileForm';
import { MentorForm, type MentorFormHandle } from '../components/MentorForm';
import { MenteeForm, type MenteeFormHandle } from '../components/MenteeForm';
import { Button } from '../../../shared/ui/Button';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { Card } from '../../../shared/ui/Card';
import type { PlatformRole } from '../../../shared/types/profile';

export function OnboardingPage() {
  const { data: profile } = useMyProfile();
  const [selectedRole, setSelectedRole] = useState<PlatformRole | null>(null);
  const setRole = useSetRole();
  const navigate = useNavigate();
  const profileFormRef = useRef<ProfileFormHandle>(null);
  const mentorFormRef = useRef<MentorFormHandle>(null);
  const menteeFormRef = useRef<MenteeFormHandle>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = profile?.user?.role === 'ADMIN';
  const hasRole = isAdmin || (profile?.mentor ?? profile?.mentee);
  const isMentor = !!profile?.mentor;
  const isMentee = !!profile?.mentee;

  useEffect(() => {
    if (profile && isAdmin) {
      navigate('/', { replace: true });
    }
  }, [profile, isAdmin, navigate]);

  if (profile && isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>Перенаправление...</p>
      </div>
    );
  }

  if (profile && hasRole && !isAdmin) {
    const handleSaveOnboarding = async (e: React.FormEvent) => {
      e.preventDefault();
      const profileValid = profileFormRef.current?.validate() ?? true;
      const roleValid = isMentor
        ? (mentorFormRef.current?.validate() ?? true)
        : (menteeFormRef.current?.validate() ?? true);
      if (!profileValid || !roleValid) return;
      setIsSaving(true);
      try {
        await profileFormRef.current?.submit();
        if (isMentor) {
          await mentorFormRef.current?.submit();
        } else {
          await menteeFormRef.current?.submit();
        }
        navigate('/', { replace: true });
      } catch {
        // Errors shown in forms
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Дозаполнение профиля
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Заполните данные профиля. Роль уже выбрана при регистрации.
        </p>
        <form onSubmit={handleSaveOnboarding}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <ProfileForm ref={profileFormRef} profile={profile!} hideSubmitButton />
            </Card>
            {isMentor && profile.mentor && (
              <Card>
                <MentorForm ref={mentorFormRef} mentor={profile.mentor} hideSubmitButton />
              </Card>
            )}
            {isMentee && profile.mentee && (
              <Card>
                <MenteeForm ref={menteeFormRef} mentee={profile.mentee} hideSubmitButton />
              </Card>
            )}
          </div>
          <div className="mt-6">
            <Button type="submit" loading={isSaving}>
              Сохранить
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const handleSubmitRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setRole.mutate(
      { role: selectedRole },
      {
        onSuccess: () => {
          navigate('/profile', { replace: true });
        },
      },
    );
  };

  const errorMessage = setRole.error ? getErrorMessage(setRole.error) : null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Выберите роль
      </h1>
      <Card>
        <form onSubmit={handleSubmitRole} className="space-y-4">
          {errorMessage && <ErrorMessage message={errorMessage} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSelectedRole('MENTOR')}
              className={`
                flex flex-col items-center rounded-xl border-2 p-6 text-left transition
                ${selectedRole === 'MENTOR' ? 'border-[var(--color-accent-start)] bg-[var(--color-accent-start)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}
              `}
            >
              <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Ментор</span>
              <span className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Принимаю заявки на менторство
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('MENTEE')}
              className={`
                flex flex-col items-center rounded-xl border-2 p-6 text-left transition
                ${selectedRole === 'MENTEE' ? 'border-[var(--color-accent-start)] bg-[var(--color-accent-start)]/10' : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'}
              `}
            >
              <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Менти</span>
              <span className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Ищу ментора для себя
              </span>
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={!selectedRole} loading={setRole.isPending}>
            Продолжить
          </Button>
        </form>
      </Card>
    </div>
  );
}
