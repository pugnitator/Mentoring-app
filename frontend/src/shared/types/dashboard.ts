export type DashboardRole = 'MENTOR' | 'MENTEE';

export interface DashboardSummary {
  pendingRequestsCount: number;
  activeConnectionsCount: number;
  completedMentorshipsCount: number;
}

export interface DashboardOtherParty {
  firstName: string;
  lastName: string;
}

/** Заявка в виджете «Требуют решения» (ментор) или «Ожидают ответа» (менти) */
export interface DashboardPendingRequest {
  id: string;
  status: string;
  createdAt: string;
  messagePreview: string;
  /** Для ментора */
  mentee?: {
    id: string;
    firstName: string;
    lastName: string;
    goal?: string;
  };
  /** Для менти */
  mentor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
}

export interface DashboardConnectionItem {
  id: string;
  requestId: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  otherParty: DashboardOtherParty;
}

export interface DashboardCompletedItem {
  id: string;
  requestId: string;
  status: string;
  completedAt: string;
  detachedAt: string | null;
  otherParty: DashboardOtherParty;
}

export interface DashboardWidgets {
  pendingRequests: DashboardPendingRequest[];
  activeConnections: DashboardConnectionItem[];
  completedMentorships: DashboardCompletedItem[];
}

export interface DashboardResponse {
  role: DashboardRole;
  summary: DashboardSummary;
  widgets: DashboardWidgets;
}
