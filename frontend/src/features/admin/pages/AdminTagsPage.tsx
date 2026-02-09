import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type TagItem } from '../api/adminApi';
import { getErrorMessage } from '../../../shared/lib/errorHandler';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Textarea } from '../../../shared/ui/Textarea';

const key = ['admin', 'tags'];

export function AdminTagsPage() {
  const queryClient = useQueryClient();
  const { data: tags, isLoading, isError } = useQuery({
    queryKey: key,
    queryFn: () => adminApi.getTags(),
  });
  const createTag = useMutation({
    mutationFn: (data: { name: string; description?: string }) => adminApi.createTag(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  const updateTag = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      adminApi.updateTag(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });
  const deleteTag = useMutation({
    mutationFn: (id: string) => adminApi.deleteTag(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const [modal, setModal] = useState<{ tag: TagItem | null } | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<TagItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreate = () => {
    setModal({ tag: null });
    setName('');
    setDescription('');
    setError(null);
  };

  const openEdit = (tag: TagItem) => {
    setModal({ tag });
    setName(tag.name);
    setDescription(tag.description ?? '');
    setError(null);
  };

  const closeModal = () => {
    setModal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nameTrim = name.trim();
    if (!nameTrim) {
      setError('Название не может быть пустым');
      return;
    }
    if (modal?.tag) {
      updateTag.mutate(
        { id: modal.tag.id, data: { name: nameTrim, description: description.trim() || undefined } },
        {
          onSuccess: closeModal,
          onError: (err) => setError(getErrorMessage(err)),
        }
      );
    } else {
      createTag.mutate(
        { name: nameTrim, description: description.trim() || undefined },
        {
          onSuccess: closeModal,
          onError: (err) => setError(getErrorMessage(err)),
        }
      );
    }
  };

  const handleDelete = (tag: TagItem) => {
    setDeleteConfirm(tag);
    setDeleteError(null);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    deleteTag.mutate(deleteConfirm.id, {
      onSuccess: () => setDeleteConfirm(null),
      onError: (err) => setDeleteError(getErrorMessage(err)),
    });
  };

  if (isLoading) {
    return <p className="text-gray-500 dark:text-gray-400">Загрузка...</p>;
  }
  if (isError) {
    return <p className="text-red-600 dark:text-red-400">Не удалось загрузить теги</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Теги</h1>
      <div className="mb-4">
        <Button onClick={openCreate}>Добавить</Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Название</th>
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Описание</th>
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Действия</th>
            </tr>
          </thead>
          <tbody>
            {(tags ?? []).map((tag) => (
              <tr key={tag.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-3 text-gray-900 dark:text-gray-100">{tag.name}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">
                  {tag.description ?? '—'}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => openEdit(tag)}
                    className="mr-2 text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(tag)}
                    className="text-red-600 hover:underline dark:text-red-400"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tag-modal-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h2 id="tag-modal-title" className="mb-4 text-lg font-semibold">
              {modal.tag ? 'Редактировать тег' : 'Новый тег'}
            </h2>
            <form onSubmit={handleSubmit}>
              <Input
                label="Название"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <div className="mt-3">
                <Textarea
                  label="Описание"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <Button type="submit" disabled={createTag.isPending || updateTag.isPending}>
                  {modal.tag ? 'Сохранить' : 'Создать'}
                </Button>
                <Button type="button" variant="secondary" onClick={closeModal}>
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 dark:bg-gray-800">
            <p className="mb-2">
              Удалить тег «{deleteConfirm.name}»?
            </p>
            {deleteError && (
              <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
                {deleteError}
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="danger" onClick={confirmDelete} disabled={deleteTag.isPending}>
                Удалить
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteConfirm(null);
                  setDeleteError(null);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
