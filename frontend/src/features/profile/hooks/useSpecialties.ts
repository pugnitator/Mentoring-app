import { useQuery } from '@tanstack/react-query';
import { specialtiesApi } from '../../admin/api/specialtiesApi';
import type { SearchableSelectOption } from '../../../shared/ui/SearchableSelect';

const key = ['specialties'] as const;

export function useSpecialties(enabled = true) {
  const query = useQuery({
    queryKey: key,
    queryFn: () => specialtiesApi.getSpecialties(),
    enabled,
  });

  const options: SearchableSelectOption[] =
    query.data?.map((s) => ({ value: s.name, search: s.name })) ?? [];

  return { ...query, options };
}
