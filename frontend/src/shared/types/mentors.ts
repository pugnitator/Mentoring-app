export interface Tag {
  id: string;
  name: string;
  description?: string | null;
}

export interface MentorCatalogItem {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  specialty: string;
  acceptsRequests: boolean;
  tags: { id: string; name: string }[];
  favoritesCount: number;
}

export interface MentorsCatalogResponse {
  items: MentorCatalogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface MentorDetailProfile {
  firstName: string;
  lastName: string;
  middleName: string | null;
  specialty: string;
  level: string | null;
  bio: string | null;
  city: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface MentorDetail {
  id: string;
  createdAt: string;
  description: string;
  workFormat: string;
  acceptsRequests: boolean;
  statusComment: string | null;
  maxMentees: number;
  tags: { id: string; name: string }[];
  profile: MentorDetailProfile;
  favoritesCount?: number;
}

/** Элемент списка избранного (данные ментора для карточки) */
export interface FavoriteMentorItem {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  specialty: string;
  acceptsRequests: boolean;
  tags: { id: string; name: string }[];
  favoritesCount: number;
}

export interface MentorsCatalogParams {
  page?: number;
  limit?: number;
  specialty?: string;
  tagIds?: string[];
  acceptsRequests?: boolean;
}
