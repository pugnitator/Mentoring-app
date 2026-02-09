export type ProfileLevel = 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD';
export type SearchStatus = 'SEARCHING' | 'NOT_SEARCHING';
export type PlatformRole = 'MENTOR' | 'MENTEE';

export interface Mentor {
  id: string;
  profileId: string;
  description: string;
  workFormat: string;
  acceptsRequests: boolean;
  statusComment: string | null;
  maxMentees: number;
  tags: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Mentee {
  id: string;
  profileId: string;
  goal: string;
  desiredPosition: string | null;
  searchStatus: SearchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  specialty: string;
  level: ProfileLevel | null;
  bio: string | null;
  city: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  mentor: Mentor | null;
  mentee: Mentee | null;
  user?: { role: 'USER' | 'ADMIN' };
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  middleName?: string;
  specialty: string;
  level?: ProfileLevel;
  bio?: string;
  city?: string;
}

export interface SetRoleData {
  role: PlatformRole;
}

export interface UpdateMentorData {
  description: string;
  workFormat: string;
  acceptsRequests: boolean;
  statusComment?: string;
  maxMentees: number;
  tagIds: string[];
}

export interface UpdateMenteeData {
  goal: string;
  desiredPosition?: string;
  searchStatus: SearchStatus;
}
