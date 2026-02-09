import { apiClient } from '../../../shared/api/axios';
import type { FavoriteMentorItem } from '../../../shared/types/mentors';

export const favoritesApi = {
  getFavorites(): Promise<FavoriteMentorItem[]> {
    return apiClient.get<FavoriteMentorItem[]>('/favorites').then((res) => res.data);
  },

  addFavorite(mentorId: string): Promise<{ id: string; menteeId: string; mentorId: string; createdAt: string }> {
    return apiClient.post('/favorites', { mentorId }).then((res) => res.data);
  },

  removeFavorite(mentorId: string): Promise<void> {
    return apiClient.delete(`/favorites/${mentorId}`);
  },
};
