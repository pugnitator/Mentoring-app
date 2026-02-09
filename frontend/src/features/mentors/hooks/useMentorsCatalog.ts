import { useQuery } from '@tanstack/react-query';
import { mentorsApi } from '../api/mentorsApi';
import type { MentorsCatalogParams } from '../../../shared/types/mentors';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => mentorsApi.getTags(),
  });
}

export function useMentorsCatalog(params: MentorsCatalogParams) {
  return useQuery({
    queryKey: ['mentors', 'catalog', params],
    queryFn: () => mentorsApi.getMentors(params),
  });
}

export function useMentorById(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['mentors', id],
    queryFn: () => mentorsApi.getMentorById(id!),
    enabled: enabled && !!id,
  });
}
