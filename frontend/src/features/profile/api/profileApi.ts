import { apiClient } from '../../../shared/api/axios';
import type {
  Profile,
  UpdateProfileData,
  SetRoleData,
  UpdateMentorData,
  UpdateMenteeData,
  Mentor,
  Mentee,
} from '../../../shared/types/profile';

export const profileApi = {
  getMyProfile(): Promise<Profile | null> {
    return apiClient.get<Profile | null>('/profiles/me').then((res) => res.data ?? null);
  },

  updateProfile(data: UpdateProfileData): Promise<Profile> {
    return apiClient.put<Profile>('/profiles/me', data).then((res) => res.data);
  },

  setRole(data: SetRoleData): Promise<Profile> {
    return apiClient.post<Profile>('/profiles/me/role', data).then((res) => res.data);
  },

  uploadAvatar(avatar: string): Promise<Profile> {
    return apiClient.post<Profile>('/profiles/me/avatar', { avatar }).then((res) => res.data);
  },

  getMyMentorProfile(): Promise<Mentor> {
    return apiClient.get<Mentor>('/mentors/me').then((res) => res.data);
  },

  updateMentorProfile(data: UpdateMentorData): Promise<Mentor> {
    return apiClient.put<Mentor>('/mentors/me', data).then((res) => res.data);
  },

  getMyMenteeProfile(): Promise<Mentee> {
    return apiClient.get<Mentee>('/mentees/me').then((res) => res.data);
  },

  updateMenteeProfile(data: UpdateMenteeData): Promise<Mentee> {
    return apiClient.put<Mentee>('/mentees/me', data).then((res) => res.data);
  },

  getNotificationSettings(): Promise<{ emailEnabled: boolean }> {
    return apiClient.get<{ emailEnabled: boolean }>('/profiles/me/notification-settings').then((res) => res.data);
  },

  updateNotificationSettings(data: { emailEnabled: boolean }): Promise<{ emailEnabled: boolean }> {
    return apiClient
      .patch<{ emailEnabled: boolean }>('/profiles/me/notification-settings', data)
      .then((res) => res.data);
  },
};
