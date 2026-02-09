import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useUpdateMenteeProfile } from '../hooks/useProfile';
import { Button } from '../../../shared/ui/Button';
import { Textarea } from '../../../shared/ui/Textarea';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { validateTextField } from '../../../shared/lib/validation';
import type { Mentee, SearchStatus } from '../../../shared/types/profile';

export interface MenteeFormHandle {
  validate: () => boolean;
  submit: () => Promise<void>;
}

interface MenteeFormProps {
  mentee: Mentee;
  onSuccess?: () => void;
  hideSubmitButton?: boolean;
}

const MenteeFormInner = forwardRef<MenteeFormHandle, MenteeFormProps>(
  function MenteeFormInner({ mentee, onSuccess, hideSubmitButton = false }, ref) {
  const [goal, setGoal] = useState(mentee.goal);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>(mentee.searchStatus);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const stateRef = useRef({ goal, searchStatus });

  useEffect(() => {
    stateRef.current = { goal, searchStatus };
  }, [goal, searchStatus]);

  useEffect(() => {
    setGoal(mentee.goal);
    setSearchStatus(mentee.searchStatus);
  }, [mentee.id, mentee.updatedAt, mentee.goal, mentee.searchStatus]);

  const updateMentee = useUpdateMenteeProfile();
  const errorMessage = updateMentee.error ? getErrorMessage(updateMentee.error) : null;

  const isDirty =
    goal !== mentee.goal || searchStatus !== mentee.searchStatus;

  const runValidation = (): boolean => {
    const errors: Record<string, string> = {};
    const e1 = validateTextField(goal, true);
    if (e1) errors.goal = e1;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      stateRef.current = { goal, searchStatus };
      return runValidation();
    },
    submit: () =>
      updateMentee.mutateAsync({ goal: stateRef.current.goal, searchStatus: stateRef.current.searchStatus }).then(() => {
        setFieldErrors({});
        if (!hideSubmitButton) {
          setSuccessMessage('Изменения сохранены');
          onSuccess?.();
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      }),
  }), [goal, searchStatus, updateMentee.mutateAsync, onSuccess, hideSubmitButton]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!runValidation()) return;
    updateMentee.mutate(
      { goal, searchStatus },
      {
        onSuccess: () => {
          setSuccessMessage('Изменения сохранены');
          setFieldErrors({});
          onSuccess?.();
          setTimeout(() => setSuccessMessage(''), 3000);
        },
      }
    );
  };

  const content = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Профиль менти</h2>
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {successMessage && (
        <p className="text-sm text-green-600 dark:text-green-400" role="status">
          {successMessage}
        </p>
      )}
      <Textarea
        label="Цель или причина поиска ментора"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        rows={4}
        required
        maxLength={2000}
        placeholder="Помощь на проекте, переход на новую должность, изучение новых технологий и т.д"
        error={fieldErrors.goal}
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Статус поиска <span className="text-red-500">*</span>
        </label>
        <select
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value as SearchStatus)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="SEARCHING">Ищу ментора</option>
          <option value="NOT_SEARCHING">Не ищу</option>
        </select>
      </div>
      {!hideSubmitButton && (
        <Button type="submit" loading={updateMentee.isPending} disabled={!isDirty}>
          Сохранить профиль менти
        </Button>
      )}
    </>
  );

  if (hideSubmitButton) {
    return <div className="space-y-4">{content}</div>;
  }
  return <form onSubmit={handleSubmit} className="space-y-4">{content}</form>;
});

MenteeFormInner.displayName = 'MenteeForm';

export const MenteeForm = MenteeFormInner;
