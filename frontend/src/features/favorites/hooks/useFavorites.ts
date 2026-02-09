import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '../api/favoritesApi';

export const FAVORITES_QUERY_KEY = ['favorites'] as const;

export function useFavorites(enabled = true) {
  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => favoritesApi.getFavorites(),
    enabled,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mentorId: string) => favoritesApi.addFavorite(mentorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mentorId: string) => favoritesApi.removeFavorite(mentorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}
