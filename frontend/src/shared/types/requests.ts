export type RequestStatus = 'SENT' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface RequestMenteeProfile {
  firstName: string;
  lastName: string;
  specialty?: string;
}

export interface RequestMentorProfile {
  firstName: string;
  lastName: string;
  specialty?: string;
}

export interface RequestListItem {
  id: string;
  menteeId: string;
  mentorId: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  /** Дата завершения менторства (из связи) */
  completedAt?: string | null;
  mentee?: {
    id: string;
    profile: RequestMenteeProfile;
    goal?: string;
  };
  mentor?: {
    id: string;
    profile: RequestMentorProfile;
  };
}

export interface RequestWithContact extends RequestListItem {
  menteeContact?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateRequestBody {
  mentorId: string;
  message: string;
}
