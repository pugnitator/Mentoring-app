import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api/adminApi';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';

const key = ['admin', 'users'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, isError } = useQuery({
    queryKey: [key, page, email, roleFilter, statusFilter],
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit: 20,
        ...(email.trim() && { email: email.trim() }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      }),
  });

  if (isLoading) return <p className="text-gray-500 dark:text-gray-400">Загрузка...</p>;
  if (isError) return <p className="text-red-600 dark:text-red-400">Не удалось загрузить пользователей</p>;

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
        Пользователи
      </h1>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="w-48">
          <Input
            label="Поиск по email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Роль</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Все</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Статус</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Все</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={() => {
              setPage(1);
            }}
          >
            Применить
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Email</th>
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Учётная роль</th>
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">На платформе</th>
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Статус</th>
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Имя / Фамилия</th>
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Специальность</th>
              <th className="p-3 font-medium text-gray-900 dark:text-gray-100">Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((u) => {
              const platformRoles: string[] = [];
              if (u.isMentor) platformRoles.push('Ментор');
              if (u.isMentee) platformRoles.push('Менти');
              const platformLabel = platformRoles.length > 0 ? platformRoles.join(', ') : '—';
              return (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-3 text-gray-900 dark:text-gray-100">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{platformLabel}</td>
                  <td className="p-3">{u.status}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">{u.specialty ?? '—'}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Назад
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Вперёд
          </Button>
        </div>
      )}
    </div>
  );
}
