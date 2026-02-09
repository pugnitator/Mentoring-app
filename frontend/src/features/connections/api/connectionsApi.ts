import { apiClient } from '../../../shared/api/axios';
import type { ConnectionItem, DetachRequestBody } from '../../../shared/types/connections';

export const connectionsApi = {
  getConnections(): Promise<ConnectionItem[]> {
    return apiClient.get<ConnectionItem[]>('/connections').then((res) => res.data);
  },

  complete(connectionId: string): Promise<ConnectionItem> {
    return apiClient.patch<ConnectionItem>(`/connections/${connectionId}/complete`).then((res) => res.data);
  },

  detach(connectionId: string, data: DetachRequestBody = {}): Promise<ConnectionItem> {
    return apiClient.post<ConnectionItem>(`/connections/${connectionId}/detach`, data).then((res) => res.data);
  },
};
