import { apiClient } from '../../../shared/api/axios';

export interface SpecialtyOption {
  id: string;
  name: string;
  sortOrder: number | null;
}

export const specialtiesApi = {
  getSpecialties(): Promise<SpecialtyOption[]> {
    return apiClient.get<SpecialtyOption[]>('/specialties').then((res) => res.data);
  },
};
