import { apiClient } from '../../../shared/api/axios';
import type { DashboardResponse } from '../../../shared/types/dashboard';

export const dashboardApi = {
  getDashboard(): Promise<DashboardResponse> {
    return apiClient.get<DashboardResponse>('/dashboard').then((res) => res.data);
  },
};
