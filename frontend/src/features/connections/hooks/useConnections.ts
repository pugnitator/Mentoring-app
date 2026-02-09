import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionsApi } from '../api/connectionsApi';
import type { DetachRequestBody } from '../../../shared/types/connections';

const keys = {
  list: ['connections'] as const,
};

export function useConnections(enabled: boolean) {
  return useQuery({
    queryKey: keys.list,
    queryFn: () => connectionsApi.getConnections(),
    enabled,
  });
}

export function useCompleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (connectionId: string) => connectionsApi.complete(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.list });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDetachConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, data }: { connectionId: string; data?: DetachRequestBody }) =>
      connectionsApi.detach(connectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.list });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
