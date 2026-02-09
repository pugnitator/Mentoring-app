import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useUpdateMentorProfile } from '../hooks/useProfile';
import { useTags } from '../../mentors/hooks/useMentorsCatalog';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { Textarea } from '../../../shared/ui/Textarea';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { validateTextField } from '../../../shared/lib/validation';
import type { Mentor } from '../../../shared/types/profile';

export interface MentorFormHandle {
  validate: () => boolean;
  submit: () => Promise<void>;
}

interface MentorFormProps {
  mentor: Mentor;
  onSuccess?: () => void;
  hideSubmitButton?: boolean;
}

const MentorFormInner = forwardRef<MentorFormHandle, MentorFormProps>(
  function MentorFormInner({ mentor, onSuccess, hideSubmitButton = false }, ref) {
    const [description, setDescription] = useState(mentor.description);
    const [workFormat, setWorkFormat] = useState(mentor.workFormat);
    const [acceptsRequests, setAcceptsRequests] = useState(mentor.acceptsRequests);
    const [statusComment, setStatusComment] = useState(mentor.statusComment ?? '');
    const [maxMentees, setMaxMentees] = useState(String(mentor.maxMentees));
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
      mentor.tags?.map((t) => t.id) ?? []
    );
    const [successMessage, setSuccessMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const stateRef = useRef({
      description,
      workFormat,
      acceptsRequests,
      statusComment,
      maxMentees,
      selectedTagIds,
    });

    const { data: tagsData } = useTags();
    const tags = tagsData ?? [];

    useEffect(() => {
      stateRef.current = {
        description,
        workFormat,
        acceptsRequests,
        statusComment,
        maxMentees,
        selectedTagIds,
      };
    }, [description, workFormat, acceptsRequests, statusComment, maxMentees, selectedTagIds]);

    useEffect(() => {
      setDescription(mentor.description);
      setWorkFormat(mentor.workFormat);
      setAcceptsRequests(mentor.acceptsRequests);
      setStatusComment(mentor.statusComment ?? '');
      setMaxMentees(String(mentor.maxMentees));
      setSelectedTagIds(mentor.tags?.map((t) => t.id) ?? []);
    }, [
      mentor.id,
      mentor.updatedAt,
      mentor.description,
      mentor.workFormat,
      mentor.acceptsRequests,
      mentor.statusComment,
      mentor.maxMentees,
      mentor.tags,
    ]);

    const updateMentor = useUpdateMentorProfile();
    const errorMessage = updateMentor.error ? getErrorMessage(updateMentor.error) : null;

    const mentorTagIds = (mentor.tags ?? []).map((t) => t.id).sort().join(',');
    const currentTagIds = [...selectedTagIds].sort().join(',');
    const isDirty =
      description !== mentor.description ||
      workFormat !== mentor.workFormat ||
      acceptsRequests !== mentor.acceptsRequests ||
      (acceptsRequests ? '' : statusComment) !== (mentor.statusComment ?? '') ||
      String(mentor.maxMentees) !== maxMentees ||
      currentTagIds !== mentorTagIds;

    const runValidation = (): boolean => {
      const errors: Record<string, string> = {};
      if (selectedTagIds.length === 0) {
        errors.tags = 'Укажите хотя бы один тег';
      }
      const e2 = validateTextField(description, true);
      if (e2) errors.description = e2;
      const e3 = validateTextField(workFormat, true);
      if (e3) errors.workFormat = e3;
      if (!acceptsRequests) {
        const e4 = validateTextField(statusComment, true);
        if (e4) errors.statusComment = e4;
      }
      const num = parseInt(maxMentees, 10);
      if (Number.isNaN(num) || num < 0) {
        errors.maxMentees = 'Укажите число не менее 0';
      }
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const getPayload = () => {
      const s = stateRef.current;
      return {
        description: s.description,
        workFormat: s.workFormat,
        acceptsRequests: s.acceptsRequests,
        statusComment: s.acceptsRequests ? undefined : s.statusComment,
        maxMentees: parseInt(s.maxMentees, 10) || 0,
        tagIds: s.selectedTagIds,
      };
    };

    const toggleTag = (tagId: string) => {
      setSelectedTagIds((prev) =>
        prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
      );
    };

    useImperativeHandle(
      ref,
      () => ({
        validate: () => {
          stateRef.current = {
            description,
            workFormat,
            acceptsRequests,
            statusComment,
            maxMentees,
            selectedTagIds,
          };
          return runValidation();
        },
        submit: () =>
          updateMentor.mutateAsync(getPayload()).then(() => {
            setFieldErrors({});
            if (!hideSubmitButton) {
              setSuccessMessage('Изменения сохранены');
              onSuccess?.();
              setTimeout(() => setSuccessMessage(''), 3000);
            }
          }),
      }),
      [
        description,
        workFormat,
        acceptsRequests,
        statusComment,
        maxMentees,
        selectedTagIds,
        updateMentor.mutateAsync,
        onSuccess,
        hideSubmitButton,
      ]
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!runValidation()) return;
      updateMentor.mutate(getPayload(), {
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Профиль ментора
        </h2>
        {errorMessage && <ErrorMessage message={errorMessage} />}
        {successMessage && (
          <p className="text-sm text-green-600 dark:text-green-400" role="status">
            {successMessage}
          </p>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Теги (темы специализации) <span className="text-red-500">*</span>
          </label>
          <div
            className={`max-h-40 overflow-y-auto rounded-lg border p-2 dark:border-gray-600 dark:bg-gray-800 ${
              fieldErrors.tags ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {tags.length === 0 ? (
              <p className="text-sm text-gray-500">Загрузка тегов...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-1.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{tag.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {fieldErrors.tags && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{fieldErrors.tags}</p>
          )}
        </div>
        <Textarea
          label="Описание услуг"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          maxLength={3000}
          error={fieldErrors.description}
        />
        <Input
          label="Формат работы"
          value={workFormat}
          onChange={(e) => setWorkFormat(e.target.value)}
          placeholder="Например: онлайн, очно, гибрид"
          required
          maxLength={200}
          error={fieldErrors.workFormat}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="acceptsRequests"
            checked={acceptsRequests}
            onChange={(e) => setAcceptsRequests(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="acceptsRequests" className="text-sm text-gray-700 dark:text-gray-300">
            Принимаю заявки на менторство
          </label>
        </div>
        {!acceptsRequests && (
          <Input
            label="Комментарий к статусу (обязательно, если заявки не принимаются)"
            value={statusComment}
            onChange={(e) => setStatusComment(e.target.value)}
            required
            maxLength={500}
            error={fieldErrors.statusComment}
          />
        )}
        <Input
          label="Максимальное количество активных менти"
          type="number"
          min={0}
          max={100}
          value={maxMentees}
          onChange={(e) => setMaxMentees(e.target.value)}
          required
          error={fieldErrors.maxMentees}
        />
        {!hideSubmitButton && (
          <Button type="submit" loading={updateMentor.isPending} disabled={!isDirty}>
            Сохранить профиль ментора
          </Button>
        )}
      </>
    );

    if (hideSubmitButton) {
      return <div className="space-y-4">{content}</div>;
    }
    return <form onSubmit={handleSubmit} className="space-y-4">{content}</form>;
  }
);

MentorFormInner.displayName = 'MentorForm';

export const MentorForm = MentorFormInner;
