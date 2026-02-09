import { apiClient } from '../../../shared/api/axios';
import type { AuthResponse, RegisterData, LoginData } from '../../../shared/types/auth';

// TODO: в будущем добавить подтверждение регистрации по email
// TODO: в будущем добавить сброс пароля (forgot password, reset password)

export const authApi = {
  register(data: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data).then((res) => res.data);
  },

  login(data: LoginData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data).then((res) => res.data);
  },

  refresh(refreshToken: string): Promise<{ accessToken: string }> {
    return apiClient
      .post<{ accessToken: string }>('/auth/refresh', { refreshToken })
      .then((res) => res.data);
  },

  logout(): Promise<void> {
    return apiClient.post('/auth/logout').then(() => undefined);
  },
};
