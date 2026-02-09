import { apiClient } from '../../../shared/api/axios';
import type {
  Tag,
  MentorsCatalogResponse,
  MentorDetail,
  MentorsCatalogParams,
} from '../../../shared/types/mentors';

export const mentorsApi = {
  getTags(): Promise<Tag[]> {
    return apiClient.get<Tag[]>('/tags').then((res) => res.data);
  },

  getMentors(params: MentorsCatalogParams = {}): Promise<MentorsCatalogResponse> {
    const searchParams = new URLSearchParams();
    if (params.page != null) searchParams.set('page', String(params.page));
    if (params.limit != null) searchParams.set('limit', String(params.limit));
    if (params.specialty) searchParams.set('specialty', params.specialty);
    if (params.tagIds?.length) searchParams.set('tagIds', params.tagIds.join(','));
    if (params.acceptsRequests !== undefined) {
      searchParams.set('acceptsRequests', params.acceptsRequests ? 'true' : 'false');
    }
    const query = searchParams.toString();
    return apiClient
      .get<MentorsCatalogResponse>(`/mentors${query ? `?${query}` : ''}`)
      .then((res) => res.data);
  },

  getMentorById(id: string): Promise<MentorDetail> {
    return apiClient.get<MentorDetail>(`/mentors/${id}`).then((res) => res.data);
  },
};
