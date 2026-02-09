import { useRef, useState } from 'react';
import { Avatar } from './Avatar';
import { Button } from '../../../shared/ui/Button';
import { useUploadAvatar } from '../hooks/useProfile';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import type { Profile } from '../../../shared/types/profile';

const MAX_SIZE_BYTES = 500 * 1024;
const SIZE_ERROR_MESSAGE = 'Файл слишком большой. Максимум 500 KB';
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp';

interface AvatarUploadProps {
  profile: Profile;
}

export function AvatarUpload({ profile }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const uploadAvatar = useUploadAvatar();
  const errorMessage = uploadAvatar.error ? getErrorMessage(uploadAvatar.error) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSizeError(null);
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      uploadAvatar.reset();
      setSizeError(SIZE_ERROR_MESSAGE);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl.startsWith('data:image/')) {
        uploadAvatar.mutate(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar
        avatarUrl={profile.avatarUrl}
        firstName={profile.firstName}
        lastName={profile.lastName}
        size="lg"
      />
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        loading={uploadAvatar.isPending}
      >
        Загрузить фото
      </Button>
      {(errorMessage || sizeError) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errorMessage ?? sizeError}
        </p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        JPEG, PNG, GIF или WebP, до 500 KB
      </p>
    </div>
  );
}
