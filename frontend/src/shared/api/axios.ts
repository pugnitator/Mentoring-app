import axios, { AxiosError } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !(originalRequest.headers as Record<string, unknown>)['X-Retry']) {
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          const { data } = await axios.post<{ accessToken: string }>(`${baseURL}/auth/refresh`, {
            refreshToken: refresh,
          });
          setTokens(data.accessToken, refresh);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          (originalRequest.headers as Record<string, unknown>)['X-Retry'] = '1';
          return apiClient(originalRequest);
        } catch {
          clearTokens();
          window.location.href = '/login';
        }
      } else {
        const url = typeof originalRequest.url === 'string' ? originalRequest.url : '';
        if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);
