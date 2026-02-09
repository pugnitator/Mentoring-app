import { apiClient } from '../../../shared/api/axios';

export interface TagItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface SpecialtyItem {
  id: string;
  name: string;
  sortOrder: number | null;
  createdAt: string;
}

export interface UserListItem {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  specialty: string | null;
  isMentor: boolean;
  isMentee: boolean;
}

export interface UsersResponse {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
}

export const adminApi = {
  getTags(): Promise<TagItem[]> {
    return apiClient.get<TagItem[]>('/admin/tags').then((res) => res.data);
  },

  createTag(data: { name: string; description?: string }): Promise<TagItem> {
    return apiClient.post<TagItem>('/admin/tags', data).then((res) => res.data);
  },

  updateTag(id: string, data: { name?: string; description?: string }): Promise<TagItem> {
    return apiClient.patch<TagItem>(`/admin/tags/${id}`, data).then((res) => res.data);
  },

  deleteTag(id: string): Promise<void> {
    return apiClient.delete(`/admin/tags/${id}`);
  },

  getSpecialties(): Promise<SpecialtyItem[]> {
    return apiClient.get<SpecialtyItem[]>('/admin/specialties').then((res) => res.data);
  },

  createSpecialty(data: { name: string; sortOrder?: number }): Promise<SpecialtyItem> {
    return apiClient.post<SpecialtyItem>('/admin/specialties', data).then((res) => res.data);
  },

  updateSpecialty(
    id: string,
    data: { name?: string; sortOrder?: number }
  ): Promise<SpecialtyItem> {
    return apiClient.patch<SpecialtyItem>(`/admin/specialties/${id}`, data).then((res) => res.data);
  },

  deleteSpecialty(id: string): Promise<void> {
    return apiClient.delete(`/admin/specialties/${id}`);
  },

  getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    email?: string;
  }): Promise<UsersResponse> {
    return apiClient
      .get<UsersResponse>('/admin/users', { params })
      .then((res) => res.data);
  },
};
