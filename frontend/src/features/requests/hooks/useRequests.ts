import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '../api/requestsApi';
import type { CreateRequestBody } from '../../../shared/types/requests';

const keys = {
  incoming: ['requests', 'incoming'] as const,
  outgoing: ['requests', 'outgoing'] as const,
};

export function useIncomingRequests(enabled: boolean) {
  return useQuery({
    queryKey: keys.incoming,
    queryFn: () => requestsApi.getIncoming(),
    enabled,
  });
}

export function useOutgoingRequests(enabled: boolean) {
  return useQuery({
    queryKey: keys.outgoing,
    queryFn: () => requestsApi.getOutgoing(),
    enabled,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRequestBody) => requestsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.outgoing });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAcceptRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => requestsApi.accept(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.incoming });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => requestsApi.reject(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.incoming });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
