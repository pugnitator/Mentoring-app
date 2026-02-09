import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useUpdateProfile } from '../hooks/useProfile';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { SearchableSelect } from '../../../shared/ui/SearchableSelect';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { validateTextField, validateOptionalTextField } from '../../../shared/lib/validation';
import type { Profile, ProfileLevel } from '../../../shared/types/profile';
import type { UpdateProfileData } from '../../../shared/types/profile';
import { useSpecialties } from '../hooks/useSpecialties';
import { CITIES } from '../constants/cities';

const LEVEL_OPTIONS: { value: ProfileLevel; label: string }[] = [
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MIDDLE', label: 'Middle' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
];

export interface ProfileFormHandle {
  validate: () => boolean;
  submit: () => Promise<void>;
}

interface ProfileFormProps {
  profile: Profile;
  onSuccess?: () => void;
  /** В режиме единой кнопки сохранения — без своей кнопки и без тега form */
  hideSubmitButton?: boolean;
}

const ProfileFormInner = forwardRef<ProfileFormHandle, ProfileFormProps>(
  function ProfileFormInner({ profile, onSuccess, hideSubmitButton = false }, ref) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [middleName, setMiddleName] = useState(profile.middleName ?? '');
  const [specialty, setSpecialty] = useState(profile.specialty);
  const [level, setLevel] = useState<ProfileLevel | ''>(profile.level ?? '');
  const [bio, setBio] = useState(profile.bio ?? '');
  const [city, setCity] = useState(profile.city ?? '');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const stateRef = useRef({ firstName, lastName, middleName, specialty, level, bio, city });

  useEffect(() => {
    stateRef.current = { firstName, lastName, middleName, specialty, level, bio, city };
  }, [firstName, lastName, middleName, specialty, level, bio, city]);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setMiddleName(profile.middleName ?? '');
    setSpecialty(profile.specialty);
    setLevel(profile.level ?? '');
    setBio(profile.bio ?? '');
    setCity(profile.city ?? '');
  }, [
    profile.id,
    profile.updatedAt,
    profile.firstName,
    profile.lastName,
    profile.middleName,
    profile.specialty,
    profile.level,
    profile.bio,
    profile.city,
  ]);

  const updateProfile = useUpdateProfile();
  const { options: specialtyOptions } = useSpecialties();
  const errorMessage = updateProfile.error ? getErrorMessage(updateProfile.error) : null;

  const isDirty =
    firstName !== profile.firstName ||
    lastName !== profile.lastName ||
    (middleName || '') !== (profile.middleName ?? '') ||
    specialty !== profile.specialty ||
    (level || '') !== (profile.level ?? '') ||
    (bio || '') !== (profile.bio ?? '') ||
    (city || '') !== (profile.city ?? '');

  const runValidation = (): boolean => {
    const errors: Record<string, string> = {};
    const e1 = validateTextField(firstName, true);
    if (e1) errors.firstName = e1;
    const e2 = validateTextField(lastName, true);
    if (e2) errors.lastName = e2;
    const e3 = validateOptionalTextField(middleName);
    if (e3) errors.middleName = e3;
    if (!specialty.trim()) errors.specialty = 'Обязательное поле';
    const e5 = validateOptionalTextField(bio);
    if (e5) errors.bio = e5;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPayload = (): UpdateProfileData => ({
    firstName: stateRef.current.firstName,
    lastName: stateRef.current.lastName,
    middleName: stateRef.current.middleName || undefined,
    specialty: stateRef.current.specialty,
    level: (stateRef.current.level || undefined) as ProfileLevel | undefined,
    bio: stateRef.current.bio || undefined,
    city: stateRef.current.city || undefined,
  });

  useImperativeHandle(ref, () => ({
    validate: () => {
      stateRef.current = { firstName, lastName, middleName, specialty, level, bio, city };
      return runValidation();
    },
    submit: () =>
      updateProfile.mutateAsync(getPayload()).then(() => {
        setFieldErrors({});
        if (!hideSubmitButton) {
          setSuccessMessage('Изменения сохранены');
          onSuccess?.();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      }),
  }), [firstName, lastName, middleName, specialty, level, bio, city, updateProfile.mutateAsync, onSuccess, hideSubmitButton]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!runValidation()) return;
    updateProfile.mutate(getPayload(), {
      onSuccess: () => {
        setSuccessMessage('Изменения сохранены');
        setFieldErrors({});
        onSuccess?.();
        setTimeout(() => setSuccessMessage(''), 3000);
      },
    });
  };

  const content = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Общие данные</h2>
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {successMessage && (
        <p className="text-sm text-green-600 dark:text-green-400" role="status">
          {successMessage}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          maxLength={100}
          error={fieldErrors.firstName}
        />
        <Input
          label="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          maxLength={100}
          error={fieldErrors.lastName}
        />
      </div>
      <Input
        label="Отчество"
        value={middleName}
        onChange={(e) => setMiddleName(e.target.value)}
        maxLength={100}
        error={fieldErrors.middleName}
      />
      <SearchableSelect
        label="Текущая специальность"
        value={specialty}
        onChange={setSpecialty}
        options={specialtyOptions}
        required
        error={fieldErrors.specialty}
        placeholder="Выберите специальность"
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Уровень
        </label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as ProfileLevel | '')}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">Не указан</option>
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Краткая информация о себе
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={2000}
          className={`
            w-full rounded-lg border px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            ${fieldErrors.bio ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {fieldErrors.bio && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.bio}</p>
        )}
      </div>
      <SearchableSelect
        label="Город"
        value={city}
        onChange={setCity}
        options={CITIES}
        placeholder="Выберите город"
      />
      {!hideSubmitButton && (
        <Button type="submit" loading={updateProfile.isPending} disabled={!isDirty}>
          Сохранить общие данные
        </Button>
      )}
    </>
  );

  if (hideSubmitButton) {
    return <div className="space-y-4">{content}</div>;
  }
  return <form onSubmit={handleSubmit} className="space-y-4">{content}</form>;
});

ProfileFormInner.displayName = 'ProfileForm';

export const ProfileForm = ProfileFormInner;
