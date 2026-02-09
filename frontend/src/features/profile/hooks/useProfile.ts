import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type {
  UpdateProfileData,
  SetRoleData,
  UpdateMentorData,
  UpdateMenteeData,
} from '../../../shared/types/profile';

const profileKeys = {
  me: ['profiles', 'me'] as const,
};

export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: () => profileApi.getMyProfile(),
    enabled,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileData) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}

export function useSetRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SetRoleData) => profileApi.setRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (avatar: string) => profileApi.uploadAvatar(avatar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
}

export function useMyMentorProfile(enabled: boolean) {
  return useQuery({
    queryKey: ['mentors', 'me'],
    queryFn: () => profileApi.getMyMentorProfile(),
    enabled,
  });
}

export function useUpdateMentorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMentorData) => profileApi.updateMentorProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      queryClient.invalidateQueries({ queryKey: ['mentors', 'me'] });
    },
  });
}

export function useMyMenteeProfile(enabled: boolean) {
  return useQuery({
    queryKey: ['mentees', 'me'],
    queryFn: () => profileApi.getMyMenteeProfile(),
    enabled,
  });
}

export function useUpdateMenteeProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMenteeData) => profileApi.updateMenteeProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      queryClient.invalidateQueries({ queryKey: ['mentees', 'me'] });
    },
  });
}

const notificationSettingsKey = ['profiles', 'me', 'notification-settings'] as const;

export function useNotificationSettings(enabled = true) {
  return useQuery({
    queryKey: notificationSettingsKey,
    queryFn: () => profileApi.getNotificationSettings(),
    enabled,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { emailEnabled: boolean }) => profileApi.updateNotificationSettings(data),
    onSuccess: (data) => {
      queryClient.setQueryData(notificationSettingsKey, data);
    },
  });
}
