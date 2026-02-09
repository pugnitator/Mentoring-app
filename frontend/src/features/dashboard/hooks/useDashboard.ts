import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

const keys = {
  dashboard: ['dashboard'] as const,
};

export function useDashboard(enabled: boolean) {
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: () => dashboardApi.getDashboard(),
    enabled,
  });
}
