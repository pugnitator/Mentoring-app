import { useState, useRef } from 'react';
import { useMyProfile } from '../hooks/useProfile';
import { ProfileForm, type ProfileFormHandle } from '../components/ProfileForm';
import { MentorForm, type MentorFormHandle } from '../components/MentorForm';
import { MenteeForm, type MenteeFormHandle } from '../components/MenteeForm';
import { Avatar } from '../components/Avatar';
import { AvatarUpload } from '../components/AvatarUpload';
import { NotificationSettings } from '../components/NotificationSettings';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import type { Profile, ProfileLevel } from '../../../shared/types/profile';

const LEVEL_LABELS: Record<ProfileLevel, string> = {
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead',
};

function ProfileView({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Общие данные
      </h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Имя
          </dt>
          <dd style={{ color: 'var(--color-text-primary)' }}>{profile.firstName}</dd>
        </div>
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Фамилия
          </dt>
          <dd style={{ color: 'var(--color-text-primary)' }}>{profile.lastName}</dd>
        </div>
        {profile.middleName && (
          <div className="sm:col-span-2">
            <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Отчество
            </dt>
            <dd style={{ color: 'var(--color-text-primary)' }}>{profile.middleName}</dd>
          </div>
        )}
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Текущая специальность
          </dt>
          <dd style={{ color: 'var(--color-text-primary)' }}>{profile.specialty || '—'}</dd>
        </div>
        {profile.level && (
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Уровень</dt>
            <dd className="text-gray-900 dark:text-gray-100">{LEVEL_LABELS[profile.level]}</dd>
          </div>
        )}
        {profile.bio && (
          <div className="sm:col-span-2">
            <dt className="text-sm text-gray-500 dark:text-gray-400">Краткая информация о себе</dt>
            <dd className="whitespace-pre-wrap text-gray-900 dark:text-gray-100">{profile.bio}</dd>
          </div>
        )}
        {profile.city && (
          <div>
            <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Город
            </dt>
            <dd style={{ color: 'var(--color-text-primary)' }}>{profile.city}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function MentorView({ mentor }: { mentor: NonNullable<Profile['mentor']> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Профиль ментора
      </h2>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Теги (темы специализации)
          </dt>
          <dd style={{ color: 'var(--color-text-primary)' }}>
            {mentor.tags?.length
              ? mentor.tags.map((t) => t.name).join(', ')
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Описание услуг
          </dt>
          <dd className="whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>
            {mentor.description}
          </dd>
        </div>
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Формат работы
          </dt>
          <dd style={{ color: 'var(--color-text-primary)' }}>{mentor.workFormat}</dd>
        </div>
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Принимает заявки
          </dt>
          <dd style={{ color: 'var(--color-text-primary)' }}>
            {mentor.acceptsRequests ? 'Да' : 'Нет'}
            {!mentor.acceptsRequests && mentor.statusComment && (
              <span
                className="block mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {mentor.statusComment}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Макс. активных менти
          </dt>
          <dd style={{ color: 'var(--color-text-primary)' }}>{mentor.maxMentees}</dd>
        </div>
      </dl>
    </div>
  );
}

function MenteeView({ mentee }: { mentee: NonNullable<Profile['mentee']> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Профиль менти
      </h2>
      <dl className="space-y-3">
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Цель или причина поиска ментора
          </dt>
          <dd className="whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>
            {mentee.goal}
          </dd>
        </div>
        <div>
          <dt className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Статус поиска
          </dt>
          <dd style={{ color: 'var(--color-text-primary)' }}>
            {mentee.searchStatus === 'SEARCHING' ? 'Ищу ментора' : 'Не ищу'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const profileFormRef = useRef<ProfileFormHandle>(null);
  const mentorFormRef = useRef<MentorFormHandle>(null);
  const menteeFormRef = useRef<MenteeFormHandle>(null);

  if (isLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>Загрузка профиля...</p>
      </div>
    );
  }

  const isMentor = !!profile.mentor;
  const isMentee = !!profile.mentee;

  const handleSaveAll = async (e: React.FormEvent) => {
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
      setSuccessMessage('Изменения сохранены');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditing(false);
    } catch {
      // Ошибки показываются в формах
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Личный кабинет
          </h1>
          {!isEditing && (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Редактировать
            </Button>
          )}
        </div>

        {successMessage && (
          <p className="mb-4 text-sm" style={{ color: 'var(--color-success)' }} role="status">
            {successMessage}
          </p>
        )}

        {isEditing ? (
          <form onSubmit={handleSaveAll}>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border border-[var(--color-border)]">
                <div className="mb-6 flex justify-center">
                  <AvatarUpload profile={profile} />
                </div>
                <ProfileForm
                  ref={profileFormRef}
                  profile={profile}
                  hideSubmitButton
                />
              </Card>

              {isMentor && profile.mentor && (
                <Card className="border border-[var(--color-border)]">
                  <MentorForm
                    ref={mentorFormRef}
                    mentor={profile.mentor}
                    hideSubmitButton
                  />
                </Card>
              )}

              {isMentee && profile.mentee && (
                <Card className="border border-[var(--color-border)]">
                  <MenteeForm
                    ref={menteeFormRef}
                    mentee={profile.mentee}
                    hideSubmitButton
                  />
                </Card>
              )}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <NotificationSettings />
              </div>
            </div>
            <div className="mt-6">
              <Button type="submit" loading={isSaving}>
                Сохранить профиль
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-[var(--color-border)]">
              <div className="mb-6 flex justify-center">
                <Avatar
                  avatarUrl={profile.avatarUrl}
                  firstName={profile.firstName}
                  lastName={profile.lastName}
                  size="lg"
                />
              </div>
              <ProfileView profile={profile} />
            </Card>

            {isMentor && profile.mentor && (
              <Card className="border border-[var(--color-border)]">
                <MentorView mentor={profile.mentor} />
              </Card>
            )}

            {isMentee && profile.mentee && (
              <Card className="border border-[var(--color-border)]">
                <MenteeView mentee={profile.mentee} />
              </Card>
            )}

            <section className="lg:col-span-2">
              <NotificationSettings />
            </section>
          </div>
        )}
    </div>
  );
}
