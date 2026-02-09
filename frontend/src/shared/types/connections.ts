export type ConnectionStatus = 'ACTIVE' | 'DETACHED';

export interface ConnectionContact {
  email: string;
  firstName: string;
  lastName: string;
}

export interface ConnectionItem {
  id: string;
  mentorId: string;
  menteeId: string;
  requestId: string;
  status: ConnectionStatus;
  createdAt: string;
  /** Дата отметки «Курс завершён»; не обнуляется при отвязке */
  completedAt: string | null;
  detachedAt: string | null;
  reason: string | null;
  contact: ConnectionContact | null;
}

export interface DetachRequestBody {
  reason?: string;
}
